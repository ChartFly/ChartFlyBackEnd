from fastapi import APIRouter, HTTPException, Depends, Path
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select  # ✅ Required for async queries
from control_console.database import AsyncSessionLocal  # ✅ Ensure correct import
from control_console.models import MarketHoliday  # ✅ Ensure correct import
from control_console.models import MarketHoliday  # ✅ Ensure correct import
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

        # ✅ Corrected query using SQLAlchemy async ORM
        result = await db.execute(
            select(MarketHoliday).where(MarketHoliday.year == year).order_by(MarketHoliday.date)
        )
        holidays = [dict(row._mapping) for row in result.fetchall()]  # ✅ Convert RowMapping to dict

        if not holidays:
            logging.warning(f"⚠ No holidays found for {year}")
            raise HTTPException(status_code=404, detail=f"No holidays found for {year}")

        logging.info(f"✅ Found {len(holidays)} holidays for {year}")
        return holidays

    except Exception as e:
        logging.error(f"❌ Database error: {e}")
        logging.error(traceback.format_exc())  # ✅ Log full stack trace
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")