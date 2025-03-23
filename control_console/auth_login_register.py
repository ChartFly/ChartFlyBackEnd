from fastapi import APIRouter, Request, Form
from fastapi.responses import RedirectResponse, HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from starlette.status import HTTP_302_FOUND
from passlib.hash import bcrypt
import re
from db import get_db_connection
from control_console.rate_limiter import is_rate_limited, record_attempt  # ✅ NEW IMPORT

router = APIRouter()
templates = Jinja2Templates(directory="templates")

# ✅ Render Login Page
@router.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

# ✅ Handle Login Submission
@router.post("/login")
async def login(request: Request, username: str = Form(...), password: str = Form(...)):
    client_ip = request.client.host
    blocked, wait_time = is_rate_limited(client_ip)
    if blocked:
        return templates.TemplateResponse("login.html", {
            "request": request,
            "error": f"⛔ Too many login attempts. Try again in {wait_time // 60} min."
        })

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, password_hash, must_reset FROM admin_users WHERE username = %s", (username.strip(),))
    result = cur.fetchone()
    cur.close()
    conn.close()

    if result and bcrypt.verify(password, result[1]):
        request.session["user_id"] = result[0]
        request.session["username"] = username

        if result[2]:  # must_reset is True
            return RedirectResponse(url="/auth/force-reset-password", status_code=HTTP_302_FOUND)

        return RedirectResponse(url="/", status_code=HTTP_302_FOUND)

    record_attempt(client_ip)
    return templates.TemplateResponse("login.html", {"request": request, "error": "Invalid username or password"})

# ✅ Render Force Reset Page
@router.get("/force-reset-password", response_class=HTMLResponse)
async def force_reset_page(request: Request):
    if not request.session.get("user_id"):
        return RedirectResponse(url="/auth/login", status_code=HTTP_302_FOUND)
    return templates.TemplateResponse("force-reset.html", {"request": request})

# ✅ Handle Force Reset Submission
@router.post("/force-reset-password")
async def force_reset_submit(request: Request, new_password: str = Form(...), confirm_password: str = Form(...)):
    if not request.session.get("user_id"):
        return RedirectResponse(url="/auth/login", status_code=HTTP_302_FOUND)

    if new_password != confirm_password:
        return templates.TemplateResponse("force-reset.html", {
            "request": request,
            "error": "Passwords do not match."
        })

    if (
        len(new_password) < 6 or
        not re.search(r"[A-Za-z]", new_password) or
        not re.search(r"\d", new_password) or
        not re.search(r"[^A-Za-z0-9]", new_password)
    ):
        return templates.TemplateResponse("force-reset.html", {
            "request": request,
            "error": "Password must be at least 6 characters and include a letter, number, and symbol."
        })

    user_id = request.session["user_id"]
    hashed_pw = bcrypt.hash(new_password)

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        UPDATE admin_users
        SET password_hash = %s, must_reset = false
        WHERE id = %s
    """, (hashed_pw, user_id))
    conn.commit()
    cur.close()
    conn.close()

    request.session.clear()
    return RedirectResponse(url="/auth/login", status_code=HTTP_302_FOUND)

# ✅ Render Registration Page
@router.get("/register", response_class=HTMLResponse)
async def register_page(request: Request):
    return templates.TemplateResponse("register.html", {"request": request})

# ✅ Handle Registration Submission
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
    enable_2fa: str = Form(None)
):
    if password != confirm_password:
        return templates.TemplateResponse("register.html", {"request": request, "error": "Passwords do not match."})

    if (
        len(password) < 6 or
        not re.search(r"[A-Za-z]", password) or
        not re.search(r"\d", password) or
        not re.search(r"[^A-Za-z0-9]", password)
    ):
        return templates.TemplateResponse("register.html", {
            "request": request,
            "error": "Password must be at least 6 characters and include a letter, number, and symbol."
        })

    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return templates.TemplateResponse("register.html", {"request": request, "error": "Invalid email address."})

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT id FROM admin_users WHERE username = %s", (username.strip(),))
    existing_user = cur.fetchone()

    if existing_user:
        cur.close()
        conn.close()
        return templates.TemplateResponse("register.html", {"request": request, "error": "Username already exists."})

    hashed_pw = bcrypt.hash(password)

    cur.execute("""
        INSERT INTO admin_users 
        (first_name, last_name, phone_number, email, username, password_hash, access_code, is_2fa_enabled)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """, (
        first_name.strip(),
        last_name.strip(),
        phone_number.strip(),
        email.strip(),
        username.strip(),
        hashed_pw,
        access_code.strip(),
        enable_2fa == "on"
    ))
    conn.commit()
    cur.close()
    conn.close()

    return RedirectResponse(url="/auth/login", status_code=HTTP_302_FOUND)

# ✅ Logout
@router.get("/logout")
async def logout(request: Request):
    request.session.clear()
    return RedirectResponse(url="/auth/login", status_code=HTTP_302_FOUND)

# ✅ Developer Reset Endpoint
@router.get("/dev-reset")
async def dev_reset(token: str):
    if token != "chartfly_mega_secret_token_8932":
        return JSONResponse(status_code=403, content={"error": "Unauthorized"})

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT id FROM admin_users WHERE username = 'admin'")
    existing = cur.fetchone()

    if existing:
        cur.close()
        conn.close()
        return JSONResponse(status_code=200, content={"message": "Admin user already exists."})

    hashed_pw = bcrypt.hash("admin123")
    cur.execute("""
        INSERT INTO admin_users 
        (first_name, last_name, phone_number, email, username, password_hash, access_code, role, is_2fa_enabled)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, (
        "Default", "Admin", "000-000-0000", "admin@example.com", "admin",
        hashed_pw, "reset-code-123", "SuperAdmin", False
    ))
    conn.commit()
    cur.close()
    conn.close()

    return JSONResponse(status_code=201, content={"message": "Default admin account created. Username: admin, Password: admin123"})