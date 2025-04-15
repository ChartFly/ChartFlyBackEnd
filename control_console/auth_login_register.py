# ==========================================================
# ✅ FILE: control_console/auth_login_register.py
# 📌 PURPOSE: Login, registration, password reset, and session control
# 🛠️ STATUS: Refactored (MPA Phase I) — Author: Captain & Chatman
# ==========================================================

import os
import random
import re
import string

from fastapi import APIRouter, Form, Request
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from passlib.hash import bcrypt
from starlette.status import HTTP_302_FOUND

from control_console.rate_limiter import is_rate_limited, record_attempt
from control_console.utils.email_sender import send_reset_email

router = APIRouter()
templates = Jinja2Templates(directory="templates")


# ✅ Login Page (GET)
@router.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})


# ✅ Login Submission (POST)
@router.post("/login")
async def login(request: Request, username: str = Form(...), password: str = Form(...)):
    client_ip = request.client.host
    blocked, wait_time = await is_rate_limited(request.state.db, client_ip)
    if blocked:
        return templates.TemplateResponse(
            "login.html",
            {
                "request": request,
                "error": f"⛔ Too many login attempts. Try again in {wait_time // 60} min.",
            },
        )

    db = request.state.db
    user = await db.fetchrow(
        "SELECT id, password_hash, must_reset FROM admin_users WHERE username = $1",
        username.strip(),
    )

    if user and bcrypt.verify(password, user["password_hash"]):
        request.session["user_id"] = str(user["id"])
        request.session["username"] = username

        if user["must_reset"]:
            return RedirectResponse(
                url="/auth/force-reset-password", status_code=HTTP_302_FOUND
            )

        return RedirectResponse(url="/", status_code=HTTP_302_FOUND)

    await record_attempt(db, client_ip)
    return templates.TemplateResponse(
        "login.html", {"request": request, "error": "Invalid username or password"}
    )


# ✅ Force Reset Password (GET)
@router.get("/force-reset-password", response_class=HTMLResponse)
async def force_reset_page(request: Request):
    if not request.session.get("user_id"):
        return RedirectResponse(url="/auth/login", status_code=HTTP_302_FOUND)
    return templates.TemplateResponse("force-reset.html", {"request": request})


# ✅ Force Reset Password (POST)
@router.post("/force-reset-password")
async def force_reset_submit(
    request: Request, new_password: str = Form(...), confirm_password: str = Form(...)
):
    if not request.session.get("user_id"):
        return RedirectResponse(url="/auth/login", status_code=HTTP_302_FOUND)

    if new_password != confirm_password:
        return templates.TemplateResponse(
            "force-reset.html", {"request": request, "error": "Passwords do not match."}
        )

    if (
        len(new_password) < 6
        or not re.search(r"[A-Za-z]", new_password)
        or not re.search(r"\d", new_password)
        or not re.search(r"[^A-Za-z0-9]", new_password)
    ):
        return templates.TemplateResponse(
            "force-reset.html",
            {
                "request": request,
                "error": "Password must be at least 6 characters and include a letter, number, and symbol.",
            },
        )

    user_id = request.session["user_id"]
    hashed_pw = bcrypt.hash(new_password)

    db = request.state.db
    await db.execute(
        "UPDATE admin_users SET password_hash = $1, must_reset = FALSE WHERE id = $2",
        hashed_pw,
        user_id,
    )

    request.session.clear()
    return RedirectResponse(url="/auth/login", status_code=HTTP_302_FOUND)


# ✅ Registration Page (GET)
@router.get("/register", response_class=HTMLResponse)
async def register_page(request: Request):
    return templates.TemplateResponse("register.html", {"request": request})


