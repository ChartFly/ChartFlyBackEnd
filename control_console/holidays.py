from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from control_console.database import engine  # Ensure correct path for database.py
from sqlalchemy import text

router = APIRouter()

# ✅ Define Pydantic Model
class Holiday(BaseModel):
    name: str
    date: str  # Format: YYYY-MM-DD
    year: int

# ✅ GET Holidays by Year (FIXED)
@router.get("/api/holidays/year/{year}", response_model=list, tags=["holidays"])
def get_holidays_by_year(year: int):
    with engine.connect() as connection:
        result = connection.execute(
            text("SELECT id, name, date, year FROM market_holidays WHERE year = :year ORDER BY date"),
            {"year": year}
        )
        holidays = [dict(row) for row in result.mappings()]

    if not holidays:
        raise HTTPException(status_code=404, detail=f"No holidays found for {year}")

    return holidays

# ✅ GET All Holidays
@router.get("/api/holidays/", response_model=list, tags=["holidays"])
def get_holidays():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT id, name, date, year FROM market_holidays ORDER BY date"))
        holidays = [dict(row) for row in result.mappings()]
    return holidays

# ✅ ADD New Holiday
@router.post("/api/holidays/", tags=["holidays"])
def add_holiday(holiday: Holiday):
    with engine.connect() as connection:
        connection.execute(
            text("INSERT INTO market_holidays (name, date, year) VALUES (:name, :date, :year)"),
            {"name": holiday.name, "date": holiday.date, "year": holiday.year}
        )
        connection.commit()
    return {"message": "Holiday added successfully"}

# ✅ DELETE Holiday
@router.delete("/api/holidays/{holiday_id}", tags=["holidays"])
def delete_holiday(holiday_id: int):
    with engine.connect() as connection:
        result = connection.execute(text("DELETE FROM market_holidays WHERE id = :id"), {"id": holiday_id})
        connection.commit()
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Holiday not found")
    return {"message": "Holiday deleted successfully"}