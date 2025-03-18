from sqlalchemy import text
from control_console.database import engine
from datetime import datetime

# ✅ API KEY MANAGEMENT
def get_active_api_key():
    """Retrieve the highest-priority active API key."""
    with engine.connect() as connection:
        result = connection.execute(
            text("SELECT api_secret FROM api_keys_table WHERE is_active = TRUE ORDER BY priority_order LIMIT 1")
        ).fetchone()
    return result[0] if result else None


def mark_api_key_failed(api_key):
    """Disable an API key that has failed and rotate to the next available key."""
    with engine.connect() as connection:
        connection.execute(
            text("UPDATE api_keys_table SET is_active = FALSE, last_used = NOW(), error_code = 'Failed' WHERE api_secret = :api_key"),
            {"api_key": api_key}
        )
        connection.commit()


# ✅ ROLE-BASED ACCESS CONTROL (RBAC)
def user_has_access(admin_id: int, tab_name: str) -> bool:
    """Check if an admin user has access to a specific tab."""
    with engine.connect() as connection:
        result = connection.execute(
            text("SELECT has_access FROM admin_permissions WHERE admin_id = :admin_id AND tab_name = :tab_name"),
            {"admin_id": admin_id, "tab_name": tab_name}
        ).fetchone()
    return result[0] if result else False


# ✅ MARKET STATUS CALCULATION
def get_market_status():
    """Determine the current stock market status based on time and holidays."""
    now = datetime.utcnow()
    current_date = now.date()
    current_hour = now.hour
    current_minute = now.minute

    # Fetch market holidays from the database
    with engine.connect() as connection:
        result = connection.execute(
            text("SELECT date FROM market_holidays WHERE date = :current_date"),
            {"current_date": current_date}
        ).fetchone()

    is_holiday = result is not None
    is_weekend = now.weekday() in [5, 6]  # Saturday = 5, Sunday = 6

    if is_holiday or is_weekend:
        return "Market Closed (Holiday or Weekend)"
    elif current_hour < 4:
        return "Market Closed"
    elif current_hour < 9 or (current_hour == 9 and current_minute < 30):
        return "Pre-Market Trading"
    elif current_hour < 16:
        return "Market Open"
    elif current_hour < 20:
        return "After-Market Trading"
    else:
        return "Market Closed"


# ✅ LOGGING HELPERS
def log_admin_action(admin_id: int, action: str, details: str = ""):
    """Log admin actions such as adding API keys, modifying users, or changing settings."""
    with engine.connect() as connection:
        connection.execute(
            text("INSERT INTO system_logs (admin_id, action, details, timestamp) VALUES (:admin_id, :action, :details, NOW())"),
            {"admin_id": admin_id, "action": action, "details": details}
        )
        connection.commit()