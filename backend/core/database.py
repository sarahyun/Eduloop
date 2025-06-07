from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from typing import Optional, Dict, Any, List
from bson import ObjectId
import logging

from core.config import settings
from core.exceptions import DatabaseError

logger = logging.getLogger(__name__)


class DatabaseManager:
    """Centralized database management."""
    
    def __init__(self):
        self.client: Optional[AsyncIOMotorClient] = None
        self.database: Optional[AsyncIOMotorDatabase] = None
    
    async def connect(self):
        """Connect to MongoDB."""
        try:
            self.client = AsyncIOMotorClient(settings.mongodb_uri)
            self.database = self.client[settings.database_name]
            logger.info("Connected to MongoDB")
            
            # Update legacy db reference for backward compatibility
            global db
            db = self.database
            
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise DatabaseError("connection", e)
    
    async def disconnect(self):
        """Disconnect from MongoDB."""
        if self.client:
            self.client.close()
            self.client = None
            self.database = None
            logger.info("Disconnected from MongoDB")
    
    def get_collection(self, collection_name: str):
        """Get a collection from the database."""
        if self.database is None:
            raise DatabaseError("get_collection", Exception("Database not connected"))
        return self.database[collection_name]


# Global database manager instance
db_manager = DatabaseManager()


def serialize_doc(doc: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """Serialize MongoDB document by converting ObjectId to string."""
    if not doc:
        return doc
    
    if "_id" in doc:
        doc["_id"] = str(doc["_id"])
    
    return doc


def serialize_docs(docs: Optional[List[Dict[str, Any]]]) -> Optional[List[Dict[str, Any]]]:
    """Serialize a list of MongoDB documents."""
    if docs is None:
        return None
    return [serialize_doc(doc) for doc in docs]


class BaseRepository:
    """Base repository class with common CRUD operations."""
    
    def __init__(self, collection_name: str):
        self.collection_name = collection_name
    
    @property
    def collection(self):
        """Get the MongoDB collection."""
        return db_manager.get_collection(self.collection_name)
    
    async def create(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new document."""
        try:
            result = await self.collection.insert_one(data)
            data["_id"] = str(result.inserted_id)
            return serialize_doc(data)
        except Exception as e:
            raise DatabaseError(f"create in {self.collection_name}", e)
    
    async def find_by_id(self, doc_id: str) -> Optional[Dict[str, Any]]:
        """Find document by ID."""
        try:
            if ObjectId.is_valid(doc_id):
                doc = await self.collection.find_one({"_id": ObjectId(doc_id)})
            else:
                doc = await self.collection.find_one({"_id": doc_id})
            return serialize_doc(doc)
        except Exception as e:
            raise DatabaseError(f"find_by_id in {self.collection_name}", e)
    
    async def find_one(self, filter_dict: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Find one document by filter."""
        try:
            doc = await self.collection.find_one(filter_dict)
            return serialize_doc(doc)
        except Exception as e:
            raise DatabaseError(f"find_one in {self.collection_name}", e)
    
    async def find_many(self, filter_dict: Dict[str, Any], limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """Find multiple documents by filter."""
        try:
            cursor = self.collection.find(filter_dict)
            if limit:
                cursor = cursor.limit(limit)
            docs = await cursor.to_list(length=None)
            return serialize_docs(docs)
        except Exception as e:
            raise DatabaseError(f"find_many in {self.collection_name}", e)
    
    async def update_one(self, filter_dict: Dict[str, Any], update_data: Dict[str, Any]) -> bool:
        try:
            result = await self.collection.update_one(filter_dict, {"$set": update_data})
            print(f"🛠️ [update_one] matched={result.matched_count}, modified={result.modified_count}")
            return result.matched_count > 0
        except Exception as e:
            raise DatabaseError(f"update_one in {self.collection_name}", e)

    async def delete_one(self, filter_dict: Dict[str, Any]) -> bool:
        """Delete one document."""
        try:
            result = await self.collection.delete_one(filter_dict)
            return result.deleted_count > 0
        except Exception as e:
            raise DatabaseError(f"delete_one in {self.collection_name}", e)
    
    async def delete_many(self, filter_dict: Dict[str, Any]) -> int:
        """Delete multiple documents."""
        try:
            result = await self.collection.delete_many(filter_dict)
            return result.deleted_count
        except Exception as e:
            raise DatabaseError(f"delete_many in {self.collection_name}", e)


# Legacy compatibility - will be removed after refactoring
async def get_database():
    """Legacy function for backward compatibility."""
    return db_manager.database


# Legacy compatibility - will be set after connection
db = None 