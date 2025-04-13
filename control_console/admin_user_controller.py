# ==========================================================
# ✅ FILE: control_console/admin_user_controller.py
# 📌 PURPOSE: Admin user CRUD operations for ChartFly backend
# 🛠️ STATUS: Refactored (MPA Phase I) — Author: Captain & Chatman
# ==========================================================

from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
import logging
import bcrypt
import os

router = APIRouter(prefix="/api/users")

# ✅ Configure logging
logging.basicConfig(level=logging.INFO)

# ✅ Load default password from environment
DEFAULT_ADMIN_PASS = os.getenv("DEFAULT_ADMIN_PASS", "changeme123!")

# ✅ Admin User Schema
class AdminUser(BaseModel):
    first_name: str
    last_name: str
    phone_number: str
    email: str
    username: str
    role: str

# ✅ Utility: Hash Password
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

# ✅ GET All Admin Users
@router.get("/", tags=["admin_users"])
async def get_all_admin_users(request: Request):
    try:
        db = request.state.db
        rows = await db.fetch("SELECT id, first_name, last_name, phone_number, email, username, role FROM admin_users")
        logging.info("✅ Fetched all admin users.")
        return [dict(row) for row in rows]
    except Exception as e:
        logging.error(f"❌ Error fetching users: {e}")
        raise HTTPException(status_code=500, detail="Error fetching users")

# ✅ ADD New Admin User
@router.post("/", tags=["admin_users"])
async def add_admin_user(user: AdminUser, request: Request):
    try:
        db = request.state.db
        default_password = hash_password(DEFAULT_ADMIN_PASS)
        await db.execute("""
            INSERT INTO admin_users (first_name, last_name, phone_number, email, username, role, password_hash)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        """, user.first_name, user.last_name, user.phone_number, user.email, user.username, user.role, default_password)
        logging.info(f"✅ Added new admin user: {user.username}")
        return {"message": "Admin user added successfully"}
    except Exception as e:
        logging.error(f"❌ Error adding user {user.username}: {e}")
        raise HTTPException(status_code=500, detail="Error adding user")

# ✅ UPDATE Admin User
@router.put("/{user_id}", tags=["admin_users"])
async def update_admin_user(user_id: int, user: AdminUser, request: Request):
    try:
        db = request.state.db
        result = await db.execute("""
            UPDATE admin_users
            SET first_name = $1, last_name = $2, phone_number = $3, email = $4, username = $5, role = $6
            WHERE id = $7
        """, user.first_name, user.last_name, user.phone_number, user.email, user.username, user.role, user_id)
        if result == "UPDATE 0":
            raise HTTPException(status_code=404, detail="User not found")
        logging.info(f"✅ Updated admin user ID: {user_id}")
        return {"message": "Admin user updated successfully"}
    except Exception as e:
        logging.error(f"❌ Error updating user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Error updating user")

# ✅ DELETE Admin User
@router.delete("/{user_id}", tags=["admin_users"])
async def delete_admin_user(user_id: int, request: Request):
    try:
        db = request.state.db
        result = await db.execute("DELETE FROM admin_users WHERE id = $1", user_id)
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="User not found")
        logging.info(f"🗑️ Deleted admin user ID: {user_id}")
        return {"message": "Admin user deleted successfully"}
    except Exception as e:
        logging.error(f"❌ Error deleting user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Error deleting user")
