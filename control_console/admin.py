from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from control_console.database import AsyncSessionLocal
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


# ✅ Dependency for Async Database Session
async def get_db_session() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session


# ✅ Utility: Hash Password
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


# ✅ Utility: Verify Password
def verify_password(password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))


# ✅ GET All Admin Users
@router.get("/", tags=["admin"])
async def get_admin_users(db: AsyncSession = Depends(get_db_session)):
    result = await db.execute(text("SELECT id, first_name, last_name, phone_number, username, role FROM admin_users"))
    users = [dict(row) for row in result.mappings()]
    return users


# ✅ ADD New Admin User
@router.post("/", tags=["admin"])
async def add_admin_user(user: AdminUser, db: AsyncSession = Depends(get_db_session)):
    hashed_password = hash_password(user.password)
    await db.execute(
        text(
            "INSERT INTO admin_users (first_name, last_name, phone_number, username, password_hash, role) VALUES (:first_name, :last_name, :phone_number, :username, :password, :role)"),
        {"first_name": user.first_name, "last_name": user.last_name, "phone_number": user.phone_number,
         "username": user.username, "password": hashed_password, "role": user.role}
    )
    await db.commit()
    return {"message": "Admin user added successfully"}


# ✅ DELETE Admin User
@router.delete("/{user_id}", tags=["admin"])
async def delete_admin_user(user_id: int, db: AsyncSession = Depends(get_db_session)):
    result = await db.execute(text("DELETE FROM admin_users WHERE id = :id"), {"id": user_id})
    await db.commit()

    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="User not found")

    return {"message": "Admin user deleted successfully"}


# ✅ UPDATE Admin User (Change Role or Phone)
@router.put("/{user_id}", tags=["admin"])
async def update_admin_user(user_id: int, user: AdminUser, db: AsyncSession = Depends(get_db_session)):
    result = await db.execute(
        text(
            "UPDATE admin_users SET first_name=:first_name, last_name=:last_name, phone_number=:phone_number, role=:role WHERE id=:id"),
        {"id": user_id, "first_name": user.first_name, "last_name": user.last_name, "phone_number": user.phone_number,
         "role": user.role}
    )
    await db.commit()

    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="User not found")

    return {"message": "Admin user updated successfully"}


# ✅ LOGIN (Validate Username & Password)
@router.post("/login", tags=["admin"])
async def login_admin(username: str, password: str, db: AsyncSession = Depends(get_db_session)):
    result = await db.execute(
        text("SELECT id, username, password_hash, role FROM admin_users WHERE username = :username"),
        {"username": username})
    user = result.fetchone()

    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    return {"message": "Login successful", "user_id": user.id, "role": user.role}