from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import text
from control_console.database import engine
from pydantic import BaseModel
import bcrypt

router = APIRouter()

# ✅ User Model (Request Data)
class AdminUser(BaseModel):
    first_name: str
    last_name: str
    phone_number: str
    username: str
    password: str  # Plain password for registration
    role: str  # e.g., "admin" or "user"

# ✅ Utility: Hash Password
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

# ✅ Utility: Verify Password
def verify_password(password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))

# ✅ GET All Admin Users
@router.get("/", tags=["admin"])
def get_admin_users():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT id, first_name, last_name, phone_number, username, role FROM admin_users"))
        users = [dict(row) for row in result.mappings()]
    return users

# ✅ ADD New Admin User
@router.post("/", tags=["admin"])
def add_admin_user(user: AdminUser):
    hashed_password = hash_password(user.password)
    with engine.connect() as connection:
        connection.execute(
            text("INSERT INTO admin_users (first_name, last_name, phone_number, username, password_hash, role) VALUES (:first_name, :last_name, :phone_number, :username, :password, :role)"),
            {"first_name": user.first_name, "last_name": user.last_name, "phone_number": user.phone_number, "username": user.username, "password": hashed_password, "role": user.role}
        )
        connection.commit()
    return {"message": "Admin user added successfully"}

# ✅ DELETE Admin User
@router.delete("/{user_id}", tags=["admin"])
def delete_admin_user(user_id: int):
    with engine.connect() as connection:
        result = connection.execute(text("DELETE FROM admin_users WHERE id = :id"), {"id": user_id})
        connection.commit()
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "Admin user deleted successfully"}

# ✅ UPDATE Admin User (Change Role or Phone)
@router.put("/{user_id}", tags=["admin"])
def update_admin_user(user_id: int, user: AdminUser):
    with engine.connect() as connection:
        result = connection.execute(
            text("UPDATE admin_users SET first_name=:first_name, last_name=:last_name, phone_number=:phone_number, role=:role WHERE id=:id"),
            {"id": user_id, "first_name": user.first_name, "last_name": user.last_name, "phone_number": user.phone_number, "role": user.role}
        )
        connection.commit()
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "Admin user updated successfully"}

# ✅ LOGIN (Validate Username & Password)
@router.post("/login", tags=["admin"])
def login_admin(username: str, password: str):
    with engine.connect() as connection:
        result = connection.execute(text("SELECT id, username, password_hash, role FROM admin_users WHERE username = :username"), {"username": username})
        user = result.fetchone()

    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    return {"message": "Login successful", "user_id": user.id, "role": user.role}