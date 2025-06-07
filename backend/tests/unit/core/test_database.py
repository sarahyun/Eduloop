"""
Unit tests for core.database module.
"""
import pytest
import pytest_asyncio
from unittest.mock import AsyncMock, MagicMock, patch, PropertyMock
from bson import ObjectId
from datetime import datetime

from core.database import DatabaseManager, BaseRepository, serialize_doc, serialize_docs
from core.exceptions import DatabaseError


class TestDatabaseManager:
    """Test cases for DatabaseManager class."""

    @pytest.fixture
    def db_manager(self):
        """Create DatabaseManager instance for testing."""
        return DatabaseManager()

    @pytest_asyncio.fixture
    async def mock_motor_client(self):
        """Mock Motor client for testing."""
        mock_client = AsyncMock()
        mock_database = AsyncMock()
        mock_client.__getitem__.return_value = mock_database
        # Mock the ping command
        mock_client.admin.command = AsyncMock()
        return mock_client, mock_database

    @pytest.mark.asyncio
    async def test_connect_success(self, db_manager, mock_motor_client):
        """Test successful database connection."""
        mock_client, mock_database = mock_motor_client
        
        with patch('core.database.AsyncIOMotorClient', return_value=mock_client):
            await db_manager.connect()
            
            assert db_manager.client is not None
            assert db_manager.database is not None

    @pytest.mark.asyncio
    async def test_disconnect(self, db_manager):
        """Test database disconnection."""
        mock_client = MagicMock()  # Use MagicMock instead of AsyncMock for close()
        db_manager.client = mock_client
        
        await db_manager.disconnect()
        
        # Check that close was called
        mock_client.close.assert_called_once()
        assert db_manager.client is None
        assert db_manager.database is None

    @pytest.mark.asyncio
    async def test_disconnect_no_client(self, db_manager):
        """Test disconnection when no client exists."""
        # Should not raise an exception
        await db_manager.disconnect()

    def test_get_collection_success(self, db_manager):
        """Test getting collection when database is connected."""
        mock_database = MagicMock()
        mock_collection = MagicMock()
        mock_database.__getitem__.return_value = mock_collection
        db_manager.database = mock_database

        result = db_manager.get_collection("test_collection")

        mock_database.__getitem__.assert_called_once_with("test_collection")
        assert result == mock_collection

    def test_get_collection_not_connected(self, db_manager):
        """Test getting collection when database is not connected."""
        db_manager.database = None

        with pytest.raises(DatabaseError) as exc_info:
            db_manager.get_collection("test_collection")

        assert "Database not connected" in str(exc_info.value)


class TestSerializationFunctions:
    """Test cases for document serialization functions."""

    def test_serialize_doc_with_objectid(self):
        """Test serializing document with ObjectId."""
        doc = {
            "_id": ObjectId("507f1f77bcf86cd799439011"),
            "name": "Test User",
            "created_at": datetime(2023, 1, 1, 12, 0, 0)
        }
        
        result = serialize_doc(doc)
        
        assert result["_id"] == "507f1f77bcf86cd799439011"
        assert result["name"] == "Test User"
        assert result["created_at"] == datetime(2023, 1, 1, 12, 0, 0)

    def test_serialize_doc_without_objectid(self):
        """Test serializing document without ObjectId."""
        doc = {
            "name": "Test User",
            "email": "test@example.com"
        }
        
        result = serialize_doc(doc)
        
        assert result == doc

    def test_serialize_doc_none(self):
        """Test serializing None document."""
        result = serialize_doc(None)
        assert result is None

    def test_serialize_docs_list(self):
        """Test serializing list of documents."""
        docs = [
            {
                "_id": ObjectId("507f1f77bcf86cd799439011"),
                "name": "User 1"
            },
            {
                "_id": ObjectId("507f1f77bcf86cd799439012"),
                "name": "User 2"
            }
        ]
        
        result = serialize_docs(docs)
        
        assert len(result) == 2
        assert result[0]["_id"] == "507f1f77bcf86cd799439011"
        assert result[1]["_id"] == "507f1f77bcf86cd799439012"

    def test_serialize_docs_empty_list(self):
        """Test serializing empty list."""
        result = serialize_docs([])
        assert result == []

    def test_serialize_docs_none(self):
        """Test serializing None list."""
        # serialize_docs should handle None gracefully
        result = serialize_docs(None)
        assert result is None


