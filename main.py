from fastapi import FastAPI
from control_console.holidays import router as holidays_router

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Welcome to ChartFly Backend!"}

app.include_router(holidays_router, prefix="/api/holidays")