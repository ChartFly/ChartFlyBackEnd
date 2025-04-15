# ==========================================================
# ✅ FILE: control_console/database.py
# 📌 PURPOSE: Establish asyncpg DB connection pool
# 🛠️ STATUS: Active (MPA Phase I) — Author: Captain & Chatman
# ==========================================================

import logging
import os

import asyncpg

# ✅ Setup logging
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


# ✅ Build DATABASE_URL from individual parts (for local dev)
def build_database_url():
    user = os.getenv("DB_USER")
    password = os.getenv("DB_PASS")
    host = os.getenv("DB_HOST")
    port = os.getenv("DB_PORT", "5432")
    dbname = os.getenv("DB_NAME")
    sslmode = os.getenv("DB_SSL", "require")

    if not all([user, password, host, dbname]):
        raise EnvironmentError(
            "❌ Missing one or more required DB environment variables for fallback URL."
        )

    return f"postgresql://{user}:{password}@{host}:{port}/{dbname}?sslmode={sslmode}"


# ✅ Resolve DATABASE_URL from environment or fallback
DATABASE_URL = os.getenv("DATABASE_URL") or build_database_url()


# ✅ Create and return an asyncpg connection pool
async def create_db_pool():
    try:
        logger.info("📡 Connecting to PostgreSQL...")
        pool = await asyncpg.create_pool(DATABASE_URL)
        logger.info("✅ Database connection pool created successfully")
        return pool
    except Exception as e:
        logger.error("❌ Failed to create DB pool: %s", e)
        raise
