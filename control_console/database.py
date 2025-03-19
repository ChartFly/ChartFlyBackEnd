import os
import asyncpg
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy import text
from dotenv import load_dotenv

# ✅ Load environment variables
load_dotenv()

# ✅ Retrieve database URL and remove `sslmode=require`
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("❌ DATABASE_URL is not set. Check your environment variables.")

# ✅ Remove sslmode from the URL
DATABASE_URL = DATABASE_URL.replace("?sslmode=require", "")

# ✅ Create Async Engine (without `sslmode`)
engine = create_async_engine(DATABASE_URL, pool_pre_ping=True, pool_size=5, max_overflow=10, echo=True, future=True)

# ✅ Async Session Maker
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

# ✅ Test Connection Using `asyncpg.connect()`
async def test_db_connection():
    try:
        conn = await asyncpg.connect(DATABASE_URL, ssl="require")  # ✅ Explicitly set SSL
        print("✅ Database connection successful!")
        result = await conn.fetch("SELECT id, name, date, year FROM market_holidays WHERE year = 2025 ORDER BY date")
        print("✅ Holiday records found:", result)
        await conn.close()
    except Exception as e:
        print(f"❌ Database connection failed: {e}")

# ✅ Run test (Only if executed directly)
if __name__ == "__main__":
    import asyncio
    print("Testing database connection...")
    asyncio.run(test_db_connection())