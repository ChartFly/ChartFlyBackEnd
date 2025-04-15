# ===================================================
# ✅ FILE: settings.py
# 🧠 Author: Captain & Chatman
# 🛠️ Purpose: Manage global system settings from the database
# ===================================================

import logging

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from sqlalchemy import text, create_engine
from sqlalchemy.orm import sessionmaker

from control_console.database import engine  # ✅ Confirm engine is properly defined

router = APIRouter()

# ✅ Setup Logging
logging.basicConfig(level=logging.INFO)

# ✅ SQLAlchemy Session
Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# ✅ Setting Schema
class Setting(BaseModel):
    setting_key: str
    setting_value: str


# ✅ GET All Settings
@router.get("/", tags=["settings"])
def get_all_settings():
    session = Session()
    try:
        result = session.execute(
            text(
                "SELECT id, setting_key, setting_value FROM global_settings ORDER BY setting_key"
            )
        )
        settings = [dict(row) for row in result.mappings()]
        if not settings:
            raise HTTPException(status_code=404, detail="No settings found")
        return settings
    except Exception as e:
        logging.error(f"❌ Error fetching settings: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
    finally:
        session.close()


# ✅ GET a Specific Setting
@router.get("/{setting_key}", tags=["settings"])
def get_setting(setting_key: str):
    session = Session()
    try:
        result = session.execute(
            text(
                "SELECT id, setting_key, setting_value FROM global_settings WHERE setting_key = :setting_key"
            ),
            {"setting_key": setting_key},
        )
        setting = result.mappings().first()
        if not setting:
            raise HTTPException(
                status_code=404, detail=f"Setting '{setting_key}' not found"
            )
        return setting
    except Exception as e:
        logging.error(f"❌ Error fetching setting '{setting_key}': {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
    finally:
        session.close()


# ✅ ADD or UPDATE a Setting
@router.post("/", tags=["settings"])
def add_or_update_setting(setting: Setting):
    session = Session()
    try:
        result = session.execute(
            text("SELECT id FROM global_settings WHERE setting_key = :setting_key"),
            {"setting_key": setting.setting_key},
        )
        existing = result.fetchone()

        if existing:
            session.execute(
                text(
                    "UPDATE global_settings SET setting_value = :setting_value WHERE setting_key = :setting_key"
                ),
                {
                    "setting_key": setting.setting_key,
                    "setting_value": setting.setting_value,
                },
            )
        else:
            session.execute(
                text(
                    "INSERT INTO global_settings (setting_key, setting_value) VALUES (:setting_key, :setting_value)"
                ),
                {
                    "setting_key": setting.setting_key,
                    "setting_value": setting.setting_value,
                },
            )

        session.commit()
        logging.info(f"➕ Setting '{setting.setting_key}' updated/added successfully")
        return {"message": f"Setting '{setting.setting_key}' updated successfully"}
    except Exception as e:
        logging.error(f"❌ Error adding/updating setting '{setting.setting_key}': {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
    finally:
        session.close()


# ✅ DELETE a Setting
@router.delete("/{setting_key}", tags=["settings"])
def delete_setting(setting_key: str):
    session = Session()
    try:
        result = session.execute(
            text("DELETE FROM global_settings WHERE setting_key = :setting_key"),
            {"setting_key": setting_key},
        )
        session.commit()
        if result.rowcount == 0:
            raise HTTPException(
                status_code=404, detail=f"Setting '{setting_key}' not found"
            )

        logging.info(f"🗑️ Setting '{setting_key}' deleted successfully")
        return {"message": f"Setting '{setting_key}' deleted successfully"}
    except Exception as e:
        logging.error(f"❌ Error deleting setting '{setting_key}': {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
    finally:
        session.close()
