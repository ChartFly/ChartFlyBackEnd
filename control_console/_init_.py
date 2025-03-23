# control_console/__init__.py

# ✅ Initialize routers for import
from .admin_user_controller import router as admin_users_router
from .api_keys import router as api_keys_router
from .settings import router as settings_router
from .holidays import router as holidays_router

# ✅ Expose for easy imports
__all__ = [
    "admin_users_router",
    "api_keys_router",
    "settings_router",
    "holidays_router"
]