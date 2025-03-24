from datetime import datetime
from fastapi import Request
import logging

# ✅ GET Active API Key
async def get_active_api_key(db):
    query = """
        SELECT api_secret
        FROM api_keys_table
        WHERE is_active = TRUE
        ORDER BY priority_order ASC
        LIMIT 1
    """
    row = await db.fetchrow(query)
    return row["api_secret"] if row else None


# ✅ Mark API Key as Failed
async def mark_api_key_failed(db, api_key: str):
    query = """
        UPDATE api_keys_table
        SET is_active = FALSE, last_used = NOW(), error_code = 'Failed'
        WHERE api_secret = $1
    """
    await db.execute(query, api_key)


# ✅ Check Role-Based Access
async def user_has_access(db, admin_id: int, tab_name: str) -> bool:
    query = """
        SELECT has_access
        FROM admin_permissions
        WHERE admin_id = $1 AND tab_name = $2
    """
    row = await db.fetchrow(query, admin_id, tab_name)
    return row["has_access"] if row else False


# ✅ Market Status Helper
async def get_market_status(db):
    now = datetime.utcnow()
    current_date = now.date()
    current_hour = now.hour
    current_minute = now.minute

    # Check for holiday
    query = "SELECT date FROM market_holidays WHERE date = $1"
    holiday = await db.fetchrow(query, current_date)

    is_holiday = holiday is not None
    is_weekend = now.weekday() in [5, 6]  # Sat/Sun

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


# ✅ Log Admin Actions
async def log_admin_action(db, admin_id: int, action: str, details: str = ""):
    query = """
        INSERT INTO system_logs (admin_id, action, details, timestamp)
        VALUES ($1, $2, $3, NOW())
    """
    await db.execute(query, admin_id, action, details)