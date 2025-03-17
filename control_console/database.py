from sqlalchemy import create_engine, text

# ✅ PostgreSQL Connection String
DATABASE_URL = "postgresql://chartflydatabase_owner:npg_34luwxEYStRO@ep-young-morning-a40vm2cq-pooler.us-east-1.aws.neon.tech/chartflydatabase?sslmode=require"

# ✅ Create Engine
engine = create_engine(DATABASE_URL, pool_pre_ping=True)

# ✅ Test the database connection
def test_db_connection():
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            return True if result.fetchone() else False
    except Exception as e:
        print(f"Database connection failed: {e}")
        return False

# ✅ Run test
if __name__ == "__main__":
    print("Testing database connection...")
    if test_db_connection():
        print("✅ Database connection successful!")
    else:
        print("❌ Database connection failed. Check credentials.")