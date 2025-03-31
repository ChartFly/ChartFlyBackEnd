from fastapi import APIRouter, HTTPException, Path, Request
import logging
import traceback
from datetime import datetime

router = APIRouter()
logging.basicConfig(level=logging.INFO)

# ✅ GET Holidays by Year using asyncpg
@router.get("/year/{year}", response_model=list, tags=["holidays"])
async def get_holidays_by_year(
    request: Request,
    year: int = Path(..., title="Year", description="The year to fetch holidays for.")
):
    try:
        logging.info(f"🔍 Fetching holidays for {year}")
        db = request.state.db

        query = """
            SELECT id, name, date, year, close_time
            FROM market_holidays
            WHERE year = $1
            ORDER BY date;
        """
        rows = await db.fetch(query, year)

        if not rows:
            logging.warning(f"⚠ No holidays found for {year}")
            raise HTTPException(status_code=404, detail=f"No holidays found for {year}")

        today = datetime.utcnow().date()
        holidays = []

        for row in rows:
            holiday = dict(row)
            holiday_date = holiday["date"]

            # ⏰ Format close_time if present
            if holiday.get("close_time"):
                holiday["close_time"] = holiday["close_time"].strftime("%H:%M")
            else:
                holiday["close_time"] = None

            # 📆 Status logic
            if holiday_date == today:
                status = "Closed Today"
            elif holiday_date > today:
                status = "Upcoming"
            else:
                status = "Passed"

            holiday["status"] = status
            holidays.append(holiday)

        logging.info(f"✅ Found {len(holidays)} holidays for {year}")
        return holidays

    except Exception as e:
        logging.error(f"❌ Database error: {e}")
        logging.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")