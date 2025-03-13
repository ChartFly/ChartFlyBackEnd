import sqlite3
import uuid
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()
DATABASE = "chartflynonsecure.db"


# ✅ Pydantic Models
class Holiday(BaseModel):
    holiday_name: str
    holiday_date: str  # Format: YYYY-MM-DD
    market_status: str  # closed | half_day | early_close
    year: int
    added_by: str


# ✅ Database Initialization (run once initially)
def init_db():
    with sqlite3.connect(DATABASE) as conn:
        conn.execute('''CREATE TABLE IF NOT EXISTS market_holidays (
                id TEXT PRIMARY KEY,
                holiday_name TEXT NOT NULL,
                holiday_date DATE NOT NULL,
                market_status TEXT NOT NULL,
                year INTEGER NOT NULL,
                added_by TEXT NOT NULL,
                date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );''')


# Helper function: SQLite row → dictionary
def cursor_to_dict(cursor):
    return [
        {description[0]: value for description, value in zip(cursor.description, row)}
        for row in cursor.fetchall()
    ]


# ✅ GET holidays by year
@router.get("/api/holidays/{year}")
def get_holidays(year: int):
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.execute("SELECT * FROM market_holidays WHERE year=?", (year,))
        rows = cursor_to_dict(cursor)
    return rows


# ✅ POST new holiday
@router.post("/api/holidays")
def add_holiday(holiday: Holiday):
    holiday_id = str(uuid.uuid4())
    with sqlite3.connect(DATABASE) as conn:
        conn.execute('''
                INSERT INTO market_holidays (id, holiday_name, holiday_date, market_status, year, added_by)
                VALUES (?, ?, ?, ?, ?, ?)''',
                     (holiday_id, holiday.holiday_name, holiday.holiday_date,
                      holiday.market_status, holiday.year, holiday.added_by))
    return {"status": "success", "id": holiday_id}


# ✅ PUT - Update existing holiday
@router.put("/api/holidays/{holiday_id}")
def update_holiday(holiday_id: str, holiday: Holiday):
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.execute('''
                UPDATE market_holidays SET holiday_name=?, holiday_date=?, market_status=?, year=?
                WHERE id=?''',
                              (holiday.holiday_name, holiday.holiday_date, holiday.market_status, holiday.year,
                               holiday_id))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Holiday not found")
    return {"status": "updated", "id": holiday_id}


# ✅ DELETE - Delete existing holiday
@router.delete("/api/holidays/{holiday_id}")
def delete_holiday(holiday_id: str):
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.execute('DELETE FROM market_holidays WHERE id=?', (holiday_id,))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Holiday not found")
    return {"status": "deleted", "id": holiday_id}