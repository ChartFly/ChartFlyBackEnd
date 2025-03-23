from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
import logging
import traceback

router = APIRouter()

# ✅ Configure logging
logging.basicConfig(level=logging.INFO)

# ✅ API Key Model
class APIKey(BaseModel):
    name: str
    provider: str
    priority_order: int
    is_active: bool
    cost_per_month: float
    cost_per_year: float
    key_label: str
    api_secret: str

# ✅ GET All API Keys
@router.get("/", tags=["api_keys"])
async def get_all_api_keys(request: Request):
    try:
        db = request.state.db
        query = """
            SELECT id, name, provider, priority_order, is_active,
                   cost_per_month, cost_per_year, key_label
            FROM api_keys_table
            ORDER BY priority_order ASC;
        """
        rows = await db.fetch(query)
        logging.info("✅ Retrieved API keys")
        return [dict(row) for row in rows]
    except Exception as e:
        logging.error(f"❌ Failed to get API keys: {e}")
        logging.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail="Error retrieving API keys")

# ✅ ADD New API Key
@router.post("/", tags=["api_keys"])
async def add_api_key(api_key: APIKey, request: Request):
    try:
        db = request.state.db
        query = """
            INSERT INTO api_keys_table
            (name, provider, priority_order, is_active,
             cost_per_month, cost_per_year, key_label, api_secret)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        """
        await db.execute(query, api_key.name, api_key.provider, api_key.priority_order,
                         api_key.is_active, api_key.cost_per_month, api_key.cost_per_year,
                         api_key.key_label, api_key.api_secret)
        logging.info(f"✅ Added API key: {api_key.key_label}")
        return {"message": "API key added successfully"}
    except Exception as e:
        logging.error(f"❌ Failed to add API key: {e}")
        logging.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail="Error adding API key")

# ✅ DELETE API Key
@router.delete("/{api_key_id}", tags=["api_keys"])
async def delete_api_key(api_key_id: int, request: Request):
    try:
        db = request.state.db
        result = await db.execute("DELETE FROM api_keys_table WHERE id = $1", api_key_id)
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="API key not found")
        logging.info(f"✅ Deleted API key ID: {api_key_id}")
        return {"message": "API key deleted successfully"}
    except Exception as e:
        logging.error(f"❌ Failed to delete API key {api_key_id}: {e}")
        logging.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail="Error deleting API key")

# ✅ UPDATE API Key Status
@router.put("/{api_key_id}/status", tags=["api_keys"])
async def update_api_key_status(api_key_id: int, is_active: bool, request: Request):
    try:
        db = request.state.db
        result = await db.execute(
            "UPDATE api_keys_table SET is_active = $1 WHERE id = $2",
            is_active, api_key_id
        )
        if result == "UPDATE 0":
            raise HTTPException(status_code=404, detail="API key not found")
        logging.info(f"✅ Updated status of API key ID {api_key_id} to {is_active}")
        return {"message": "API key status updated successfully"}
    except Exception as e:
        logging.error(f"❌ Failed to update API key status: {e}")
        logging.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail="Error updating status")

# ✅ UPDATE API Key Priority
@router.put("/{api_key_id}/priority", tags=["api_keys"])
async def update_api_key_priority(api_key_id: int, priority_order: int, request: Request):
    try:
        db = request.state.db
        result = await db.execute(
            "UPDATE api_keys_table SET priority_order = $1 WHERE id = $2",
            priority_order, api_key_id
        )
        if result == "UPDATE 0":
            raise HTTPException(status_code=404, detail="API key not found")
        logging.info(f"✅ Updated priority of API key ID {api_key_id} to {priority_order}")
        return {"message": "API key priority updated successfully"}
    except Exception as e:
        logging.error(f"❌ Failed to update API key priority: {e}")
        logging.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail="Error updating priority")

# ✅ TRACK API Key Errors
@router.put("/{api_key_id}/error", tags=["api_keys"])
async def log_api_key_error(api_key_id: int, error_code: str, request: Request):
    try:
        db = request.state.db
        result = await db.execute(
            "UPDATE api_keys_table SET error_code = $1 WHERE id = $2",
            error_code, api_key_id
        )
        if result == "UPDATE 0":
            raise HTTPException(status_code=404, detail="API key not found")
        logging.info(f"⚠️ Logged error for API key ID {api_key_id}: {error_code}")
        return {"message": "API key error logged successfully"}
    except Exception as e:
        logging.error(f"❌ Failed to log API key error: {e}")
        logging.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail="Error logging API key error")