from fastapi import APIRouter, HTTPException
from services.profile_service import profile_service

router = APIRouter(prefix="/profile", tags=["profiles"])

@router.post("/{user_id}")
async def create_profile(user_id: str):
    try:
        return await profile_service.create_profile_generation(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create profile: {str(e)}")

@router.get("/{user_id}")
async def get_profile(user_id: str):
    try:
        profile = await profile_service.get_latest_profile(user_id)
        if not profile:
            raise HTTPException(status_code=404, detail="No completed profile found")
        return profile
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get profile: {str(e)}")

@router.get("/{user_id}/status")
async def get_profile_status(user_id: str):
    try:
        status = await profile_service.get_generation_status(user_id)
        if not status:
            raise HTTPException(status_code=404, detail="No profile generation found")
        return status
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get profile status: {str(e)}")