# ============================================================
# ✅ main.py
# 📍 Entry point for the IonaBrand backend application
# 🔧 Sets up FastAPI app, static mounting, DB middleware, routing
# Author: Captain & Chatman
# Version: MPA Phase II — Stores Module Enabled
# ============================================================

import logging
import os

import uvicorn
import asyncpg
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, Response, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from jinja2 import Environment, FileSystemLoader, select_autoescape
from starlette.middleware import Middleware
from starlette.middleware.sessions import SessionMiddleware
from starlette.status import HTTP_302_FOUND

# 📦 Admin Console Routers
from control_console.admin import router as admin_router
from control_console.api_keys import router as api_keys_router
from control_console.api_keys_page import router as api_keys_page_router
from control_console.auth_login_register import router as login_register_router
from control_console.auth_password_reset import router as password_reset_router
from control_console.config import SESSION_SECRET
from control_console.dev_reset import router as dev_reset_router
from control_console.holidays import router as holidays_router
from control_console.market_holidays_page import router as market_holidays_page_router
from control_console.user_management_page import router as user_management_page_router
from control_console.user_management_routes import router as admin_users_router
from control_console.stores_thinkscripts_page import (
    router as stores_thinkscripts_page_router,
)

# 📦 Stores Routers
from api.stores import thinkscripts

load_dotenv()
logging.basicConfig(level=logging.INFO)

# ✅ Create FastAPI App
app = FastAPI(
    title="IonaBrand API",
    description="Backend for IonaBrand Trading Tools and Storefronts",
    version="1.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    middleware=[
        Middleware(SessionMiddleware, secret_key=SESSION_SECRET),
        Middleware(
            CORSMiddleware,
            allow_origins=["https://IonaBrand-web-site.onrender.com"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        ),
    ],
)

# ✅ Mount Static Files
app.mount("/static", StaticFiles(directory="static"), name="static")


# ✅ Serve Favicon
@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return FileResponse("static/images/IonaBrand-Favicon.ico")


# ✅ Jinja2 Template Environment
env = Environment(
    loader=FileSystemLoader("templates"),
    autoescape=select_autoescape(["html", "xml"]),
    cache_size=50,
)
templates = Jinja2Templates(env=env)


# ✅ Startup Events
@app.on_event("startup")
async def startup():
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise ValueError("DATABASE_URL not set in environment variables.")

    app.state.db_pool = await asyncpg.create_pool(dsn=database_url)


# ✅ Middleware
@app.middleware("http")
async def db_middleware(request: Request, call_next):
    if getattr(app.state, "db_pool", None) is None:
        response = await call_next(request)
        return response

    async with app.state.db_pool.acquire() as connection:
        request.state.db = connection
        response = await call_next(request)
        return response


# ✅ Routes
@app.get("/")
async def admin_ui(request: Request):
    try:
        user_count = await request.state.db.fetchval(
            "SELECT COUNT(*) FROM admin_users;"
        )
        user_count = user_count if user_count is not None else 0
    except Exception:  # nosec pylint: disable=broad-exception-caught
        logging.error("🚨 Database error in admin_ui route")
        return templates.TemplateResponse(
            "login.html", {"request": request, "error": "Database connection failed."}
        )

    if user_count == 0:
        return RedirectResponse(url="/auth/register", status_code=HTTP_302_FOUND)

    if request.session.get("user_id"):
        return templates.TemplateResponse("admin.html", {"request": request})

    return RedirectResponse(url="/auth/login", status_code=HTTP_302_FOUND)


@app.head("/")
async def root_head():
    return Response(status_code=200)


@app.head("/api/haltdetails")
async def head_halted_stocks():
    return Response(status_code=200)


@app.get("/api/haltdetails")
async def get_halted_stocks():
    return []


# ✅ Admin Console Routers
app.include_router(password_reset_router, prefix="/auth")
app.include_router(login_register_router, prefix="/auth")
app.include_router(holidays_router, prefix="/api/holidays")
app.include_router(admin_router, prefix="/api/admin")
app.include_router(api_keys_router, prefix="/api/api-keys")
app.include_router(admin_users_router, prefix="/api/users")
app.include_router(dev_reset_router)

app.include_router(market_holidays_page_router)
app.include_router(api_keys_page_router)
app.include_router(user_management_page_router)
app.include_router(stores_thinkscripts_page_router)

# ✅ Stores Routers
app.include_router(thinkscripts.router)

# ✅ Server Start
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", "8000")))
