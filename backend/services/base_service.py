from typing import Dict, Any, List, Optional, Type
from datetime import datetime
from abc import ABC, abstractmethod

from core.database import BaseRepository
from core.exceptions import NotFoundError, ConflictError


class BaseService(ABC):
    """Base service class with common business logic patterns."""
    
    def __init__(self, repository: BaseRepository, resource_name: str):
        self.repository = repository
        self.resource_name = resource_name
    
    async def create(self, data: Dict[str, Any], check_existing: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Create a new resource with optional conflict checking."""
        if check_existing:
            existing = await self.repository.find_one(check_existing)
            if existing is not None:
                raise ConflictError(self.resource_name)
        
        # Add timestamps
        data["created_at"] = datetime.now()
        data["updated_at"] = datetime.now()
        
        return await self.repository.create(data)
    
    async def get_by_id(self, resource_id: str) -> Dict[str, Any]:
        """Get resource by ID with not found handling."""
        resource = await self.repository.find_by_id(resource_id)
        if resource is None:
            raise NotFoundError(self.resource_name, resource_id)
        return resource
    
    async def get_by_filter(self, filter_dict: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Get resource by filter."""
        return await self.repository.find_one(filter_dict)
    
    async def get_many(self, filter_dict: Dict[str, Any], limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """Get multiple resources by filter."""
        return await self.repository.find_many(filter_dict, limit)
    
    async def update(self, resource_id: str, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update resource by ID."""
        # Check if resource exists
        await self.get_by_id(resource_id)
        
        # Add updated timestamp
        update_data["updated_at"] = datetime.now()
        
        # Perform update
        success = await self.repository.update_one({"_id": resource_id}, update_data)
        if not success:
            raise NotFoundError(self.resource_name, resource_id)
        
        # Return updated resource
        return await self.get_by_id(resource_id)
    
    async def update_by_filter(self, filter_dict: Dict[str, Any], update_data: Dict[str, Any]) -> bool:
        """Update resource by filter."""
        update_data["updated_at"] = datetime.now()
        return await self.repository.update_one(filter_dict, update_data)
    
    async def delete(self, resource_id: str) -> bool:
        """Delete resource by ID."""
        success = await self.repository.delete_one({"_id": resource_id})
        if not success:
            raise NotFoundError(self.resource_name, resource_id)
        return True
    
    async def delete_by_filter(self, filter_dict: Dict[str, Any]) -> int:
        """Delete resources by filter."""
        return await self.repository.delete_many(filter_dict)
    
    async def exists(self, filter_dict: Dict[str, Any]) -> bool:
        """Check if resource exists."""
        resource = await self.repository.find_one(filter_dict)
        return resource is not None 