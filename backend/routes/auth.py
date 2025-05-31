from fastapi import APIRouter, HTTPException
from datetime import datetime
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models import UserCreate, UserResponse, LoginRequest
from database import db, serialize_doc

router = APIRouter(prefix="/api/auth", tags=["authentication"])

@router.post("/signup", response_model=UserResponse)
async def signup(user: UserCreate):
    try:
        # Check if user already exists
        existing_user = await db.users.find_one({"email": user.email})
        if existing_user:
            raise HTTPException(status_code=400, detail="User with this email already exists")
        
        # Create new user
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
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create user: {str(e)}")

@router.post("/login", response_model=UserResponse)
async def login(login_data: LoginRequest):
    try:
        # Find user by email
        user = await db.users.find_one({"email": login_data.email})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Update last login
        await db.users.update_one(
            {"email": login_data.email},
            {"$set": {"lastLogin": datetime.now()}}
        )
        
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
        raise HTTPException(status_code=500, detail=f"Failed to login: {str(e)}")

@router.get("/user/{user_id}", response_model=UserResponse)
async def get_current_user(user_id: str):
    try:
        user = await db.users.find_one({"userId": user_id})
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