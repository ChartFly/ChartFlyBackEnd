import os
import logging
from dotenv import load_dotenv
load_dotenv()

import uvicorn
import asyncpg

from fastapi import FastAPI, Request
from fastapi.responses import Response, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from starlette.middleware import Middleware
from starlette.status import HTTP_302_FOUND

# ✅ Configure logging
logging.basicConfig(level=logging.INFO)

# ✅ Import Routers
from control_console.dev_reset import router as dev_reset_router
from control_console.holidays import router as holidays_router
from control_console.admin import router as admin_router
from control_console.api_keys import router as api_keys_router
from control_console.admin_users.routes import router as admin_users_full_router
from control_console.admin_users import router as users_router
from control_console.auth_login_register import router as login_register_router
from control_console.auth_password_reset import router as password_reset_router

# ✅ Legacy DB connection for sync call in admin_ui
from db import get_db_connection

# ✅ Load DB URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")

# ✅ Initialize FastAPI with Middleware
app = FastAPI(
    title="ChartFly API",
    description="Backend for ChartFly Trading Tools",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    middleware=[
        Middleware(SessionMiddleware, secret_key=os.getenv("SESSION_SECRET", "super-secret")),
        Middleware(
            CORSMiddleware,
            allow_origins=["https://chartfly-web-site.onrender.com"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        ),
    ],
)

# ✅ Mount Static Files
app.mount("/static", StaticFiles(directory="static"), name="static")

# ✅ Setup Jinja2 Templates
templates = Jinja2Templates(directory="templates")

# ✅ Startup: create asyncpg pool and store in app state
@app.on_event("startup")
async def startup():
    app.state.db_pool = await asyncpg.create_pool(DATABASE_URL)
    logging.info("✅ Database connection pool created successfully")

# ✅ Middleware: inject request.state.db for all routes
@app.middleware("http")
async def db_middleware(request: Request, call_next):
    async with app.state.db_pool.acquire() as connection:
        request.state.db = connection
        response = await call_next(request)
        return response

# ✅ Admin UI Landing Route with First-Time Setup Check
@app.get("/")
async def admin_ui(request: Request):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM admin_users;")
        user_count = cur.fetchone()[0]
        cur.close()
        conn.close()
    except Exception as e:
        logging.error(f"🚨 Database error in admin_ui route: {e}")
        return templates.TemplateResponse("login.html", {"request": request, "error": "Database connection failed."})

    if user_count == 0:
        return RedirectResponse(url="/auth/register", status_code=HTTP_302_FOUND)

    if request.session.get("user_id"):
        return templates.TemplateResponse("admin.html", {"request": request})

    return RedirectResponse(url="/auth/login", status_code=HTTP_302_FOUND)

# ✅ Health Check (HEAD)
@app.head("/")
async def root_head():
    return Response(status_code=200)

@app.head("/api/haltdetails")
async def head_halted_stocks():
    return Response(status_code=200)

@app.get("/api/haltdetails")
async def get_halted_stocks():
    return []

# ✅ Register Routers
app.include_router(password_reset_router, prefix="/auth")
app.include_router(login_register_router, prefix="/auth")
app.include_router(holidays_router, prefix="/api/holidays")
app.include_router(admin_router, prefix="/api/admin")
app.include_router(api_keys_router, prefix="/api/api-keys")
app.include_router(users_router, prefix="/api/users")
app.include_router(admin_users_full_router, prefix="/api/admin-users")  # ✅ Moved here
app.include_router(dev_reset_router)

# ✅ Run server
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))