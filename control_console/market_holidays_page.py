# ============================================================
# 📅 market_holidays_page.py
# 📍 MPA route handler for the Market Holidays admin page
# 🔐 Requires login session
# Author: Captain & Chatman
# Version: MPA Phase I — Modular Page Routing
# ============================================================

from fastapi import APIRouter, Request
from fastapi.responses import RedirectResponse
from starlette.status import HTTP_302_FOUND
from fastapi.templating import Jinja2Templates

router = APIRouter()
templates = Jinja2Templates(directory="templates")

# ✅ Market Holidays Admin Page (MPA)
@router.get("/market-holidays")
async def market_holidays_page(request: Request):
    if not request.session.get("user_id"):
        return RedirectResponse(url="/auth/login", status_code=HTTP_302_FOUND)
    return templates.TemplateResponse("market-holidays/market-holidays.html", {"request": request})
