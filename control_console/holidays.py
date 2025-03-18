from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from control_console.database import AsyncSessionLocal  # Ensure correct import
from contextlib import asynccontextmanager  # ✅ Fix Async Generator Issue

router = APIRouter()

# ✅ Define Pydantic Model
class Holiday(BaseModel):
    name: str
    date: str  # Format: YYYY-MM-DD
    year: int

# ✅ Dependency to get an async database session
@asynccontextmanager
async def get_db_session():
    async with AsyncSessionLocal() as session:
        yield session

# ✅ GET Holidays by Year
@router.get("/year/{year}", response_model=list, tags=["holidays"])
async def get_holidays_by_year(year: int, db: AsyncSession = Depends(get_db_session)):
    result = await db.execute(
        text("SELECT id, name, date, year FROM market_holidays WHERE year = :year ORDER BY date"),
        {"year": year}
    )
    holidays = result.mappings().all()

    if not holidays:
        raise HTTPException(status_code=404, detail=f"No holidays found for {year}")

    return holidays

# ✅ GET All Holidays
@router.get("/", response_model=list, tags=["holidays"])
async def get_holidays(db: AsyncSession = Depends(get_db_session)):
    result = await db.execute(text("SELECT id, name, date, year FROM market_holidays ORDER BY date"))
    holidays = result.mappings().all()
    return holidays

# ✅ ADD New Holiday
@router.post("/", tags=["holidays"])
async def add_holiday(holiday: Holiday, db: AsyncSession = Depends(get_db_session)):
    result = await db.execute(
        text("INSERT INTO market_holidays (name, date, year) VALUES (:name, :date, :year) RETURNING id"),
        {"name": holiday.name, "date": holiday.date, "year": holiday.year}
    )
    await db.commit()
    new_holiday_id = result.scalar_one_or_none()

    return {"message": "Holiday added successfully", "holiday_id": new_holiday_id}

# ✅ DELETE Holiday
@router.delete("/{holiday_id}", tags=["holidays"])
async def delete_holiday(holiday_id: int, db: AsyncSession = Depends(get_db_session)):
    result = await db.execute(
        text("DELETE FROM market_holidays WHERE id = :id RETURNING id"),
        {"id": holiday_id}
    )
    await db.commit()
    deleted_id = result.scalar_one_or_none()

    if not deleted_id:
        raise HTTPException(status_code=404, detail="Holiday not found")

    return {"message": "Holiday deleted successfully"}