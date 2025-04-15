# ===================================================
# ✅ user_management_routes.py
# 🧾 FastAPI routes for Admin User CRUD operations
# 📍 Mounted at: /api/users in main.py
# Author: Captain & Chatman
# ===================================================

from typing import List

from asyncpg import Connection
from fastapi import APIRouter, HTTPException, Request

from control_console.user_management import create_user
from control_console.user_management import delete_user as delete_user_record
from control_console.user_management import (
    fetch_all_users,
    fetch_user_by_id,
    update_user,
)

router = APIRouter()  # Mounted at prefix="/api/users"


# 🧱 GET all admin users
@router.get("/")
async def get_all(request: Request):
    db: Connection = request.state.db
    return await fetch_all_users(db)


# 🧾 GET available tab names (for checkboxes)
@router.get("/tabs")
async def get_tabs():
    return ["Market Holidays", "API Keys", "User Management"]


# 🧱 GET single user by ID
@router.get("/{user_id}")
async def get_by_id(user_id: str, request: Request):
    db: Connection = request.state.db
    user = await fetch_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# ➕ CREATE user
@router.post("/")
async def create(request: Request):
    db: Connection = request.state.db
    data = await request.json()
    try:
        await create_user(db, data)
        return {"message": "User created"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ✏️ UPDATE user
@router.put("/{user_id}")
async def update(user_id: str, request: Request):
    db: Connection = request.state.db
    data = await request.json()
    try:
        await update_user(db, user_id, data)
        return {"message": "User updated"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# 🗑️ DELETE user
@router.delete("/{user_id}")
async def delete(user_id: str, request: Request):
    db: Connection = request.state.db
    await delete_user_record(db, user_id)
    return {"message": "User deleted"}
