from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from control_console.holidays import router as holidays_router

app = FastAPI()

# ✅ Serve Static Files (CSS, JS, Images)
app.mount("/static", StaticFiles(directory="static"), name="static")

# ✅ Setup Jinja2 for HTML Rendering
templates = Jinja2Templates(directory="templates")

# ✅ Route for Admin UI
@app.get("/")
@app.get("/admin")
async def admin_ui(request: Request):
    return templates.TemplateResponse("admin.html", {"request": request})

# ✅ Include API Routes
app.include_router(holidays_router, prefix="/api/holidays")

import requests
from fastapi import FastAPI

app = FastAPI()

NASDAQ_API_KEY = "your_real_nasdaq_api_key"

@app.get("/api/haltdetails")
async def get_halted_stocks():
    """
    Fetch halted stocks from Nasdaq and return the JSON response.
    """
    url = "https://api.nasdaq.com/api/marketmovers/halted"
    headers = {"Authorization": f"Bearer {NASDAQ_API_KEY}"}

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        return {"error": str(e)}