import os
import psycopg2
import numpy as np
from psycopg2 import extras
from netCDF4 import Dataset, num2date
from datetime import datetime

# === Database connection ===
DB_CONFIG = {
    "dbname": "",
    "user": "",
    "password": "",
    "host": "",
    "port": 0
}

ARGO_DIR = "/Users/saksham/Desktop/python-scrape/argo_data"


def connect_db():
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        print("Database connection successful.")
        return conn
    except Exception as e:
        print(f"[X] Could not connect to database: {e}")
        exit(1)

# CORRECTED HELPER: Handles byte arrays from NetCDF
def clean_nc_string(raw_val):
    """Decodes a NetCDF byte/char array into a clean Python string."""
    if raw_val is None:
        return None
    # Join bytes, decode, then REPLACE all null chars and strip whitespace.
    # This is more robust than just stripping nulls from the ends.
    return b''.join(raw_val).decode('utf-8').replace('\x00', '').strip()


def parse_launch_date(date_str):
    """Convert YYYYMMDDHHMISS string to datetime."""
    if not date_str:
        return None
    try:
        return datetime.strptime(date_str, "%Y%m%d%H%M%S")
    except (ValueError, TypeError):
        return None


def get_attr_or_var(ds, name):
    """Try to read from global attributes first, then variables."""
    if name in ds.__dict__:
        return ds.__dict__[name]
    if name in ds.variables:
        return ds.variables[name][:]
    return None

# CORRECTED FUNCTION: Handles data types and returns a success/fail boolean
def insert_float(conn, float_id, ds):
    """Insert float metadata if not already present. Returns True on success, False on failure."""
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT platform_id FROM floats WHERE platform_id = %s", (float_id,))
            if cur.fetchone() is not None:
                return True # Already exists, count as success

            # --- Data Cleaning ---
            # 1. Clean the project name string
            project_raw = get_attr_or_var(ds, "PROJECT_NAME")
            project = clean_nc_string(project_raw)

            # 2. Clean the date string before parsing
            launch_date_raw = get_attr_or_var(ds, "LAUNCH_DATE")
            launch_date_str = clean_nc_string(launch_date_raw)
            launch_date = parse_launch_date(launch_date_str)

            # 3. Extract scalar float values from NumPy/MaskedArrays
            launch_lat_raw = get_attr_or_var(ds, "LAUNCH_LATITUDE")
            launch_lon_raw = get_attr_or_var(ds, "LAUNCH_LONGITUDE")

            # Use .item() to get the Python scalar from the array
            launch_lat = launch_lat_raw.item() if hasattr(launch_lat_raw, 'item') else launch_lat_raw
            launch_lon = launch_lon_raw.item() if hasattr(launch_lon_raw, 'item') else launch_lon_raw

            print(f"[DEBUG] Float {float_id} → project='{project}', "
                  f"launch_date_str='{launch_date_str}', parsed={launch_date}, "
                  f"lat={launch_lat}, lon={launch_lon}")

            cur.execute("""
                INSERT INTO floats (platform_id, project_name, launch_date, launch_latitude, launch_longitude)
                VALUES (%s, %s, %s, %s, %s)
            """, (float_id, project, launch_date, launch_lat, launch_lon))
            conn.commit()
            print(f"[✓] Inserted float {float_id}")
            return True

    except Exception as e:
        conn.rollback()
        print(f"[X] Error inserting float {float_id}: {e}")
        return False # Signal failure


