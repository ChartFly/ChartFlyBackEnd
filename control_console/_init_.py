# ✅ Initialize the control_console module
from .database import engine, AsyncSessionLocal
from .admin_users import router as admin_users_router
from .api_keys import router as api_keys_router
from .settings import router as settings_router
from .holidays import router as holidays_router

# ✅ Expose key components for easier imports
__all__ = [
    "engine",
    "AsyncSessionLocal",
    "admin_users_router",
    "api_keys_router",
    "settings_router",
    "holidays_router"
]