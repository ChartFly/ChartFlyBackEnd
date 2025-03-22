import os
from dotenv import load_dotenv
load_dotenv()
import uvicorn
from fastapi import FastAPI, Request
from fastapi.responses import Response, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from starlette.status import HTTP_302_FOUND

# ✅ Import Routers
from control_console.dev_reset import router as dev_reset_router
from control_console.holidays import router as holidays_router
from control_console.admin import router as admin_router
from control_console.api_keys import router as api_keys_router
from control_console.admin_users import router as users_router
from control_console.auth import router as auth_router

# ✅ DB Connection Function
from db import get_db_connection

# ✅ Initialize FastAPI
app = FastAPI(
    title="ChartFly API",
    description="Backend for ChartFly Trading Tools",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ✅ Add Session Middleware
app.add_middleware(SessionMiddleware, secret_key=os.getenv("SESSION_SECRET", "super-secret"))

# ✅ Add CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://chartfly-web-site.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Mount Static Files
app.mount("/static", StaticFiles(directory="static"), name="static")

# ✅ Setup Jinja2 Templates
templates = Jinja2Templates(directory="templates")

# ✅ Admin UI Landing Route with First-Time Setup Check
@app.get("/")
@app.head("/")
async def admin_ui(request: Request):
    if request.method == "HEAD":
        return Response(status_code=200)

    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM admin_users;")
        user_count = cur.fetchone()[0]
        cur.close()
        conn.close()
    except Exception as e:
        print("🚨 Database error in admin_ui route:", e)
        return templates.TemplateResponse("login.html", {"request": request, "error": "Database connection failed."})

    if user_count == 0:
        return RedirectResponse(url="/register", status_code=HTTP_302_FOUND)

    if request.session.get("user_id"):
        return templates.TemplateResponse("admin.html", {"request": request})

    return RedirectResponse(url="/login", status_code=HTTP_302_FOUND)

# ✅ HEAD support for halt endpoint
@app.head("/api/haltdetails")
async def head_halted_stocks():
    return Response(status_code=200)

# ✅ Placeholder data for halted stocks
@app.get("/api/haltdetails")
async def get_halted_stocks():
    return []

# ✅ Include All Routers
app.include_router(holidays_router, prefix="/api/holidays")
app.include_router(admin_router, prefix="/api/admin")
app.include_router(api_keys_router, prefix="/api/api-keys")
app.include_router(users_router, prefix="/api/users")
app.include_router(auth_router)
app.include_router(dev_reset_router)

# ✅ Run server
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))