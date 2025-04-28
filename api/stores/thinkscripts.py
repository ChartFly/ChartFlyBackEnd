# ===============================================
# 📁 FILE: thinkscripts.py
# 📍 LOCATION: api/stores/thinkscripts.py
# 🎯 PURPOSE: Backend API for ThinkScripts Store Admin (RedStripe Upgrade)
# 👥 Author: Captain & Chatman
# ===============================================

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

# Temporary static data
fake_scripts = [
    {
        "id": "TS001",
        "label": "Golden Cross Strategy",
        "short_description": "A simple moving average crossover script.",
        "price": 19.99,
        "active": True,
    },
    {
        "id": "TS002",
        "label": "RSI Breakout Alert",
        "short_description": "Alerts when RSI crosses 70 or 30.",
        "price": 9.99,
        "active": False,
    },
]


class ThinkScript(BaseModel):
    id: str
    label: str
    short_description: str
    price: float
    active: bool


@router.get("/api/stores/thinkscripts")
async def get_thinkscripts():
    return fake_scripts


@router.delete("/api/stores/thinkscripts/{script_id}")
async def delete_thinkscript(script_id: str):
    global fake_scripts
    original_length = len(fake_scripts)
    fake_scripts = [s for s in fake_scripts if s["id"] != script_id]
    if len(fake_scripts) == original_length:
        raise HTTPException(status_code=404, detail="Script not found")
    return {"message": f"Script {script_id} deleted successfully"}


@router.post("/api/stores/thinkscripts")
async def add_thinkscript(script: ThinkScript):
    # Make sure ID is unique (very basic check)
    if any(s["id"] == script.id for s in fake_scripts):
        raise HTTPException(status_code=400, detail="Script ID already exists")
    fake_scripts.append(script.dict())
    return {"message": f"Script {script.id} added successfully"}
