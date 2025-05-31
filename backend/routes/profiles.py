from fastapi import APIRouter, HTTPException
from datetime import datetime
from models import StudentProfileCreate, StudentProfileUpdate
from database import db, serialize_doc

router = APIRouter(prefix="/api/profiles", tags=["profiles"])

@router.post("")
async def create_profile(profile: StudentProfileCreate):
    try:
        profile_data = profile.dict()
        profile_data["createdAt"] = datetime.now()
        profile_data["updatedAt"] = None
        
        result = await db.studentProfiles.insert_one(profile_data)
        profile_data["_id"] = str(result.inserted_id)
        
        return serialize_doc(profile_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create profile: {str(e)}")

@router.get("/{user_id}")
async def get_profile(user_id: str):
    try:
        profile = await db.studentProfiles.find_one({"userId": user_id})
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        return serialize_doc(profile)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get profile: {str(e)}")

@router.put("/{user_id}")
async def update_profile(user_id: str, profile_update: StudentProfileUpdate):
    try:
        update_data = {k: v for k, v in profile_update.dict().items() if v is not None}
        update_data["updatedAt"] = datetime.now()
        
        result = await db.studentProfiles.update_one(
            {"userId": user_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        updated_profile = await db.studentProfiles.find_one({"userId": user_id})
        return serialize_doc(updated_profile)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update profile: {str(e)}")