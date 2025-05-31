from fastapi import APIRouter, HTTPException
from datetime import datetime
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models import UserCreate, UserResponse
from database import db, serialize_doc

router = APIRouter(prefix="/api/users", tags=["users"])

@router.post("/", response_model=UserResponse)
async def create_user(user: UserCreate):
    try:
        user_data = {
            "userId": user.userId,
            "email": user.email,
            "name": user.name,
            "role": user.role,
            "grade": user.grade,
            "students": [],
            "counselorId": None,
            "parentId": None,
            "createdAt": datetime.now(),
            "lastLogin": None
        }
        
        result = await db.users.insert_one(user_data)
        
        return UserResponse(
            user_id=user.userId,
            email=user.email,
            name=user.name,
            role=user.role,
            grade=user.grade
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create user: {str(e)}")

@router.get("/{uid}", response_model=UserResponse)
async def get_user(uid: str):
    try:
        user = await db.users.find_one({"userId": uid})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return UserResponse(
            user_id=user["userId"],
            email=user["email"],
            name=user["name"],
            role=user["role"],
            grade=user.get("grade")
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user: {str(e)}")