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