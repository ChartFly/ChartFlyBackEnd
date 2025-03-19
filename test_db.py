import os
import asyncpg
import asyncio

# ✅ Load DATABASE_URL and Remove `sslmode=require` + Fix DSN
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("❌ DATABASE_URL is not set. Check your environment variables.")

DATABASE_URL = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")  # ✅ Fix DSN
DATABASE_URL = DATABASE_URL.replace("?sslmode=require", "")  # ✅ Remove sslmode

async def test_db_connection():
    try:
        # ✅ Manually set SSL using `ssl="require"`
        conn = await asyncpg.connect(DATABASE_URL, ssl="require")
        print("✅ Database connection successful!")

        # ✅ Run Test Query
        result = await conn.fetch("SELECT id, name, date, year FROM market_holidays WHERE year = 2025 ORDER BY date")
        if result:
            print("✅ Holiday records found:", result)
        else:
            print("⚠ No holidays found for 2025!")

        await conn.close()
    except Exception as e:
        print(f"❌ Database connection failed: {e}")

# ✅ Run the function
if __name__ == "__main__":
    print(f"✅ Using Database URL: {DATABASE_URL}")
    asyncio.run(test_db_connection())