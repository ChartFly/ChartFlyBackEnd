# ============================================================
# 📁 FILE: stores_thinkscripts_page.py
# 📍 LOCATION: control_console/stores_thinkscripts_page.py
# 🎯 PURPOSE: Serve the ThinkScripts Store Management Page
# ============================================================

from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from control_console.config import templates

router = APIRouter(
    prefix="/stores/thinkscripts",
    tags=["ThinkScripts Store Pages"],
)


@router.get("/", response_class=HTMLResponse)
async def get_thinkscripts_manage_page(request: Request):
    return templates.TemplateResponse(
        "stores/thinkscripts/thinkscripts-manage.html",
        {"request": request},
    )


@router.get("/manage", response_class=HTMLResponse)
async def get_thinkscripts_manage_page_alias(request: Request):
    return templates.TemplateResponse(
        "stores/thinkscripts/thinkscripts-manage.html",
        {"request": request},
    )
