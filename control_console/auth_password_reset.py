# ==========================================================
# ✅ FILE: control_console/auth_password_reset.py
# 📌 PURPOSE: Handles "Forgot Password" logic and reset via email
# 🛠️ STATUS: Refactored (MPA Phase I) — Author: Captain & Chatman
# ==========================================================

import random
import re
import string

from fastapi import APIRouter, Form, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from passlib.hash import bcrypt
from starlette.status import HTTP_302_FOUND

from control_console.utils.email_sender import send_reset_email

router = APIRouter()
templates = Jinja2Templates(directory="templates")


# ✅ Forgot Password Page (GET)
@router.get("/forgot-password", response_class=HTMLResponse)
async def forgot_password_form(request: Request):
    return templates.TemplateResponse("forgot-password.html", {"request": request})


# ✅ Forgot Password Submission (POST)
@router.post("/forgot-password")
async def forgot_password_submit(
    request: Request,
    email: str = Form(...),
    phone_number: str = Form(...),
    method: str = Form(...),
):
    db = request.state.db
    email = email.strip()
    phone_number = phone_number.strip()

    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return templates.TemplateResponse(
            "forgot-password.html",
            {"request": request, "error": "Invalid email format."},
        )

    if not phone_number.isdigit() or len(phone_number) < 10:
        return templates.TemplateResponse(
            "forgot-password.html",
            {"request": request, "error": "Invalid phone number format."},
        )

    user = await db.fetchrow(
        """
        SELECT id FROM admin_users
        WHERE email = $1 AND phone_number = $2
        """,
        email,
        phone_number,
    )

    if not user:
        return templates.TemplateResponse(
            "forgot-password.html",
            {
                "request": request,
                "error": "No matching user found with that email and phone number.",
            },
        )

    temp_password = "".join(
        random.choices(string.ascii_letters + string.digits + string.punctuation, k=8)
    )
    hashed_temp = bcrypt.hash(temp_password)

    await db.execute(
        """
        UPDATE admin_users
        SET password_hash = $1, must_reset = TRUE
        WHERE id = $2
        """,
        hashed_temp,
        user[0],
    )

    if method == "email":
        success = send_reset_email(email, temp_password)
        if not success:
            return templates.TemplateResponse(
                "forgot-password.html",
                {
                    "request": request,
                    "error": "Failed to send email. Please try again later.",
                },
            )

    return RedirectResponse(url="/auth/login", status_code=HTTP_302_FOUND)
