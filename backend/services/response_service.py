from typing import Dict, Any, List, Optional
import uuid

from core.database import BaseRepository
from core.exceptions import NotFoundError, ConflictError
from services.base_service import BaseService


class ResponseService(BaseService):
    """Response business logic service."""
    
    def __init__(self):
        repository = BaseRepository("responses")
        super().__init__(repository, "Response")
    
    async def create_response(self, response_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new form response."""
        # Check if response already exists for this user and form
        check_existing = {
            "user_id": response_data["user_id"],
            "form_id": response_data["form_id"]
        }
        
        # Generate unique response ID
        response_data["response_id"] = str(uuid.uuid4())
        
        return await self.create(response_data, check_existing)
    
    async def get_user_responses(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all responses for a user."""
        return await self.get_many({"user_id": user_id})
    
    async def get_response(self, user_id: str, form_id: str) -> Dict[str, Any]:
        """Get response by user ID and form ID."""
        response = await self.repository.find_one({
            "user_id": user_id,
            "form_id": form_id
        })
        if not response:
            raise NotFoundError("Response", f"user_id={user_id}, form_id={form_id}")
        return response
    
    async def update_response(self, user_id: str, form_id: str, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update response by user ID and form ID."""
        # Check if response exists
        await self.get_response(user_id, form_id)
        
        # Perform update
        success = await self.repository.update_one(
            {"user_id": user_id, "form_id": form_id},
            update_data
        )
        
        if not success:
            raise NotFoundError("Response", f"user_id={user_id}, form_id={form_id}")
        
        # Return updated response
        return await self.get_response(user_id, form_id)
    
    async def delete_response(self, user_id: str, form_id: str) -> bool:
        """Delete response by user ID and form ID."""
        success = await self.repository.delete_one({
            "user_id": user_id,
            "form_id": form_id
        })
        
        if not success:
            raise NotFoundError("Response", f"user_id={user_id}, form_id={form_id}")
        
        return True
    
    async def upsert_response(self, response_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create or update a response (for autosave functionality)."""
        user_id = response_data["user_id"]
        form_id = response_data["form_id"]
        
        # Check if response already exists
        try:
            existing_response = await self.get_response(user_id, form_id)
            # Update existing response
            return await self.update_response(user_id, form_id, response_data)
        except NotFoundError:
            # Create new response
            response_data["response_id"] = str(uuid.uuid4())
            return await self.repository.create(response_data)


# Global service instance
response_service = ResponseService() 