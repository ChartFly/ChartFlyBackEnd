# ==========================================================
# ✅ FILE: control_console/dev_reset.py
# 📌 PURPOSE: Emergency developer reset route
# 🛠️ STATUS: Active (MPA Phase I) — Author: Captain & Chatman
# ==========================================================

import logging

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from passlib.hash import bcrypt

# ✅ Import secrets from config
from control_console.config import (
    DEFAULT_ADMIN_CODE,
    DEFAULT_ADMIN_EMAIL,
    DEFAULT_ADMIN_PASS,
    DEFAULT_ADMIN_ROLE,
    DEFAULT_ADMIN_USER,
    DEV_RESET_TOKEN,
)

router = APIRouter()

# ✅ Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@router.get("/developer-reset", tags=["dev"])
async def developer_emergency_reset(request: Request):
    token = request.query_params.get("token")

    if token != DEV_RESET_TOKEN:
        logger.warning("❌ Invalid reset token provided.")
        raise HTTPException(
            status_code=403, detail="Unauthorized access to developer reset"
        )

    try:
        db = request.state.db

        # ✅ Clear all users
        await db.execute("DELETE FROM admin_users")

        # ✅ Add default super admin using config values
        if not all(
            [
                DEFAULT_ADMIN_EMAIL,
                DEFAULT_ADMIN_USER,
                DEFAULT_ADMIN_PASS,
                DEFAULT_ADMIN_CODE,
            ]
        ):
            raise ValueError(
                "Missing one or more DEFAULT_ADMIN_* environment variables."
            )

        hashed_pw = bcrypt.hash(DEFAULT_ADMIN_PASS)

        await db.execute(
            """
            INSERT INTO admin_users
            (first_name, last_name, phone_number, email, username, password_hash, access_code, role)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        """,
            (
                "Default",
                "Admin",
                "000-000-0000",
                DEFAULT_ADMIN_EMAIL,
                DEFAULT_ADMIN_USER,
                hashed_pw,
                DEFAULT_ADMIN_CODE,
                DEFAULT_ADMIN_ROLE,
            ),
        )

        logger.info("✅ Developer reset completed. Default admin user created.")
        return JSONResponse(
            status_code=200,
            content={
                "message": "System reset successfully. Default user created.",
                "username": DEFAULT_ADMIN_USER,
                "password": DEFAULT_ADMIN_PASS,
            },
        )

    except Exception as e:
        logger.error(f"❌ Developer reset failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
