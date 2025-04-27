# ===============================================
# 📁 FILE: thinkscripts.py
# 📍 LOCATION: api/stores/thinkscripts.py
# 🎯 PURPOSE: Backend API for ThinkScripts Store Admin
# 👥 Author: Captain & Chatman
# ===============================================

from fastapi import APIRouter

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


@router.get("/api/stores/thinkscripts")
async def get_thinkscripts():
    return fake_scripts
