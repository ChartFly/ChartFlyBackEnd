# control_console/database.py

import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

# For sync fallback (used in login, etc.)
def get_db_connection():
    return psycopg2.connect(
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
        sslmode="require"
    )