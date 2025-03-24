import os
import asyncpg
import asyncio
import logging

# ✅ Load DATABASE_URL and Remove `sslmode=require` + Fix DSN
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("❌ DATABASE_URL is not set. Check your environment variables.")

# ✅ Fix DSN and Remove sslmode
DATABASE_URL = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")  # ✅ Fix DSN
#DATABASE_URL = DATABASE_URL.replace("?sslmode=require", "")  # ✅ Remove sslmode

# ✅ Set up logging
logging.basicConfig(level=logging.INFO)

async def test_db_connection():
    try:
        # ✅ Manually set SSL using `ssl="require"`
        conn = await asyncpg.connect(DATABASE_URL, ssl="require")
        logging.info("✅ Database connection successful!")

        # ✅ Run Test Query
        result = await conn.fetch("SELECT id, name, date, year FROM market_holidays WHERE year = 2025 ORDER BY date")
        if result:
            logging.info("✅ Holiday records found:", result)
        else:
            logging.warning("⚠ No holidays found for 2025!")

        await conn.close()
    except Exception as e:
        logging.error(f"❌ Database connection failed: {e}")

# ✅ Run the function
if __name__ == "__main__":
    try:
        logging.info(f"✅ Using Database URL: {DATABASE_URL[:30]}...")  # Only log part of the URL for safety
        asyncio.run(test_db_connection())
    except Exception as e:
        logging.error(f"❌ Failed to run DB test: {e}")