class TestBaseRepository:
    """Test cases for BaseRepository class."""

    @pytest.fixture
    def mock_collection(self):
        """Mock collection for testing."""
        return AsyncMock()

    @pytest.fixture
    def base_repo(self, mock_collection):
        """Create BaseRepository instance with mock collection."""
        repo = BaseRepository("test_collection")
        # Mock the collection property
        with patch.object(type(repo), 'collection', new_callable=PropertyMock) as mock_prop:
            mock_prop.return_value = mock_collection
            yield repo

    @pytest.mark.asyncio
    async def test_create_success(self, base_repo, mock_collection):
        """Test successful document creation."""
        test_data = {"name": "Test", "email": "test@example.com"}
        mock_result = MagicMock()
        mock_result.inserted_id = ObjectId("507f1f77bcf86cd799439011")
        mock_collection.insert_one.return_value = mock_result
        
        result = await base_repo.create(test_data)
        
        mock_collection.insert_one.assert_called_once_with(test_data)
        assert result["_id"] == "507f1f77bcf86cd799439011"
        assert result["name"] == "Test"

    @pytest.mark.asyncio
    async def test_create_failure(self, base_repo, mock_collection):
        """Test document creation failure."""
        test_data = {"name": "Test"}
        mock_collection.insert_one.side_effect = Exception("Insert failed")
        
        with pytest.raises(DatabaseError) as exc_info:
            await base_repo.create(test_data)
        
        assert "create in test_collection" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_find_by_id_found(self, base_repo, mock_collection):
        """Test finding document by ID when found."""
        doc_id = "507f1f77bcf86cd799439011"
        mock_doc = {
            "_id": ObjectId(doc_id),
            "name": "Test User"
        }
        mock_collection.find_one.return_value = mock_doc
        
        result = await base_repo.find_by_id(doc_id)
        
        mock_collection.find_one.assert_called_once_with({"_id": ObjectId(doc_id)})
        assert result["_id"] == doc_id
        assert result["name"] == "Test User"

    @pytest.mark.asyncio
    async def test_find_by_id_not_found(self, base_repo, mock_collection):
        """Test finding document by ID when not found."""
        doc_id = "507f1f77bcf86cd799439011"
        mock_collection.find_one.return_value = None
        
        result = await base_repo.find_by_id(doc_id)
        
        assert result is None

    @pytest.mark.asyncio
    async def test_find_by_id_invalid_id(self, base_repo, mock_collection):
        """Test finding document with invalid ObjectId."""
        invalid_id = "invalid_id"
        mock_collection.find_one.return_value = None

        result = await base_repo.find_by_id(invalid_id)

        # Should search by string ID when ObjectId is invalid
        mock_collection.find_one.assert_called_once_with({"_id": invalid_id})
        assert result is None

    @pytest.mark.asyncio
    async def test_find_one_success(self, base_repo, mock_collection):
        """Test finding one document by filter."""
        filter_dict = {"email": "test@example.com"}
        mock_doc = {"_id": ObjectId(), "email": "test@example.com"}
        mock_collection.find_one.return_value = mock_doc

        result = await base_repo.find_one(filter_dict)

        mock_collection.find_one.assert_called_once_with(filter_dict)
        assert result["email"] == "test@example.com"

    @pytest.mark.asyncio
    async def test_update_one_success(self, base_repo, mock_collection):
        """Test successful document update."""
        filter_dict = {"_id": ObjectId("507f1f77bcf86cd799439011")}
        update_data = {"name": "Updated Name"}

        mock_result = MagicMock()
        mock_result.matched_count = 1
        mock_collection.update_one.return_value = mock_result

        result = await base_repo.update_one(filter_dict, update_data)

        mock_collection.update_one.assert_called_once_with(filter_dict, {"$set": update_data})
        assert result is True

    @pytest.mark.asyncio
    async def test_update_one_not_found(self, base_repo, mock_collection):
        """Test updating non-existent document."""
        filter_dict = {"_id": ObjectId("507f1f77bcf86cd799439011")}
        update_data = {"name": "Updated Name"}

        mock_result = MagicMock()
        mock_result.matched_count = 0
        mock_collection.update_one.return_value = mock_result

        result = await base_repo.update_one(filter_dict, update_data)

        assert result is False

    @pytest.mark.asyncio
    async def test_delete_one_success(self, base_repo, mock_collection):
        """Test successful document deletion."""
        filter_dict = {"_id": ObjectId("507f1f77bcf86cd799439011")}

        mock_result = MagicMock()
        mock_result.deleted_count = 1
        mock_collection.delete_one.return_value = mock_result

        result = await base_repo.delete_one(filter_dict)

        mock_collection.delete_one.assert_called_once_with(filter_dict)
        assert result is True

    @pytest.mark.asyncio
    async def test_delete_one_not_found(self, base_repo, mock_collection):
        """Test deleting non-existent document."""
        filter_dict = {"_id": ObjectId("507f1f77bcf86cd799439011")}

        mock_result = MagicMock()
        mock_result.deleted_count = 0
        mock_collection.delete_one.return_value = mock_result

        result = await base_repo.delete_one(filter_dict)

        assert result is False

    @pytest.mark.asyncio
    async def test_delete_many_success(self, base_repo, mock_collection):
        """Test deleting multiple documents."""
        filter_dict = {"status": "inactive"}

        mock_result = MagicMock()
        mock_result.deleted_count = 3
        mock_collection.delete_many.return_value = mock_result

        result = await base_repo.delete_many(filter_dict)

        mock_collection.delete_many.assert_called_once_with(filter_dict)
        assert result == 3 