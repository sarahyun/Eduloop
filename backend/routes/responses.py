from fastapi import APIRouter, HTTPException

from models import ResponseCreate, ResponseUpdate
from services.response_service import response_service
from core.exceptions import NotFoundError

router = APIRouter(prefix="/responses", tags=["responses"])

@router.post("")
async def create_response(response: ResponseCreate):
    """Create a new form response"""
    response_data = response.dict()
    return await response_service.create_response(response_data)

@router.get("/user/{user_id}")
async def get_user_responses(user_id: str):
    """Get all responses for a user"""
    return await response_service.get_user_responses(user_id)

@router.get("/{user_id}/{form_id}")
async def get_response(user_id: str, form_id: str):
    """Get response by user ID and form ID"""
    try:
        return await response_service.get_response(user_id, form_id)
    except NotFoundError:
        # Return empty response structure if not found (for frontend compatibility)
        return {
            "user_id": user_id,
            "form_id": form_id,
            "response": {},
            "created_at": None,
            "updated_at": None
        }

@router.put("/{user_id}/{form_id}")
async def update_response(user_id: str, form_id: str, response_update: ResponseUpdate):
    """Update response by user ID and form ID"""
    update_data = response_update.dict()
    return await response_service.update_response(user_id, form_id, update_data)

@router.delete("/{user_id}/{form_id}")
async def delete_response(user_id: str, form_id: str):
    """Delete response by user ID and form ID"""
    await response_service.delete_response(user_id, form_id)
    return {"message": "Response deleted successfully"}

@router.post("/upsert")
async def upsert_response(response: ResponseCreate):
    """Create or update a response (for autosave functionality)"""
    response_data = response.dict()
    return await response_service.upsert_response(response_data) 