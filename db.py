# db.py

import os
import asyncpg
from dotenv import load_dotenv

# ✅ Load environment variables from .env file
load_dotenv()

# ✅ Return a standalone asyncpg connection (not pooled)
async def get_db_connection():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        raise Exception("DATABASE_URL not found in environment variables.")

    return await asyncpg.connect(dsn=db_url)