from fastapi import APIRouter, HTTPException
from datetime import datetime
from models import UserCreate, UserResponse, LoginRequest
from core.database import db_manager

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/signup", response_model=UserResponse)
async def signup(user: UserCreate):
    try:
        # Ensure database is connected
        if db_manager.database is None:
            await db_manager.connect()
        
        users_collection = db_manager.get_collection("users")
        
        # Check if user already exists
        existing_user = await users_collection.find_one({"email": user.email})
        if existing_user:
            raise HTTPException(status_code=400, detail="User with this email already exists")
        
        # Create new user
        user_data = {
            "userId": user.user_id,
            "email": user.email,
            "name": user.name,
            "role": user.role,
            "grade": user.grade,
            "counselorId": None,
            "parentId": None,
            "createdAt": datetime.now(),
            "lastLogin": None
        }
        
        result = await users_collection.insert_one(user_data)
        
        return UserResponse(
            user_id=user.user_id,
            email=user.email,
            name=user.name,
            role=user.role,
            grade=user.grade,
            created_at=user_data["createdAt"],
            last_login=user_data["lastLogin"]
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create user: {str(e)}")

@router.post("/login", response_model=UserResponse)
async def login(login_data: LoginRequest):
    try:
        # Ensure database is connected
        if db_manager.database is None:
            await db_manager.connect()
        
        users_collection = db_manager.get_collection("users")
        
        # Find user by email
        user = await users_collection.find_one({"email": login_data.email})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Update last login
        await users_collection.update_one(
            {"email": login_data.email},
            {"$set": {"lastLogin": datetime.now()}}
        )
        
        return UserResponse(
            user_id=user["userId"],
            email=user["email"],
            name=user["name"],
            role=user["role"],
            grade=user.get("grade"),
            created_at=user.get("createdAt", datetime.now()),
            last_login=user.get("lastLogin")
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to login: {str(e)}")

@router.get("/user/{user_id}", response_model=UserResponse)
async def get_current_user(user_id: str):
    try:
        # Ensure database is connected
        if db_manager.database is None:
            await db_manager.connect()
        
        users_collection = db_manager.get_collection("users")
        
        user = await users_collection.find_one({"userId": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return UserResponse(
            user_id=user["userId"],
            email=user["email"],
            name=user["name"],
            role=user["role"],
            grade=user.get("grade"),
            created_at=user.get("createdAt", datetime.now()),
            last_login=user.get("lastLogin")
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user: {str(e)}")