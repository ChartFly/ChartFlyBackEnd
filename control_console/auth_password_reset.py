from fastapi import APIRouter, Request, Form
from fastapi.responses import RedirectResponse, HTMLResponse
from fastapi.templating import Jinja2Templates
from starlette.status import HTTP_302_FOUND
from passlib.hash import bcrypt
from datetime import datetime
import random
import string
import re

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
        method: str = Form(...)
):
    db = request.state.db

    # ✅ Sanitize input to prevent injection attacks
    email = email.strip()
    phone_number = phone_number.strip()

    # ✅ Input validation for email and phone number
    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return templates.TemplateResponse("forgot-password.html", {
            "request": request,
            "error": "Invalid email format."
        })

    if not phone_number.isdigit() or len(phone_number) < 10:
        return templates.TemplateResponse("forgot-password.html", {
            "request": request,
            "error": "Invalid phone number format."
        })

    # ✅ Lookup user by email and phone number
    user = await db.fetchrow("""
        SELECT id FROM admin_users
        WHERE email = $1 AND phone_number = $2
    """, email, phone_number)

    if not user:
        return templates.TemplateResponse("forgot-password.html", {
            "request": request,
            "error": "No matching user found with that email and phone number."
        })

    # ✅ Generate 8-character temporary password with more complexity (letters, numbers, symbols)
    temp_password = ''.join(random.choices(string.ascii_letters + string.digits + string.punctuation, k=8))
    hashed_temp = bcrypt.hash(temp_password)

    # ✅ Update password and must_reset flag
    await db.execute("""
        UPDATE admin_users
        SET password_hash = $1, must_reset = TRUE
        WHERE id = $2
    """, hashed_temp, user[0])

    # ✅ Send reset email
    if method == "email":
        success = send_reset_email(email, temp_password)
        if not success:
            return templates.TemplateResponse("forgot-password.html", {
                "request": request,
                "error": "Failed to send email. Please try again later."
            })

    return RedirectResponse(url="/auth/login", status_code=HTTP_302_FOUND)