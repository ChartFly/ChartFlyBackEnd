from fastapi import APIRouter, HTTPException, Path, Request
import logging
import traceback

router = APIRouter()

# ✅ Configure logging
logging.basicConfig(level=logging.INFO)

# ✅ GET Holidays by Year using asyncpg
@router.get("/year/{year}", response_model=list, tags=["holidays"])
async def get_holidays_by_year(
    year: int = Path(..., title="Year", description="The year to fetch holidays for."),
    request: Request
):
    try:
        logging.info(f"🔍 Fetching holidays for {year}")

        db = request.state.db

        query = """
            SELECT id, name, date, year
            FROM market_holidays
            WHERE year = $1
            ORDER BY date;
        """
        rows = await db.fetch(query, year)

        if not rows:
            logging.warning(f"⚠ No holidays found for {year}")
            raise HTTPException(status_code=404, detail=f"No holidays found for {year}")

        holidays = [dict(row) for row in rows]

        logging.info(f"✅ Found {len(holidays)} holidays for {year}")
        return holidays

    except Exception as e:
        logging.error(f"❌ Database error: {e}")
        logging.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")