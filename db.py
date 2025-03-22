import os
from urllib.parse import urlparse
import psycopg2
from dotenv import load_dotenv

# ✅ Load .env variables
load_dotenv()

def get_db_connection():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        raise Exception("DATABASE_URL not found in environment variables.")

    result = urlparse(db_url)

    return psycopg2.connect(
        dbname=result.path[1:],  # Strip leading slash from /dbname
        user=result.username,
        password=result.password,
        host=result.hostname,
        port=result.port or 5432,
        sslmode="require"
    )