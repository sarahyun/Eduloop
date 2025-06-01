from fastapi import APIRouter, HTTPException
from datetime import datetime
import sys
import os
import uuid
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models import Response, ResponseCreate, ResponseUpdate
from database import db, serialize_doc

router = APIRouter(prefix="/responses", tags=["responses"])

@router.post("")
async def create_response(response: ResponseCreate):
    """Create a new form response"""
    try:
        # Check if response already exists for this user and form
        existing_response = await db.responses.find_one({
            "user_id": response.user_id,
            "form_id": response.form_id
        })
        if existing_response:
            raise HTTPException(status_code=400, detail="Response already exists for this user and form")
        
        response_data = response.dict()
        response_data["response_id"] = str(uuid.uuid4())
        response_data["submitted_at"] = datetime.now()
        
        result = await db.responses.insert_one(response_data)
        response_data["_id"] = str(result.inserted_id)
        
        return serialize_doc(response_data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create response: {str(e)}")

@router.get("/{user_id}/{form_id}")
async def get_response(user_id: str, form_id: str):
    """Get response by user ID and form ID"""
    try:
        response = await db.responses.find_one({
            "user_id": user_id,
            "form_id": form_id
        })
        if not response:
            raise HTTPException(status_code=404, detail="Response not found")
        
        return serialize_doc(response)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get response: {str(e)}")

@router.get("/user/{user_id}")
async def get_user_responses(user_id: str):
    """Get all responses for a user"""
    try:
        responses = await db.responses.find({"user_id": user_id}).to_list(length=None)
        return [serialize_doc(response) for response in responses]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user responses: {str(e)}")

@router.put("/{user_id}/{form_id}")
async def update_response(user_id: str, form_id: str, response_update: ResponseUpdate):
    """Update response by user ID and form ID"""
    try:
        update_data = response_update.dict()
        update_data["submitted_at"] = datetime.now()
        
        result = await db.responses.update_one(
            {"user_id": user_id, "form_id": form_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Response not found")
        
        updated_response = await db.responses.find_one({
            "user_id": user_id,
            "form_id": form_id
        })
        return serialize_doc(updated_response)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update response: {str(e)}")

@router.delete("/{user_id}/{form_id}")
async def delete_response(user_id: str, form_id: str):
    """Delete response by user ID and form ID"""
    try:
        result = await db.responses.delete_one({
            "user_id": user_id,
            "form_id": form_id
        })
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Response not found")
        
        return {"message": "Response deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete response: {str(e)}")

@router.get("/form/{form_id}")
async def get_form_responses(form_id: str):
    """Get all responses for a specific form"""
    try:
        responses = await db.responses.find({"form_id": form_id}).to_list(length=None)
        return [serialize_doc(response) for response in responses]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get form responses: {str(e)}")

@router.post("/upsert")
async def upsert_response(response: ResponseCreate):
    """Create or update a response (for autosave functionality)"""
    try:
        # Check if response already exists
        existing_response = await db.responses.find_one({
            "user_id": response.user_id,
            "form_id": response.form_id
        })
        
        response_data = response.dict()
        response_data["submitted_at"] = datetime.now()
        
        if existing_response:
            # Update existing response
            result = await db.responses.update_one(
                {"user_id": response.user_id, "form_id": response.form_id},
                {"$set": response_data}
            )
            updated_response = await db.responses.find_one({
                "user_id": response.user_id,
                "form_id": response.form_id
            })
            return serialize_doc(updated_response)
        else:
            # Create new response
            response_data["response_id"] = str(uuid.uuid4())
            result = await db.responses.insert_one(response_data)
            response_data["_id"] = str(result.inserted_id)
            return serialize_doc(response_data)
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upsert response: {str(e)}")