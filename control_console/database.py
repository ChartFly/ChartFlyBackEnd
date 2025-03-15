from sqlalchemy import create_engine, text

# ✅ PostgreSQL Connection String
DATABASE_URL = "postgresql://chartflydatabase_owner:npg_34luwxEYStRO@ep-young-morning-a40vm2cq-pooler.us-east-1.aws.neon.tech/chartflydatabase?sslmode=require"

# ✅ Create Engine
engine = create_engine(DATABASE_URL)