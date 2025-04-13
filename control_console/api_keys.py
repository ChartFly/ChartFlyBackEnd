# ==========================================================
# ✅ FILE: control_console/api_keys.py
# 📌 PURPOSE: CRUD endpoints for managing API key records
# 🛠️ STATUS: Refactored (MPA Phase I) — Author: Captain & Chatman
# ==========================================================

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
import logging

router = APIRouter()
logging.basicConfig(level=logging.INFO)

# ✅ Helper: Extract last 4 characters of API secret
def extract_identifier(secret: str) -> str:
    return secret[-4:] if secret and len(secret) >= 4 else "xxxx"

# ✅ API Key Schema (no identifier exposed to frontend)
class APIKey(BaseModel):
    key_label: str
    api_secret: str
    key_type: str
    billing_interval: str
    cost_per_month: float
    cost_per_year: float
    usage_limit_sec: int
    usage_limit_min: int
    usage_limit_5min: int
    usage_limit_10min: int
    usage_limit_15min: int
    usage_limit_hour: int
    usage_limit_day: int
    priority_order: int

# ✅ GET all API keys
@router.get("/", tags=["api_keys"])
async def get_all_api_keys(request: Request):
    db = request.state.db
    try:
        rows = await db.fetch("""
            SELECT id, key_label, provider, is_active, key_type, billing_interval,
                   cost_per_month, cost_per_year, api_key_identifier,
                   usage_limit_sec, usage_limit_min, usage_limit_5min,
                   usage_limit_10min, usage_limit_15min, usage_limit_hour,
                   usage_limit_day, priority_order
            FROM api_keys_table
        """)
        return [dict(row) for row in rows]
    except Exception as e:
        logging.error(f"❌ Failed to fetch API keys: {e}")
        raise HTTPException(status_code=500, detail="Error retrieving API keys")

# ✅ ADD API Key
@router.post("/", tags=["api_keys"])
async def add_api_key(api_key: APIKey, request: Request):
    db = request.state.db
    try:
        identifier = extract_identifier(api_key.api_secret)
        await db.execute("""
            INSERT INTO api_keys_table (
                key_label, api_secret, key_type, billing_interval,
                cost_per_month, cost_per_year,
                usage_limit_sec, usage_limit_min, usage_limit_5min,
                usage_limit_10min, usage_limit_15min, usage_limit_hour,
                usage_limit_day, priority_order, api_key_identifier
            ) VALUES (
                $1, $2, $3, $4,
                $5, $6, $7, $8,
                $9, $10, $11, $12,
                $13, $14, $15
            )
        """, api_key.key_label, api_key.api_secret, api_key.key_type, api_key.billing_interval,
             api_key.cost_per_month, api_key.cost_per_year,
             api_key.usage_limit_sec, api_key.usage_limit_min, api_key.usage_limit_5min,
             api_key.usage_limit_10min, api_key.usage_limit_15min, api_key.usage_limit_hour,
             api_key.usage_limit_day, api_key.priority_order, identifier)

        logging.info(f"✅ Added API key label: {api_key.key_label}")
        return {"message": "API key added successfully"}
    except Exception as e:
        logging.error(f"❌ Failed to add API key {api_key.key_label}: {e}")
        raise HTTPException(status_code=500, detail="Error adding API key")

# ✅ DELETE API Key
@router.delete("/{key_id}", tags=["api_keys"])
async def delete_api_key(key_id: int, request: Request):
    db = request.state.db
    try:
        result = await db.execute("DELETE FROM api_keys_table WHERE id = $1", key_id)
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="API key not found")
        logging.info(f"🗑️ Deleted API key ID {key_id}")
        return {"message": "API key deleted successfully"}
    except Exception as e:
        logging.error(f"❌ Error deleting API key ID {key_id}: {e}")
        raise HTTPException(status_code=500, detail="Error deleting API key")

# ✅ UPDATE API Key
@router.put("/{key_id}", tags=["api_keys"])
async def update_api_key(key_id: int, api_key: APIKey, request: Request):
    db = request.state.db
    try:
        identifier = extract_identifier(api_key.api_secret)
        result = await db.execute("""
            UPDATE api_keys_table SET
                key_label = $1,
                api_secret = $2,
                key_type = $3,
                billing_interval = $4,
                cost_per_month = $5,
                cost_per_year = $6,
                usage_limit_sec = $7,
                usage_limit_min = $8,
                usage_limit_5min = $9,
                usage_limit_10min = $10,
                usage_limit_15min = $11,
                usage_limit_hour = $12,
                usage_limit_day = $13,
                priority_order = $14,
                api_key_identifier = $15
            WHERE id = $16
        """, api_key.key_label, api_key.api_secret, api_key.key_type, api_key.billing_interval,
             api_key.cost_per_month, api_key.cost_per_year,
             api_key.usage_limit_sec, api_key.usage_limit_min, api_key.usage_limit_5min,
             api_key.usage_limit_10min, api_key.usage_limit_15min, api_key.usage_limit_hour,
             api_key.usage_limit_day, api_key.priority_order, identifier, key_id)

        if result == "UPDATE 0":
            raise HTTPException(status_code=404, detail="API key not found")
        logging.info(f"✅ Updated API key ID {key_id}")
        return {"message": "API key updated successfully"}
    except Exception as e:
        logging.error(f"❌ Failed to update API key ID {key_id}: {e}")
        raise HTTPException(status_code=500, detail="Error updating API key")
