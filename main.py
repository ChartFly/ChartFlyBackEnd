from fastapi import FastAPI
from control_console.holidays import router as holidays_router

app = FastAPI()

# Include your holidays router
app.include_router(holidays_router)

@app.get("/")
def read_root():
    return {"message": "Welcome to ChartFly Backend!"}