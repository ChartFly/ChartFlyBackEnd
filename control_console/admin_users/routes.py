from fastapi import APIRouter, HTTPException, Request
from passlib.hash import bcrypt
from uuid import uuid4
from typing import List
import asyncpg

router = APIRouter()  # Mounts in main.py at: prefix="/api/users"

# 🧱 GET all admin users
@router.get("/")
async def get_all_users(request: Request):
    db: asyncpg.Connection = request.state.db
    rows = await db.fetch("SELECT * FROM admin_users ORDER BY last_name ASC")
    return [
        {
            "id": row["id"],
            "name": f"{row['first_name']} {row['last_name']}".strip(),
            "email": row["email"],
            "phone": row["phone_number"],
            "address": row["address"],
            "username": row["username"],
            "access": await get_user_access(db, str(row["id"]))  # ✅ Fix
        }
        for row in rows
    ]

# 🧱 GET single user by ID
@router.get("/{user_id}")
async def get_user(user_id: str, request: Request):
    db: asyncpg.Connection = request.state.db
    user = await db.fetchrow("SELECT * FROM admin_users WHERE id = $1", user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": user["id"],
        "name": f"{user['first_name']} {user['last_name']}".strip(),
        "email": user["email"],
        "phone": user["phone_number"],
        "address": user["address"],
        "username": user["username"],
        "access": await get_user_access(db, str(user["id"]))  # ✅ Fix
    }

# ➕ CREATE user
@router.post("/")
async def create_user(request: Request):
    db: asyncpg.Connection = request.state.db
    data = await request.json()

    if data["password"] != data["confirmPassword"]:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    hashed = bcrypt.hash(data["password"])
    user_id = str(uuid4())

    await db.execute("""
        INSERT INTO admin_users (id, first_name, last_name, email, phone_number, address, username, password_hash)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    """, user_id, data["first_name"], data["last_name"], data["email"], data["phone"], data["address"], data["username"], hashed)

    await set_user_permissions(db, user_id, data["access"])
    return {"message": "User created"}

# ✏️ UPDATE user
@router.put("/{user_id}")
async def update_user(user_id: str, request: Request):
    db: asyncpg.Connection = request.state.db
    data = await request.json()

    if data.get("password"):
        if data["password"] != data["confirmPassword"]:
            raise HTTPException(status_code=400, detail="Passwords do not match")
        hashed = bcrypt.hash(data["password"])
        await db.execute("""
            UPDATE admin_users
            SET first_name=$1, last_name=$2, email=$3, phone_number=$4, address=$5, username=$6, password_hash=$7
            WHERE id=$8
        """, data["first_name"], data["last_name"], data["email"], data["phone"], data["address"], data["username"], hashed, user_id)
    else:
        await db.execute("""
            UPDATE admin_users
            SET first_name=$1, last_name=$2, email=$3, phone_number=$4, address=$5, username=$6
            WHERE id=$7
        """, data["first_name"], data["last_name"], data["email"], data["phone"], data["address"], data["username"], user_id)

    await set_user_permissions(db, user_id, data["access"])
    return {"message": "User updated"}

# 🗑️ DELETE user
@router.delete("/{user_id}")
async def delete_user(user_id: str, request: Request):
    db: asyncpg.Connection = request.state.db
    await db.execute("DELETE FROM admin_permissions WHERE user_id = $1", user_id)
    await db.execute("DELETE FROM admin_users WHERE id = $1", user_id)
    return {"message": "User deleted"}

# 🧾 GET available tab names (for checkboxes)
@router.get("/tabs")
async def get_tabs():
    return ["Market Holidays", "API Keys", "User Management"]

# 🔐 Helper: get access tabs for user
async def get_user_access(db, user_id):
    rows = await db.fetch("SELECT tab_name FROM admin_permissions WHERE user_id = $1", user_id)
    return [r["tab_name"] for r in rows]

# 🔐 Helper: update tab access
async def set_user_permissions(db, user_id, tabs: List[str]):
    await db.execute("DELETE FROM admin_permissions WHERE user_id = $1", user_id)
    for tab in tabs:
        await db.execute("INSERT INTO admin_permissions (user_id, tab_name) VALUES ($1, $2)", user_id, tab)