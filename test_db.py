# ============================================================
# ✅ test_db.py (SYNC VERSION)
# 📍 Test PostgreSQL DB connection using psycopg2
# Author: Captain & Chatman
# Version: Debug Mode — Direct Diagnostic
# ============================================================

import logging
import os

import psycopg2
from dotenv import load_dotenv
from psycopg2.extras import RealDictCursor

load_dotenv()
logging.basicConfig(level=logging.INFO)

# 🔍 Load connection URL (from ENV or direct override)
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("❌ DATABASE_URL is not set.")

logging.info(f"🔌 Attempting connection to DB: {DATABASE_URL[:50]}...")

try:
    conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
    cur = conn.cursor()

    cur.execute(
        "SELECT id, name, date, year FROM market_holidays WHERE year = 2025 ORDER BY date"
    )
    rows = cur.fetchall()

    if rows:
        logging.info(f"✅ {len(rows)} holiday records found:")
        for row in rows:
            logging.info(f"  📅 {row['date']} — {row['name']}")
    else:
        logging.warning("⚠ No holidays found for 2025.")

    cur.close()
    conn.close()
except Exception as e:
    logging.error(f"❌ Database test failed: {e}")
