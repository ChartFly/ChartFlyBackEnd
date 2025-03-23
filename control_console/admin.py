from fastapi import APIRouter, HTTPException, Request
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
async def get_admin_users(request: Request):
    db = request.state.db
    query = """
        SELECT id, first_name, last_name, phone_number, username, role
        FROM admin_users
    """
    rows = await db.fetch(query)
    return [dict(row) for row in rows]


# ✅ ADD New Admin User
@router.post("/", tags=["admin"])
async def add_admin_user(user: AdminUser, request: Request):
    db = request.state.db
    hashed_password = hash_password(user.password)
    query = """
        INSERT INTO admin_users (first_name, last_name, phone_number, username, password_hash, role)
        VALUES ($1, $2, $3, $4, $5, $6)
    """
    await db.execute(query, user.first_name, user.last_name, user.phone_number, user.username, hashed_password, user.role)
    return {"message": "Admin user added successfully"}


# ✅ DELETE Admin User
@router.delete("/{user_id}", tags=["admin"])
async def delete_admin_user(user_id: int, request: Request):
    db = request.state.db
    result = await db.execute("DELETE FROM admin_users WHERE id = $1", user_id)
    if result == "DELETE 0":
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "Admin user deleted successfully"}


# ✅ UPDATE Admin User
@router.put("/{user_id}", tags=["admin"])
async def update_admin_user(user_id: int, user: AdminUser, request: Request):
    db = request.state.db
    query = """
        UPDATE admin_users
        SET first_name = $1, last_name = $2, phone_number = $3, role = $4
        WHERE id = $5
    """
    result = await db.execute(query, user.first_name, user.last_name, user.phone_number, user.role, user_id)
    if result == "UPDATE 0":
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "Admin user updated successfully"}


# ✅ LOGIN (Validate Username & Password)
@router.post("/login", tags=["admin"])
async def login_admin(username: str, password: str, request: Request):
    db = request.state.db
    query = """
        SELECT id, username, password_hash, role
        FROM admin_users
        WHERE username = $1
    """
    user = await db.fetchrow(query, username)

    if not user or not verify_password(password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    return {"message": "Login successful", "user_id": user["id"], "role": user["role"]}