from sqlalchemy import create_engine

# 🔹 Replace with your actual Neon PostgreSQL connection string!
DATABASE_URL = "postgresql://chartflydatabase_owner:npg_34luwxEYStRO@ep-young-morning-a40vm2cq-pooler.us-east-1.aws.neon.tech/chartflydatabase?sslmode=require"


# ✅ Create database engine
engine = create_engine(DATABASE_URL)

try:
    with engine.connect() as conn:
        print("✅ Connected to PostgreSQL successfully!")
except Exception as e:
    print(f"❌ Connection failed: {e}")