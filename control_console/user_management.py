# ===================================================
# ✅ user_management.py
# 🧠 Database logic for admin users and permissions
# ===================================================

from datetime import datetime
from typing import List, Optional
from uuid import uuid4

from asyncpg import Connection
from passlib.hash import bcrypt


# ✅ Fetch all users
async def fetch_all_users(db: Connection):
    rows = await db.fetch("SELECT * FROM admin_users ORDER BY last_name ASC")
    return [
        {
            "id": row["id"],
            "name": f"{row['first_name']} {row['last_name']}".strip(),
            "email": row["email"],
            "phone": row["phone_number"],
            "address": row["address"],
            "username": row["username"],
            "access": await get_user_access(db, row["id"]),
        }
        for row in rows
    ]


# ✅ Fetch single user
async def fetch_user_by_id(db: Connection, user_id: str):
    user = await db.fetchrow("SELECT * FROM admin_users WHERE id = $1", user_id)
    if not user:
        return None
    return {
        "id": user["id"],
        "name": f"{user['first_name']} {user['last_name']}".strip(),
        "email": user["email"],
        "phone": user["phone_number"],
        "address": user["address"],
        "username": user["username"],
        "access": await get_user_access(db, user["id"]),
    }


# ✅ Create user
async def create_user(db: Connection, data: dict):
    if data["password"] != data["confirmPassword"]:
        raise ValueError("Passwords do not match")
    hashed = bcrypt.hash(data["password"])
    user_id = str(uuid4())
    await db.execute(
        """
        INSERT INTO admin_users (id, first_name, last_name, email, phone_number, address, username, password_hash)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    """,
        user_id,
        data["first_name"],
        data["last_name"],
        data["email"],
        data["phone"],
        data["address"],
        data["username"],
        hashed,
    )
    await set_user_permissions(db, user_id, data["access"])
    return user_id


# ✅ Update user
async def update_user(db: Connection, user_id: str, data: dict):
    if data.get("password"):
        if data["password"] != data["confirmPassword"]:
            raise ValueError("Passwords do not match")
        hashed = bcrypt.hash(data["password"])
        await db.execute(
            """
            UPDATE admin_users
            SET first_name=$1, last_name=$2, email=$3, phone_number=$4, address=$5, username=$6, password_hash=$7
            WHERE id=$8
        """,
            data["first_name"],
            data["last_name"],
            data["email"],
            data["phone"],
            data["address"],
            data["username"],
            hashed,
            user_id,
        )
    else:
        await db.execute(
            """
            UPDATE admin_users
            SET first_name=$1, last_name=$2, email=$3, phone_number=$4, address=$5, username=$6
            WHERE id=$7
        """,
            data["first_name"],
            data["last_name"],
            data["email"],
            data["phone"],
            data["address"],
            data["username"],
            user_id,
        )

    await set_user_permissions(db, user_id, data["access"])


# ✅ Delete user
async def delete_user(db: Connection, user_id: str):
    await db.execute("DELETE FROM admin_permissions WHERE user_id = $1", user_id)
    await db.execute("DELETE FROM admin_users WHERE id = $1", user_id)


# ✅ Permissions helpers
async def get_user_access(db: Connection, user_id: str) -> List[str]:
    rows = await db.fetch(
        "SELECT tab_name FROM admin_permissions WHERE user_id = $1", user_id
    )
    return [r["tab_name"] for r in rows]


async def set_user_permissions(db: Connection, user_id: str, tabs: List[str]):
    await db.execute("DELETE FROM admin_permissions WHERE user_id = $1", user_id)
    for tab in tabs:
        await db.execute(
            "INSERT INTO admin_permissions (user_id, tab_name) VALUES ($1, $2)",
            user_id,
            tab,
        )
