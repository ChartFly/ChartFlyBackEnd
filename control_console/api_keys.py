from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
import logging

router = APIRouter()
logging.basicConfig(level=logging.INFO)

# ✅ API Key Schema
class APIKey(BaseModel):
    key_label: str
    api_secret: str  # 🔒 Sensitive: Never expose or log
    key_type: str  # Free, Paid, etc.
    billing_interval: str  # Monthly, Annual, etc.
    cost_per_month: float
    cost_per_year: float
    usage_limit_sec: int
    usage_limit_min: int
    usage_limit_day: int
    priority: int

# ✅ GET all API keys (safe version)
@router.get("/", tags=["api_keys"])
async def get_all_api_keys(request: Request):
    db = request.state.db
    try:
        rows = await db.fetch("SELECT id, key_label, key_type, billing_interval, cost_per_month, cost_per_year, usage_limit_sec, usage_limit_min, usage_limit_day, priority FROM api_keys_table")
        return [dict(row) for row in rows]
    except Exception as e:
        logging.error(f"❌ Failed to fetch API keys: {e}")
        raise HTTPException(status_code=500, detail="Error retrieving API keys")

# ✅ ADD API Key (safe)
@router.post("/", tags=["api_keys"])
async def add_api_key(api_key: APIKey, request: Request):
    db = request.state.db
    try:
        await db.execute("""
            INSERT INTO api_keys_table (
                key_label, api_secret, key_type, billing_interval,
                cost_per_month, cost_per_year,
                usage_limit_sec, usage_limit_min, usage_limit_day, priority
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        """, api_key.key_label, api_key.api_secret, api_key.key_type, api_key.billing_interval,
             api_key.cost_per_month, api_key.cost_per_year,
             api_key.usage_limit_sec, api_key.usage_limit_min, api_key.usage_limit_day, api_key.priority)

        logging.info(f"✅ Added API key label: {api_key.key_label} (secret not logged)")
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
                usage_limit_day = $9,
                priority = $10
            WHERE id = $11
        """, api_key.key_label, api_key.api_secret, api_key.key_type, api_key.billing_interval,
             api_key.cost_per_month, api_key.cost_per_year,
             api_key.usage_limit_sec, api_key.usage_limit_min, api_key.usage_limit_day,
             api_key.priority, key_id)

        if result == "UPDATE 0":
            raise HTTPException(status_code=404, detail="API key not found")
        logging.info(f"✅ Updated API key ID {key_id}")
        return {"message": "API key updated successfully"}
    except Exception as e:
        logging.error(f"❌ Failed to update API key ID {key_id}: {e}")
        raise HTTPException(status_code=500, detail="Error updating API key")