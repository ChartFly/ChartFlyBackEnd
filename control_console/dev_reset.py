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
    expected_token = os.getenv("DEV_RESET_TOKEN")

    if token != expected_token:
        logger.warning("❌ Invalid reset token provided.")
        raise HTTPException(status_code=403, detail="Unauthorized access to developer reset")

    try:
        db = request.state.db

        # ✅ Clear all users
        await db.execute("DELETE FROM admin_users")

        # ✅ Add default super admin using environment variables
        default_email = os.getenv("DEFAULT_ADMIN_EMAIL")
        default_user = os.getenv("DEFAULT_ADMIN_USER")
        default_pass = os.getenv("DEFAULT_ADMIN_PASS")
        default_code = os.getenv("DEFAULT_ADMIN_CODE")
        default_role = os.getenv("DEFAULT_ADMIN_ROLE", "SuperAdmin")

        if not all([default_email, default_user, default_pass, default_code]):
            raise ValueError("Missing one or more DEFAULT_ADMIN_* environment variables.")

        hashed_pw = bcrypt.hash(default_pass)

        await db.execute("""
            INSERT INTO admin_users 
            (first_name, last_name, phone_number, email, username, password_hash, access_code, role)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        """, ("Default", "Admin", "000-000-0000", default_email, default_user, hashed_pw, default_code, default_role))

        logger.info("✅ Developer reset completed. Default admin user created.")
        return JSONResponse(status_code=200, content={
            "message": "System reset successfully. Default user created.",
            "username": default_user,
            "password": default_pass
        })

    except Exception as e:
        logger.error(f"❌ Developer reset failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))