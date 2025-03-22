from fastapi import APIRouter, Request, Form
from fastapi.responses import RedirectResponse, HTMLResponse
from fastapi.templating import Jinja2Templates
from starlette.status import HTTP_302_FOUND
from passlib.hash import bcrypt
from uuid import uuid4
from datetime import datetime, timedelta, UTC
import re

from db import get_db_connection
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
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT id FROM admin_users
        WHERE email = %s AND phone_number = %s
    """, (email.strip(), phone_number.strip()))
    user = cur.fetchone()

    if not user:
        cur.close()
        conn.close()
        return templates.TemplateResponse("forgot-password.html", {
            "request": request,
            "error": "No matching user found with that email and phone number."
        })

    token = str(uuid4())
    expires = datetime.now(UTC) + timedelta(minutes=15)

    cur.execute("""
        UPDATE admin_users
        SET reset_token = %s, reset_token_expires = %s
        WHERE id = %s
    """, (token, expires, user[0]))

    conn.commit()
    cur.close()
    conn.close()

    if method == "email":
        success = send_reset_email(email, token)
        if not success:
            return templates.TemplateResponse("forgot-password.html", {
                "request": request,
                "error": "Failed to send email. Please try again later."
            })

    return RedirectResponse(url="/auth/login", status_code=HTTP_302_FOUND)

# ✅ Reset Password Page (GET)
@router.get("/reset-password", response_class=HTMLResponse)
async def reset_password_form(request: Request, token: str):
    return templates.TemplateResponse("reset-password.html", {"request": request, "token": token})

# ✅ Reset Password Submission (POST)
@router.post("/reset-password")
async def reset_password(
    request: Request,
    token: str = Form(...),
    new_password: str = Form(...),
    confirm_password: str = Form(...)
):
    if new_password != confirm_password:
        return templates.TemplateResponse("reset-password.html", {
            "request": request,
            "token": token,
            "error": "Passwords do not match."
        })

    if (
        len(new_password) < 6 or
        not re.search(r"[A-Za-z]", new_password) or
        not re.search(r"\d", new_password) or
        not re.search(r"[^A-Za-z0-9]", new_password)
    ):
        return templates.TemplateResponse("reset-password.html", {
            "request": request,
            "token": token,
            "error": "Password must be at least 6 characters and include a letter, number, and symbol."
        })

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT id, reset_token_expires FROM admin_users WHERE reset_token = %s", (token,))
    user = cur.fetchone()

    if not user:
        cur.close()
        conn.close()
        return templates.TemplateResponse("reset-password.html", {
            "request": request,
            "token": token,
            "error": "Invalid or expired reset token."
        })

    user_id, expires = user
    if expires and expires < datetime.now(UTC):
        cur.close()
        conn.close()
        return templates.TemplateResponse("reset-password.html", {
            "request": request,
            "token": token,
            "error": "Reset token has expired."
        })

    hashed_pw = bcrypt.hash(new_password)

    cur.execute("""
        UPDATE admin_users 
        SET password_hash = %s, reset_token = NULL, reset_token_expires = NULL
        WHERE id = %s
    """, (hashed_pw, user_id))

    conn.commit()
    cur.close()
    conn.close()

    return RedirectResponse(url="/auth/login", status_code=HTTP_302_FOUND)