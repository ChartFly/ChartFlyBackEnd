from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse
from passlib.hash import bcrypt
import os
import logging

router = APIRouter()

# ✅ Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@router.get("/developer-reset", tags=["dev"])
async def developer_emergency_reset(request: Request):
    token = request.query_params.get("token")
    expected_token = os.getenv("DEV_RESET_TOKEN", "chartfly_mega_secret_token_8932")

    if token != expected_token:
        logger.warning("❌ Invalid reset token provided.")
        raise HTTPException(status_code=403, detail="Unauthorized access to developer reset")

    try:
        db = request.state.db

        # ✅ Clear all users
        await db.execute("DELETE FROM admin_users")

        # ✅ Add default super admin
        hashed_pw = bcrypt.hash("admin123")
        await db.execute("""
            INSERT INTO admin_users (first_name, last_name, phone_number, username, password_hash, access_code, role)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        """, ("Default", "Admin", "000-000-0000", "admin", hashed_pw, "RESET123", "SuperAdmin"))

        logger.info("✅ Developer reset completed. Default admin user created.")
        return JSONResponse(status_code=200, content={
            "message": "System reset successfully. Default user created.",
            "username": "admin",
            "password": "admin123"
        })

    except Exception as e:
        logger.error(f"❌ Developer reset failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))