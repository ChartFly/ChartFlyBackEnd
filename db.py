import psycopg2
import os

def get_db_connection():
    return psycopg2.connect(
        host=os.getenv("NEON_HOST"),
        database=os.getenv("NEON_DB"),
        user=os.getenv("NEON_USER"),
        password=os.getenv("NEON_PASSWORD"),
        port=os.getenv("NEON_PORT", 5432)
    )