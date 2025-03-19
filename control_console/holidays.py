from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import text
from control_console.database import AsyncSessionLocal
from contextlib import asynccontextmanager

router = APIRouter()

# ✅ Define Pydantic Model
class Holiday(BaseModel):
    name: str
    date: str  # Format: YYYY-MM-DD
    year: int

# ✅ Dependency to get an async database session
async def get_db_session() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session

# ✅ GET Holidays by Year
@router.get("/year/{year}", tags=["holidays"])
async def get_holidays_by_year(year: int, db: AsyncSession = Depends(get_db_session)):
    try:
        result = await db.execute(
            text("SELECT id, name, date, year FROM market_holidays WHERE year = :year ORDER BY date"),
            {"year": year}
        )
        holidays = result.mappings().all()

        if not holidays:
            raise HTTPException(status_code=404, detail=f"No holidays found for {year}")

        return holidays
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# ✅ GET All Holidays
@router.get("/", tags=["holidays"])
async def get_holidays(db: AsyncSession = Depends(get_db_session)):
    try:
        result = await db.execute(text("SELECT id, name, date, year FROM market_holidays ORDER BY date"))
        holidays = result.mappings().all()
        return holidays
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# ✅ ADD New Holiday
@router.post("/", tags=["holidays"])
async def add_holiday(holiday: Holiday, db: AsyncSession = Depends(get_db_session)):
    try:
        result = await db.execute(
            text("INSERT INTO market_holidays (name, date, year) VALUES (:name, :date, :year) RETURNING id"),
            {"name": holiday.name, "date": holiday.date, "year": holiday.year}
        )
        await db.commit()
        new_holiday_id = result.scalar_one_or_none()

        return {"message": "Holiday added successfully", "holiday_id": new_holiday_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# ✅ DELETE Holiday
@router.delete("/{holiday_id}", tags=["holidays"])
async def delete_holiday(holiday_id: int, db: AsyncSession = Depends(get_db_session)):
    try:
        result = await db.execute(
            text("DELETE FROM market_holidays WHERE id = :id RETURNING id"),
            {"id": holiday_id}
        )
        await db.commit()
        deleted_id = result.scalar_one_or_none()

        if not deleted_id:
            raise HTTPException(status_code=404, detail="Holiday not found")

        return {"message": "Holiday deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")