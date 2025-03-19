from fastapi import APIRouter, HTTPException, Depends, Path
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from control_console.database import AsyncSessionLocal  # ✅ Ensure correct import
import logging
import traceback  # ✅ Captures full error stack trace

router = APIRouter()

# ✅ Configure logging
logging.basicConfig(level=logging.INFO)


# ✅ Dependency for getting a database session
async def get_db_session() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session


# ✅ GET Holidays by Year with Debugging
@router.get("/year/{year}", response_model=list, tags=["holidays"])
async def get_holidays_by_year(
        year: int = Path(..., title="Year", description="The year to fetch holidays for."),
        db: AsyncSession = Depends(get_db_session)
):
    try:
        logging.info(f"🔍 Fetching holidays for {year}")  # ✅ Debug log

        result = await db.execute(
            text("SELECT id, name, date, year FROM market_holidays WHERE year = :year ORDER BY date"),
            {"year": year}
        )
        holidays = result.mappings().all()

        if not holidays:
            logging.warning(f"⚠ No holidays found for {year}")
            raise HTTPException(status_code=404, detail=f"No holidays found for {year}")

        logging.info(f"✅ Found {len(holidays)} holidays for {year}")
        return holidays

    except Exception as e:
        logging.error(f"❌ Database error: {e}")
        logging.error(traceback.format_exc())  # ✅ Log full stack trace
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")