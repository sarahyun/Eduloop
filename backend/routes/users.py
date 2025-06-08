from fastapi import APIRouter, HTTPException
from datetime import datetime
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models import User, UserCreate, UserUpdate, UserResponse
from database import db, serialize_doc

router = APIRouter(prefix="/users", tags=["users"])

@router.post("", response_model=UserResponse)
async def create_user(user: UserCreate):
    """Create a new user (called after Firebase auth)"""
    try:
        # Check if user already exists
        existing_user = await db.users.find_one({"user_id": user.user_id})
        if existing_user:
            raise HTTPException(status_code=400, detail="User already exists")
        
        user_data = {
            "user_id": user.user_id,
            "email": user.email,
            "name": user.name,
            "role": user.role,
            "grade": user.grade,
            "counselor_id": user.counselor_id,
            "parent_id": user.parent_id,
            "created_at": datetime.now(),
            "last_login": None
        }
        
        result = await db.users.insert_one(user_data)
        user_data["_id"] = str(result.inserted_id)
        
        return serialize_doc(user_data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create user: {str(e)}")

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: str):
    """Get user by Firebase UID"""
    try:
        user = await db.users.find_one({"user_id": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return serialize_doc(user)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user: {str(e)}")

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(user_id: str, user_update: UserUpdate):
    """Update user by Firebase UID"""
    try:
        # Only include fields that are not None
        update_data = {k: v for k, v in user_update.dict().items() if v is not None}
        
        result = await db.users.update_one(
            {"user_id": user_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        updated_user = await db.users.find_one({"user_id": user_id})
        return serialize_doc(updated_user)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update user: {str(e)}")

@router.post("/{user_id}/login")
async def update_last_login(user_id: str):
    """Update user's last login timestamp"""
    try:
        result = await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"last_login": datetime.now()}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {"message": "Last login updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update last login: {str(e)}")

@router.delete("/{user_id}")
async def delete_user(user_id: str):
    """Delete user by Firebase UID"""
    try:
        # Also delete associated responses
        await db.responses.delete_many({"user_id": user_id})
        
        result = await db.users.delete_one({"user_id": user_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {"message": "User and associated data deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete user: {str(e)}")

@router.get("/role/{role}")
async def get_users_by_role(role: str):
    """Get all users by role (student/counselor/parent)"""
    try:
        users = await db.users.find({"role": role}).to_list(length=None)
        return [serialize_doc(user) for user in users]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get users by role: {str(e)}")