# ✅ Registration Submission (POST)
@router.post("/register")
async def register(
    request: Request,
    first_name: str = Form(...),
    last_name: str = Form(...),
    phone_number: str = Form(...),
    email: str = Form(...),
    username: str = Form(...),
    password: str = Form(...),
    confirm_password: str = Form(...),
    access_code: str = Form(...),
    enable_2fa: str = Form(None),
):
    if password != confirm_password:
        return templates.TemplateResponse(
            "register.html", {"request": request, "error": "Passwords do not match."}
        )

    if (
        len(password) < 6
        or not re.search(r"[A-Za-z]", password)
        or not re.search(r"\d", password)
        or not re.search(r"[^A-Za-z0-9]", password)
    ):
        return templates.TemplateResponse(
            "register.html",
            {
                "request": request,
                "error": "Password must be at least 6 characters and include a letter, number, and symbol.",
            },
        )

    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return templates.TemplateResponse(
            "register.html", {"request": request, "error": "Invalid email address."}
        )

    db = request.state.db

    existing_user = await db.fetchrow("SELECT * FROM admin_users LIMIT 1")
    if existing_user:
        if username.strip() == existing_user["username"] and bcrypt.verify(
            password, existing_user["password_hash"]
        ):
            return templates.TemplateResponse(
                "register.html",
                {
                    "request": request,
                    "info": "You are already registered. Click below to log in.",
                },
            )
        return templates.TemplateResponse(
            "register.html",
            {
                "request": request,
                "error": "No such user or password. Access denied.",
            },
        )

    hashed_pw = bcrypt.hash(password)

    await db.execute(
        """
        INSERT INTO admin_users
        (first_name, last_name, phone_number, email, username, password_hash, access_code, is_2fa_enabled)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    """,
        first_name.strip(),
        last_name.strip(),
        phone_number.strip(),
        email.strip(),
        username.strip(),
        hashed_pw,
        access_code.strip(),
        enable_2fa == "on",
    )

    return RedirectResponse(url="/auth/login", status_code=HTTP_302_FOUND)


# ✅ Logout
@router.get("/logout")
async def logout(request: Request):
    request.session.clear()
    return RedirectResponse(url="/auth/login", status_code=HTTP_302_FOUND)


# ✅ Developer Reset Endpoint
@router.get("/dev-reset")
async def dev_reset(request: Request, token: str):
    expected_token = os.getenv("DEV_RESET_TOKEN", "")
    default_email = os.getenv("DEFAULT_ADMIN_EMAIL", "admin@example.com")
    default_user = os.getenv("DEFAULT_ADMIN_USER", "admin")
    default_pass = os.getenv("DEFAULT_ADMIN_PASS", "admin123")
    default_code = os.getenv("DEFAULT_ADMIN_CODE", "reset-code-123")

    if token != expected_token:
        return JSONResponse(status_code=403, content={"error": "Unauthorized"})

    db = request.state.db
    existing = await db.fetchrow(
        "SELECT id FROM admin_users WHERE username = $1", default_user
    )
    if existing:
        return JSONResponse(
            status_code=200, content={"message": "Admin user already exists."}
        )

    hashed_pw = bcrypt.hash(default_pass)
    await db.execute(
        """
        INSERT INTO admin_users
        (first_name, last_name, phone_number, email, username, password_hash, access_code, role, is_2fa_enabled)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    """,
        "Default",
        "Admin",
        "000-000-0000",
        default_email,
        default_user,
        hashed_pw,
        default_code,
        "SuperAdmin",
        False,
    )

    return JSONResponse(
        status_code=201,
        content={"message": f"Default admin created. Username: {default_user}"},
    )


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
    user = await db.fetchrow(
        "SELECT id FROM admin_users WHERE email = $1 AND phone_number = $2",
        email.strip(),
        phone_number.strip(),
    )

    if not user:
        return templates.TemplateResponse(
            "forgot-password.html",
            {
                "request": request,
                "error": "No matching user found with that email and phone number.",
            },
        )

    temp_password = "".join(random.choices(string.ascii_letters + string.digits, k=6))
    hashed_temp = bcrypt.hash(temp_password)

    await db.execute(
        "UPDATE admin_users SET password_hash = $1, must_reset = TRUE WHERE id = $2",
        hashed_temp,
        user["id"],
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
