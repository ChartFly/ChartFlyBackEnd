# ============================================================
# ✅ api_keys_page.py
# 📍 MPA route handler for the API Keys admin page
# 🔐 Requires login session
# Author: Captain & Chatman
# Version: MPA Phase I — Modular Page Routing
# ============================================================

from fastapi import APIRouter, Request
from fastapi.responses import RedirectResponse
from fastapi.templating import Jinja2Templates
from starlette.status import HTTP_302_FOUND

router = APIRouter()
templates = Jinja2Templates(directory="templates")


# ✅ API Keys Admin Page (MPA)
@router.get("/api-keys", tags=["pages"])
async def api_keys_page(request: Request):
    """Renders the API Keys admin page if the user is authenticated."""
    if not request.session.get("user_id"):
        return RedirectResponse(url="/auth/login", status_code=HTTP_302_FOUND)
    return templates.TemplateResponse("api-keys/api-keys.html", {"request": request})
