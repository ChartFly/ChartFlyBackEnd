# ============================================================
# ✅ test_db.py
# 📍 Quick diagnostic script to test Neon PostgreSQL connection
# 🔍 Verifies connection, SSL config, and queries Market Holidays
# Author: Captain & Chatman
# Version: MPA Phase I — Backend Diagnostic Kit
# ============================================================

import os
import asyncpg
import asyncio
import logging

# ✅ Load DATABASE_URL and prepare DSN
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("❌ DATABASE_URL is not set. Check your environment variables.")

# ✅ Patch DSN if needed
DATABASE_URL = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")
# DATABASE_URL = DATABASE_URL.replace("?sslmode=require", "")  # Optional cleanup

# ✅ Logging config
logging.basicConfig(level=logging.INFO)

# ✅ Async DB test runner
async def test_db_connection():
    try:
        # 🔐 Connect with SSL explicitly required
        conn = await asyncpg.connect(DATABASE_URL, ssl="require")
        logging.info("✅ Database connection successful!")

        # 🔍 Run a basic query
        result = await conn.fetch(
            "SELECT id, name, date, year FROM market_holidays WHERE year = 2025 ORDER BY date"
        )
        if result:
            logging.info(f"✅ {len(result)} holiday records found:")
            for row in result:
                logging.info(f"  📅 {row['date']} — {row['name']}")
        else:
            logging.warning("⚠ No holidays found for 2025.")

        await conn.close()
    except Exception as e:
        logging.error(f"❌ Database connection failed: {e}")

# ✅ Run directly
if __name__ == "__main__":
    try:
        logging.info(f"🔌 Connecting to DB: {DATABASE_URL[:30]}...")
        asyncio.run(test_db_connection())
    except Exception as e:
        logging.error(f"💥 Failed to run DB test: {e}")
