# ============================================================
# ✅ user_management_page.py
# 📍 MPA route handler for the Admin Users management page
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

# ✅ Admin Users Page (MPA)
@router.get("/user-management")
async def user_management_page(request: Request):
    if not request.session.get("user_id"):
        return RedirectResponse(url="/auth/login", status_code=HTTP_302_FOUND)
    return templates.TemplateResponse("user-management/user-management.html", {"request": request})
