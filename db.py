import os
import asyncpg
from dotenv import load_dotenv
import logging

# ✅ Load environment variables from .env file
load_dotenv()

# ✅ Set up logging
logging.basicConfig(level=logging.INFO)


# ✅ Return a connection pool (better for managing multiple connections)
async def get_db_pool():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        raise Exception("DATABASE_URL not found in environment variables.")

    try:
        # Create a connection pool instead of a single connection
        pool = await asyncpg.create_pool(dsn=db_url)
        logging.info("✅ Database connection pool established.")
        return pool
    except Exception as e:
        logging.error(f"❌ Error establishing database connection pool: {e}")
        raise


# ✅ Return a standalone asyncpg connection (fallback method)
async def get_db_connection():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        raise Exception("DATABASE_URL not found in environment variables.")

    try:
        connection = await asyncpg.connect(dsn=db_url)
        logging.info("✅ Database connection established.")
        return connection
    except Exception as e:
        logging.error(f"❌ Error establishing database connection: {e}")
        raise