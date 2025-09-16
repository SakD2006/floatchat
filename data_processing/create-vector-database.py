#!/usr/bin/env python3
"""
build_chroma_from_argo.py

Extracts ARGO float data from a PostgreSQL database, engineers relevant
oceanographic features, creates high-quality text summaries for semantic search,
and upserts the embeddings and rich metadata into a ChromaDB collection.
"""

import os
import logging
from datetime import datetime
from typing import Dict, List, Tuple, Optional

import numpy as np
import psycopg2
import chromadb
from tqdm import tqdm
from sentence_transformers import SentenceTransformer
from psycopg2.extras import RealDictCursor

# --------------------------
# Logging Setup
# --------------------------
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# --------------------------
# Configuration
# --------------------------
DB_CONFIG = {
    "dbname": os.environ.get("PGDATABASE", "argo_db"),
    "user": os.environ.get("PGUSER", "postgres"),
    "password": os.environ.get("PGPASSWORD", "saksy999"),
    "host": os.environ.get("PGHOST", "localhost"),
    "port": os.environ.get("PGPORT", "5432")
}

CHROMA_DIR = "./argo_chroma_db"
COLLECTION_NAME = "argo_float_profiles"
BATCH_SIZE = 128
EMBED_MODEL = "all-MiniLM-L6-v2"
# Use a sentinel value for missing numeric metadata, as it's easier to filter than NaN or None
MISSING_VALUE = -999.0

# --------------------------
# Database Operations
# --------------------------
def fetch_aggregated_profiles() -> List[Dict]:
    """
    Fetches one row per profile, joining with the floats table to get float_type
    and aggregating all measurement data into arrays.
    """
    logger.info("Connecting to PostgreSQL and fetching data...")
    query = """
        SELECT
          p.profile_id,
          p.platform_id,
          p.cycle_number,
          p.profile_date,
          p.latitude,
          p.longitude,
          f.float_type,
          array_agg(m.pressure ORDER BY m.pressure) AS pressures,
          array_agg(m.temperature ORDER BY m.pressure) AS temperatures,
          array_agg(m.salinity ORDER BY m.pressure) AS salinities,
          array_agg(m.doxy ORDER BY m.pressure) AS doxys
        FROM profiles p
        LEFT JOIN measurements m ON p.profile_id = m.profile_id
        LEFT JOIN floats f ON p.platform_id = f.platform_id
        GROUP BY p.profile_id, f.float_type
        ORDER BY p.profile_id;
    """
    try:
        with psycopg2.connect(**DB_CONFIG) as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(query)
                rows = cur.fetchall()
        logger.info(f"Fetched {len(rows)} aggregated profiles from Postgres.")
        return rows
    except psycopg2.Error as e:
        logger.error(f"Database query failed: {e}")
        return []

