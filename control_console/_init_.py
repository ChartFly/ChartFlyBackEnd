# ==========================================================
# ✅ FILE: control_console/__init__.py
# 📌 PURPOSE: Re-export routers for external use
# 🛠️ STATUS: Refactored (MPA Phase I) — Author: Captain & Chatman
# ==========================================================

# ✅ Initialize routers for import
from .admin_user_controller import router as admin_users_router
from .api_keys import router as api_keys_router
from .holidays import router as holidays_router
from .settings import router as settings_router

# ✅ Expose for easy imports
__all__ = [
    "admin_users_router",
    "api_keys_router",
    "settings_router",
    "holidays_router",
]
