from typing import Dict, Any, List, Optional
from datetime import datetime

from core.database import BaseRepository
from core.exceptions import NotFoundError, ConflictError
from services.base_service import BaseService


class UserService(BaseService):
    """User business logic service."""
    
    def __init__(self):
        repository = BaseRepository("users")
        super().__init__(repository, "User")
    
    async def create_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new user with validation."""
        # Check if user already exists
        check_existing = {"user_id": user_data["user_id"]}
        
        # Initialize default fields
        user_data["last_login"] = None
        
        return await self.create(user_data, check_existing)
    
    async def get_user_by_uid(self, user_id: str) -> Dict[str, Any]:
        """Get user by Firebase UID."""
        user = await self.repository.find_one({"user_id": user_id})
        if user is None:
            raise NotFoundError("User", user_id)
        return user
    
    async def update_user(self, user_id: str, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update user by Firebase UID."""
        # Filter out None values
        filtered_data = {k: v for k, v in update_data.items() if v is not None}
        
        # Check if user exists
        user = await self.get_user_by_uid(user_id)
        
        # Perform update
        success = await self.repository.update_one(
            {"user_id": user_id}, 
            filtered_data
        )
        
        if not success:
            raise NotFoundError("User", user_id)
        
        # Return updated user
        return await self.get_user_by_uid(user_id)
    
    async def update_last_login(self, user_id: str) -> bool:
        """Update user's last login timestamp."""
        return await self.update_by_filter(
            {"user_id": user_id},
            {"last_login": datetime.now()}
        )
    
    async def delete_user(self, user_id: str) -> bool:
        """Delete user and associated data."""
        # Delete associated responses first
        await self.repository.delete_many({"user_id": user_id})
        
        # Delete user
        success = await self.repository.delete_one({"user_id": user_id})
        if not success:
            raise NotFoundError("User", user_id)
        
        return True
    
    async def get_users_by_role(self, role: str) -> List[Dict[str, Any]]:
        """Get all users by role."""
        return await self.get_many({"role": role})


# Global service instance
user_service = UserService() 