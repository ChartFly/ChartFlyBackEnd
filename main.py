from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from control_console.holidays import router as holidays_router  # ✅ Ensure this file exists!

app = FastAPI(
    title="ChartFly API",
    description="Backend for ChartFly Trading Tools",
    version="1.0.0",
    docs_url="/docs",  # ✅ Enable Swagger UI
    redoc_url="/redoc",  # ✅ Enable ReDoc documentation
)

# ✅ CORS Middleware for Frontend Requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this to ["https://chartfly-web-site.onrender.com"] for security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Serve Static Files (CSS, JS, Images)
app.mount("/static", StaticFiles(directory="static"), name="static")

# ✅ Setup Jinja2 for HTML Rendering
templates = Jinja2Templates(directory="templates")

# ✅ Route for Backend UI (Admin Panel) at `/`
@app.get("/")
async def admin_ui(request: Request):
    return templates.TemplateResponse("admin.html", {"request": request})

# ✅ Include API Routes for holidays
app.include_router(holidays_router, prefix="/api/holidays")

# 🚨 **Temporarily Disable Nasdaq API Call for Halted Stocks**
@app.get("/api/haltdetails")
async def get_halted_stocks():
    return {
        "status": "disabled",
        "message": "The halted stocks API is temporarily unavailable while we find a new data source."
    }