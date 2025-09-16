"""
Script to:
1. Create database tables if they do not exist based on the final schema.
2. Fetch profile metadata from PostgreSQL.
3. Generate descriptive text summaries for each profile.
4. Populate (or update) a ChromaDB vector store with these summaries.

This script is idempotent, meaning it can be run multiple times safely.
"""
"""
Script to create tables, fetch profile metadata from PostgreSQL, generate summaries,
and populate a ChromaDB vector store.
"""
import sys
import os
import psycopg2
import time
import chromadb
from geopy.geocoders import Nominatim

# Add the project root to the Python path to allow importing from 'src'
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from src.core.config import settings # <-- THIS LINE MUST START WITH 'src.'

# ... (the rest of the script is correct)
# --- ChromaDB Setup ---
# Connects to the persistent storage location defined in the folder structure
client = chromadb.PersistentClient(path="./data/chroma_db")
collection = client.get_or_create_collection(name="argo_profiles")

# --- Geocoding with Caching ---
geolocator = Nominatim(user_agent="argo_floatchat_app_v2")
location_cache = {}

def get_location_name(lat, lon):
    """Performs reverse geocoding with an in-memory cache to reduce API calls."""
    cache_key = (round(lat, 1), round(lon, 1))
    if cache_key in location_cache:
        return location_cache[cache_key]
    try:
        print(f"  [i] Geocoding coordinates: ({lat:.2f}, {lon:.2f})...")
        location = geolocator.reverse(f"{lat}, {lon}", language='en', timeout=10)
        time.sleep(1)  # Respect the Nominatim API usage policy (1 call/sec)
        location_name = location.raw.get('display_name', "Open Ocean") if location else "Open Ocean"
        location_cache[cache_key] = location_name
        return location_name
    except Exception as e:
        print(f"  [!] Geocoding error: {e}")
        location_cache[cache_key] = "Location unavailable"
        return "Location unavailable"

def create_tables(cursor):
    """Creates the database tables based on the new schema if they don't already exist."""
    commands = (
        """
        CREATE TABLE IF NOT EXISTS floats (
            platform_id INTEGER PRIMARY KEY,
            project_name VARCHAR(100),
            launch_date TIMESTAMP WITH TIME ZONE,
            launch_latitude DOUBLE PRECISION,
            launch_longitude DOUBLE PRECISION,
            float_type VARCHAR(10)
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS profiles (
            profile_id BIGSERIAL PRIMARY KEY,
            platform_id INTEGER NOT NULL REFERENCES floats(platform_id) ON DELETE CASCADE,
            cycle_number INTEGER NOT NULL,
            profile_date TIMESTAMP WITH TIME ZONE NOT NULL,
            latitude DOUBLE PRECISION NOT NULL,
            longitude DOUBLE PRECISION NOT NULL,
            location GEOGRAPHY(Point, 4326)
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS measurements (
            measurement_id BIGSERIAL PRIMARY KEY,
            profile_id BIGINT NOT NULL REFERENCES profiles(profile_id) ON DELETE CASCADE,
            pressure DOUBLE PRECISION NOT NULL,
            temperature DOUBLE PRECISION,
            salinity DOUBLE PRECISION,
            doxy DOUBLE PRECISION,
            chla DOUBLE PRECISION,
            nitrate DOUBLE PRECISION,
            ph_in_situ_total DOUBLE PRECISION,
            bbp700 DOUBLE PRECISION
        );
        """
    )
    print("Creating database tables if they don't exist...")
    for command in commands:
        cursor.execute(command)
    print("Tables created or already exist.")

def main():
    """Connects to Postgres, generates summaries, and populates ChromaDB."""
    print("--- Starting Data Ingestion and Vectorization Script ---")
    
    conn = None
    try:
        print(f"Connecting to PostgreSQL database at {settings.DB_HOST}...")
        conn = psycopg2.connect(settings.PSYCOPG2_DATABASE_URL)
        cursor = conn.cursor()

        # Step 1: Create tables if they don't exist
        create_tables(cursor)
        conn.commit()
        
        # IMPORTANT: This script assumes you have a separate process to load
        # your raw NetCDF data into the PostgreSQL tables created above.
        # This script's primary job is to create vector embeddings from the
        # data already present in PostgreSQL.

        print("\nFetching profile data from database to populate vector store...")
        sql_query = """
            SELECT
                p.profile_id, p.platform_id, p.cycle_number, p.profile_date,
                p.latitude, p.longitude, f.float_type
            FROM profiles p
            JOIN floats f ON p.platform_id = f.platform_id
            ORDER BY p.profile_id;
        """
        cursor.execute(sql_query)
        profiles = cursor.fetchall()
        
        if not profiles:
            print("\nWARNING: No profiles found in the database.")
            print("Please ensure your ARGO data has been loaded into the PostgreSQL tables.")
            print("Script finished.")
            return

        print(f"Found {len(profiles)} profiles in PostgreSQL to process for vectorization.")
        
        documents_to_add = []
        metadatas_to_add = []
        ids_to_add = []
        batch_size = 200

        for profile in profiles:
            (profile_id, platform_id, cycle_number, profile_date, lat, lon, float_type) = profile
            location_name = get_location_name(lat, lon)
            
            description = (
                f"An Argo float profile of type '{float_type}' from the {location_name.split(',')[0]}. "
                f"This profile contains measurements taken on {profile_date.strftime('%Y-%m-%d')}."
            )
            
            summary = (
                f"Type: {float_type}_Float ID: {platform_id} Cycle: {cycle_number} "
                f"Date: {profile_date.strftime('%Y-%m-%d')} Location: {location_name}\n"
                f"Description: {description}"
            )

            documents_to_add.append(summary)
            metadatas_to_add.append({"platform_id": int(platform_id), "cycle_number": int(cycle_number)})
            ids_to_add.append(str(profile_id))

            if len(ids_to_add) >= batch_size:
                collection.upsert(documents=documents_to_add, metadatas=metadatas_to_add, ids=ids_to_add)
                print(f"\n[+] Upserted batch of {len(ids_to_add)} summaries to ChromaDB.")
                documents_to_add.clear()
                metadatas_to_add.clear()
                ids_to_add.clear()

        if documents_to_add:
            collection.upsert(documents=documents_to_add, metadatas=metadatas_to_add, ids=ids_to_add)
            print(f"\n[+] Upserted final batch of {len(ids_to_add)} summaries to ChromaDB.")

    except psycopg2.Error as e:
        print(f"\n[!!!] Database error: {e}")
    finally:
        if conn:
            conn.close()
            print("\nDatabase connection closed.")
        print("--- Script Finished ---")

if __name__ == "__main__":
    main()