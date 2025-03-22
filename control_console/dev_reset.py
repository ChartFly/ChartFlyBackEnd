from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse
from passlib.hash import bcrypt
import os
import psycopg2

from db import get_db_connection

router = APIRouter()

@router.get("/developer-reset")
async def developer_emergency_reset(request: Request):
    token = request.query_params.get("token")
    expected_token = os.getenv("DEV_RESET_TOKEN", "chartfly_mega_secret_token_8932")

    if token != expected_token:
        raise HTTPException(status_code=403, detail="Unauthorized access to developer reset")

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Clear all users
        cur.execute("DELETE FROM admin_users")

        # Add default super admin
        hashed_pw = bcrypt.hash("admin123")
        cur.execute("""
            INSERT INTO admin_users (first_name, last_name, phone_number, username, password_hash, access_code, role)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, ("Default", "Admin", "000-000-0000", "admin", hashed_pw, "RESET123", "SuperAdmin"))

        conn.commit()
        cur.close()
        conn.close()

        return JSONResponse(status_code=200, content={
            "message": "System reset successfully. Default user created.",
            "username": "admin",
            "password": "admin123"
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))