# --------------------------
# Data Processing and Feature Engineering
# --------------------------
class ProfileProcessor:
    """Encapsulates all logic for transforming a DB row into a document and metadata."""

    def _clean_and_pair(self, arr1: List, arr2: List) -> Tuple[np.ndarray, np.ndarray]:
        """Safely pairs two measurement arrays, removing entries where either value is None."""
        if arr1 is None or arr2 is None:
            return np.array([]), np.array([])
        
        pairs = [(p, t) for p, t in zip(arr1, arr2) if p is not None and t is not None]
        if not pairs:
            return np.array([]), np.array([])
            
        unzipped = list(zip(*pairs))
        return np.array(unzipped[0]), np.array(unzipped[1])

    def _get_season(self, date: datetime) -> str:
        """Determines the season for the Northern Hemisphere."""
        if date.month in (12, 1, 2): return "Winter"
        if date.month in (3, 4, 5): return "Spring"
        if date.month in (6, 7, 8): return "Summer"
        return "Autumn"

    def calculate_metrics(self, row: Dict) -> Dict:
        """From a raw DB row, calculate all derived scientific and metadata features."""
        metrics = {"thermocline_depth": None, "sea_surface_temp": None, "max_pressure": None}
        
        pressures, temps = self._clean_and_pair(row.get("pressures"), row.get("temperatures"))
        salinities = np.array([s for s in row.get("salinities") or [] if s is not None])
        doxys = np.array([d for d in row.get("doxys") or [] if d is not None])

        if pressures.size > 0:
            metrics["max_pressure"] = np.max(pressures)
            # Sea surface temperature: average of top 10 dbar
            surface_mask = pressures <= 10
            if np.any(surface_mask):
                metrics["sea_surface_temp"] = np.mean(temps[surface_mask])

        if pressures.size >= 3:
            # Sort by pressure for gradient calculation
            sort_idx = np.argsort(pressures)
            sorted_p, sorted_t = pressures[sort_idx], temps[sort_idx]
            
            # Thermocline detection
            temp_gradient = np.gradient(sorted_t, sorted_p)
            metrics["thermocline_depth"] = sorted_p[np.argmin(temp_gradient)]

        metrics["mean_salinity"] = np.mean(salinities) if salinities.size > 0 else None
        metrics["mean_oxygen"] = np.mean(doxys) if doxys.size > 0 else None
        return metrics

    def create_summary_and_meta(self, row: Dict, metrics: Dict) -> Tuple[str, Dict]:
        """Creates the final text document and metadata dictionary."""
        # Create a rich, natural language summary for embedding
        float_type_desc = "Biogeochemical" if row.get('float_type') == 'BGC' else "core"
        date_obj = row['profile_date']
        
        summary_parts = [
            f"An oceanographic profile from a {float_type_desc} Argo float (ID {row['platform_id']}).",
            f"Data collected on {date_obj:%Y-%m-%d} during cycle {row['cycle_number']} in the {self._get_season(date_obj)}.",
            f"Location: latitude {row['latitude']:.3f}, longitude {row['longitude']:.3f}."
        ]
        if metrics["max_pressure"]:
            summary_parts.append(f"The profile extends to a maximum pressure of {metrics['max_pressure']:.1f} dbar.")
        if metrics["sea_surface_temp"]:
            summary_parts.append(f"Sea surface temperature was {metrics['sea_surface_temp']:.2f}°C.")
        if metrics["thermocline_depth"]:
            summary_parts.append(f"A distinct thermocline was detected near {metrics['thermocline_depth']:.1f} dbar.")
        if metrics["mean_salinity"]:
            summary_parts.append(f"The average salinity was {metrics['mean_salinity']:.2f} PSU.")
        
        summary = " ".join(summary_parts)
        
        # Create structured metadata for filtering
        metadata = {
            "profile_id": int(row["profile_id"]),
            "platform_id": int(row["platform_id"]),
            "cycle_number": int(row["cycle_number"]),
            "float_type": str(row.get("float_type", "Unknown")),
            "date": date_obj.strftime('%Y-%m-%d'),
            "year": date_obj.year,
            "month": date_obj.month,
            "season": self._get_season(date_obj),
            "lat": float(row["latitude"]),
            "lon": float(row["longitude"]),
            "max_pressure": float(metrics.get("max_pressure") or MISSING_VALUE),
            "sea_surface_temp": float(metrics.get("sea_surface_temp") or MISSING_VALUE),
            "thermocline_depth": float(metrics.get("thermocline_depth") or MISSING_VALUE),
        }
        return summary, metadata

# --------------------------
# Main Execution
# --------------------------
def main():
    rows = fetch_aggregated_profiles()
    if not rows:
        return

    logger.info(f"Initializing ChromaDB client at: {CHROMA_DIR}")
    chroma_client = chromadb.PersistentClient(path=CHROMA_DIR)
    collection = chroma_client.get_or_create_collection(COLLECTION_NAME)
    
    logger.info(f"Loading sentence-transformer model: {EMBED_MODEL}")
    model = SentenceTransformer(EMBED_MODEL)

    processor = ProfileProcessor()

    logger.info("Starting to process profiles, generate summaries, and create embeddings...")
    for i in tqdm(range(0, len(rows), BATCH_SIZE), desc="Processing Batches"):
        batch_rows = rows[i : i + BATCH_SIZE]
        
        batch_ids, batch_documents, batch_metadatas = [], [], []

        for row in batch_rows:
            # Skip profiles with no location data
            if row.get('latitude') is None or row.get('longitude') is None:
                continue

            metrics = processor.calculate_metrics(row)
            summary, metadata = processor.create_summary_and_meta(row, metrics)
            
            batch_ids.append(str(row['profile_id']))
            batch_documents.append(summary)
            batch_metadatas.append(metadata)

        if not batch_ids:
            continue
            
        batch_embeddings = model.encode(batch_documents, show_progress_bar=False).tolist()

        collection.upsert(
            ids=batch_ids,
            embeddings=batch_embeddings,
            documents=batch_documents,
            metadatas=batch_metadatas
        )
        
    logger.info("Successfully upserted all profiles to ChromaDB.")

if __name__ == "__main__":
    main()