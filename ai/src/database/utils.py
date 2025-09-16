import pandas as pd
import psycopg2
from src.core.config import settings # <-- THIS LINE IS NOW CORRECTED

def execute_sql_to_df(query: str) -> pd.DataFrame:
    """
    Executes a SQL query on the PostgreSQL database and returns the result as a Pandas DataFrame.
    """
    try:
        # This function correctly uses the settings object passed to it
        with psycopg2.connect(settings.PSYCOPG2_DATABASE_URL) as conn:
            df = pd.read_sql_query(query, conn)
            return df
    except Exception as e:
        print(f"Error executing query: {e}")
        # Return an empty DataFrame on error
        return pd.DataFrame()