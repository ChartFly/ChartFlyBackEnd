import os
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy import text
from dotenv import load_dotenv

# ✅ Load environment variables from .env file (if used)
load_dotenv()

# ✅ Retrieve the database URL
DATABASE_URL = os.getenv("DATABASE_URL")

# 🚨 Ensure the database URL is set before proceeding
if not DATABASE_URL:
    raise ValueError("❌ DATABASE_URL is not set. Check your .env file or environment variables in Render.")

# ✅ Fix: Ensure proper connection without `connect_args`
engine = create_async_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
    echo=True,
    future=True
)

# ✅ Async Session Maker
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

# ✅ Test the database connection (Async)
async def test_db_connection():
    try:
        async with engine.connect() as connection:
            result = await connection.execute(text("SELECT 1"))
            return True if result.fetchone() else False
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

# ✅ Run test (Only if executed directly)
if __name__ == "__main__":
    import asyncio
    print("Testing database connection...")
    if asyncio.run(test_db_connection()):
        print("✅ Database connection successful!")
    else:
        print("❌ Database connection failed. Check credentials.")