# ===================================================
# ✅ FILE: control_console/holidays.py
# 📌 PURPOSE: Handles Market Holiday retrieval and saving
# 🛠️ STATUS: Active (MPA Phase I) — Author: Captain & Chatman
# ===================================================

import logging
import traceback
from datetime import datetime
from typing import List

from fastapi import APIRouter, HTTPException, Path, Request
from pydantic import BaseModel

router = APIRouter()

# ✅ Configure logger
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


# ✅ GET Holidays by Year
@router.get("/year/{year}", response_model=list, tags=["holidays"])
async def get_holidays_by_year(
    request: Request,
    year: int = Path(..., title="Year", description="The year to fetch holidays for."),
):
    try:
        logger.info("🔍 Fetching holidays for %s", year)
        db = request.state.db

        query = """
            SELECT id, name, date, year, close_time
            FROM market_holidays
            WHERE year = $1
            ORDER BY date;
        """
        rows = await db.fetch(query, year)

        if not rows:
            logger.warning("⚠ No holidays found for %s", year)
            raise HTTPException(status_code=404, detail=f"No holidays found for {year}")

        today = datetime.utcnow().date()
        holidays = []

        for row in rows:
            holiday = dict(row)
            holiday_date = holiday["date"]

            holiday["close_time"] = (
                holiday["close_time"].strftime("%H:%M")
                if holiday.get("close_time")
                else None
            )

            if holiday_date == today:
                status = "Closed Today"
            elif holiday_date > today:
                status = "Upcoming"
            else:
                status = "Passed"

            holiday["status"] = status
            holidays.append(holiday)

        logger.info("✅ Found %d holidays for %s", len(holidays), year)
        return holidays

    except Exception as e:
        logger.error("❌ Database error: %s", e)
        logger.debug(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# ✅ POST Save Edited Holidays
class HolidayUpdate(BaseModel):
    id: int
    name: str
    date: str
    close_time: str


@router.post("/save", tags=["holidays"])
async def save_holidays(request: Request, holidays: List[HolidayUpdate]):
    try:
        db = request.state.db
        async with db.transaction():
            for h in holidays:
                await db.execute(
                    """
                    UPDATE market_holidays
                    SET name = $1, date = $2, close_time = $3
                    WHERE id = $4
                    """,
                    h.name,
                    h.date,
                    h.close_time,
                    h.id,
                )

        logger.info("✅ %d holidays updated successfully", len(holidays))
        return {"message": f"{len(holidays)} holidays updated successfully."}

    except Exception as e:
        logger.error("❌ Save error: %s", e)
        logger.debug(traceback.format_exc())
        raise HTTPException(status_code=500, detail="Failed to save holidays.")
