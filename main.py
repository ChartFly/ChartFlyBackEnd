import os
from dotenv import load_dotenv
load_dotenv()
import uvicorn
from fastapi import FastAPI, Request
from fastapi.responses import Response
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from control_console.dev_reset import router as dev_reset_router

# ✅ Import Routers
from control_console.holidays import router as holidays_router
from control_console.admin import router as admin_router
from control_console.api_keys import router as api_keys_router
from control_console.admin_users import router as users_router
from control_console.auth import router as auth_router

from starlette.middleware.sessions import SessionMiddleware

# ✅ Initialize FastAPI (without middleware param)
app = FastAPI(
    title="ChartFly API",
    description="Backend for ChartFly Trading Tools",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(SessionMiddleware, secret_key=os.getenv("SESSION_SECRET", "super-secret"))

# ✅ Add CORS Middleware using FastAPI’s method (resolves type error)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://chartfly-web-site.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Serve Static Files (CSS, JS, Images)
app.mount("/static", StaticFiles(directory="static"), name="static")

# ✅ Setup Jinja2 for HTML Rendering
templates = Jinja2Templates(directory="templates")

# ✅ Admin Panel UI Route
@app.get("/")
@app.head("/")
async def admin_ui(request: Request):
    if request.method == "HEAD":
        return Response(status_code=200)
    return templates.TemplateResponse("admin.html", {"request": request})

# ✅ Handle HEAD requests for API endpoints
@app.head("/api/haltdetails")
async def head_halted_stocks():
    return Response(status_code=200)

# ✅ Include Routers
app.include_router(holidays_router, prefix="/api/holidays")
app.include_router(admin_router, prefix="/api/admin")
app.include_router(api_keys_router, prefix="/api/api-keys")
app.include_router(users_router, prefix="/api/users")
app.include_router(auth_router)
app.include_router(dev_reset_router)

# ✅ Placeholder for halted stocks API
@app.get("/api/haltdetails")
async def get_halted_stocks():
    return []

# ✅ Explicitly bind to correct port
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))