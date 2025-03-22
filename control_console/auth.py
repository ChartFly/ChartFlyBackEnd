from fastapi import APIRouter, Request, Form, Depends
from fastapi.responses import RedirectResponse, HTMLResponse
from fastapi.templating import Jinja2Templates
from starlette.status import HTTP_302_FOUND
from passlib.hash import bcrypt
from starlette.responses import Response
from starlette.middleware.sessions import SessionMiddleware
from starlette.requests import Request
from db import get_db_connection

router = APIRouter()
templates = Jinja2Templates(directory="templates")

# ✅ Render Login Page
@router.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

# ✅ Handle Login Submission
@router.post("/login")
async def login(request: Request, username: str = Form(...), password: str = Form(...)):
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT id, password_hash FROM admin_users WHERE username = %s", (username,))
    result = cur.fetchone()
    cur.close()
    conn.close()

    if result and bcrypt.verify(password, result[1]):
        request.session["user_id"] = result[0]
        request.session["username"] = username
        return RedirectResponse(url="/", status_code=HTTP_302_FOUND)
    else:
        return templates.TemplateResponse("login.html", {"request": request, "error": "Invalid username or password"})

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
    username: str = Form(...),
    password: str = Form(...),
    access_code: str = Form(...)
):
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT id FROM admin_users WHERE username = %s", (username,))
    existing_user = cur.fetchone()

    if existing_user:
        cur.close()
        conn.close()
        return templates.TemplateResponse("register.html", {"request": request, "error": "Username already exists."})

    hashed_pw = bcrypt.hash(password)
    cur.execute("""
        INSERT INTO admin_users (first_name, last_name, phone_number, username, password_hash, access_code)
        VALUES (%s, %s, %s, %s, %s, %s)
    """, (first_name, last_name, phone_number, username, hashed_pw, access_code))
    conn.commit()
    cur.close()
    conn.close()

    return RedirectResponse(url="/login", status_code=HTTP_302_FOUND)

# ✅ Logout
@router.get("/logout")
async def logout(request: Request):
    request.session.clear()
    return RedirectResponse(url="/login", status_code=HTTP_302_FOUND)

from fastapi.responses import JSONResponse

# ✅ Developer Reset Endpoint (for emergencies or first-time setup)
@router.get("/dev-reset")
async def dev_reset(token: str):
    if token != "chartfly_mega_secret_token_8932":
        return JSONResponse(status_code=403, content={"error": "Unauthorized"})

    conn = get_db_connection()
    cur = conn.cursor()

    # Check if admin user already exists
    cur.execute("SELECT id FROM admin_users WHERE username = 'admin'")
    existing = cur.fetchone()

    if existing:
        cur.close()
        conn.close()
        return JSONResponse(status_code=200, content={"message": "Admin user already exists."})

    # Insert default admin user
    hashed_pw = bcrypt.hash("admin123")
    cur.execute("""
        INSERT INTO admin_users (first_name, last_name, phone_number, username, password_hash, access_code, role)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """, (
        "Default", "Admin", "000-000-0000", "admin", hashed_pw, "reset-code-123", "SuperAdmin"
    ))
    conn.commit()
    cur.close()
    conn.close()

    return JSONResponse(status_code=201, content={"message": "Default admin account created. Username: admin, Password: admin123"})