def process_float(conn, float_id, nc_path, meta_file):
    try:
        with Dataset(meta_file, "r") as dsM, Dataset(nc_path, "r") as ds:
            if not insert_float(conn, float_id, dsM):
                print(f"[!] Skipping profiles for float {float_id} due to insertion failure.")
                return

            # --- CORRECTED VARIABLE HANDLING ---
            # Ensure 1D variables are always at least 1-dimensional
            times = np.atleast_1d(ds.variables["JULD"][:])
            lats = np.atleast_1d(ds.variables["LATITUDE"][:])
            lons = np.atleast_1d(ds.variables["LONGITUDE"][:])
            cycles = np.atleast_1d(ds.variables["CYCLE_NUMBER"][:])
            
            ref_time = ds.variables["JULD"].units

            # Ensure 2D measurement variables are always at least 2-dimensional
            pres = np.atleast_2d(ds.variables["PRES"][:])
            
            # Helper to safely get and shape variables
            def get_shaped_var(dataset, var_name):
                if var_name in dataset.variables:
                    return np.atleast_2d(dataset.variables[var_name][:])
                return None

            temps = get_shaped_var(ds, "TEMP")
            salts = get_shaped_var(ds, "PSAL")
            doxy = get_shaped_var(ds, "DOXY")
            chla = get_shaped_var(ds, "CHLA")
            nitrate = get_shaped_var(ds, "NITRATE")
            ph = get_shaped_var(ds, "PH_IN_SITU_TOTAL")
            bbp700 = get_shaped_var(ds, "BBP700")

            for i in range(len(times)):
                profile_date = num2date(times[i], units=ref_time).isoformat() if not np.ma.is_masked(times[i]) else None
                
                if np.ma.is_masked(lats[i]) or np.ma.is_masked(lons[i]) or np.ma.is_masked(cycles[i]):
                    print(f"[!] Skipping profile {i} for float {float_id} due to masked core data.")
                    continue

                lat = float(lats[i])
                lon = float(lons[i])
                cycle_number = int(cycles[i])

                with conn.cursor() as cur:
                    cur.execute("""
                        INSERT INTO profiles (platform_id, cycle_number, profile_date, latitude, longitude)
                        VALUES (%s, %s, %s, %s, %s)
                        ON CONFLICT (platform_id, cycle_number) DO NOTHING
                        RETURNING profile_id
                    """, (float_id, cycle_number, profile_date, lat, lon))
                    
                    result = cur.fetchone()
                    if result is None:
                        continue
                    profile_id = result[0]

                measurements = []
                # pres.shape[1] is the number of depth levels
                for j in range(pres.shape[1]):
                    # Check if the pressure at this level is masked
                    if np.ma.is_masked(pres[i, j]):
                        continue 

                    measurements.append((
                        profile_id,
                        float(pres[i, j]),
                        float(temps[i, j]) if temps is not None and not np.ma.is_masked(temps[i, j]) else None,
                        float(salts[i, j]) if salts is not None and not np.ma.is_masked(salts[i, j]) else None,
                        float(doxy[i, j]) if doxy is not None and not np.ma.is_masked(doxy[i, j]) else None,
                        float(chla[i, j]) if chla is not None and not np.ma.is_masked(chla[i, j]) else None,
                        float(nitrate[i, j]) if nitrate is not None and not np.ma.is_masked(nitrate[i, j]) else None,
                        float(ph[i, j]) if ph is not None and not np.ma.is_masked(ph[i, j]) else None,
                        float(bbp700[i, j]) if bbp700 is not None and not np.ma.is_masked(bbp700[i, j]) else None,
                    ))
                
                if measurements:
                    with conn.cursor() as cur:
                        extras.execute_values(cur, """
                            INSERT INTO measurements (profile_id, pressure, temperature, salinity, doxy, chla, nitrate, ph_in_situ_total, bbp700)
                            VALUES %s
                        """, measurements)

            conn.commit()
            print(f"[✓] Ingested float {float_id} with {len(times)} profiles")

    except Exception as e:
        conn.rollback()
        print(f"[X] CRITICAL error on float {float_id}: {e}")
        import traceback
        traceback.print_exc()


def main():
    print("Starting ARGO data ingestion...")
    conn = connect_db()
    # Required for execute_values helper
    extras.register_uuid()

    for float_dir in os.listdir(ARGO_DIR):
        if not float_dir.isdigit():
            continue  # skip .DS_Store etc.

        float_id = int(float_dir)
        base_path = os.path.join(ARGO_DIR, float_dir)
        meta_file = os.path.join(base_path, f"{float_id}_meta.nc")
        sprof_file = os.path.join(base_path, f"{float_id}_Sprof.nc")
        prof_file = os.path.join(base_path, f"{float_id}_prof.nc")

        # Check that meta file exists
        if not os.path.exists(meta_file):
            print(f"[!] Meta file not found for float {float_id}, skipping.")
            continue

        if os.path.exists(sprof_file):
            nc_path = sprof_file
        elif os.path.exists(prof_file):
            nc_path = prof_file
        else:
            print(f"[!] Profile data file not found for float {float_id}, skipping.")
            continue

        process_float(conn, float_id, nc_path, meta_file)

    conn.close()
    print("Database connection closed.")


if __name__ == "__main__":
    main()