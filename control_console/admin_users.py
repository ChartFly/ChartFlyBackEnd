from fastapi import APIRouter

router = APIRouter()

@router.get("/admin_users")
async def get_admin_users():
    return {"message": "Admin users route is active!"}