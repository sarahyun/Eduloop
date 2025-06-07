"""
Unit tests for UserService.
"""
import pytest
import pytest_asyncio
from unittest.mock import AsyncMock, patch, MagicMock
from datetime import datetime

from services.user_service import UserService
from core.exceptions import NotFoundError, ConflictError


class TestUserService:
    """Test cases for UserService."""

    @pytest_asyncio.fixture
    async def mock_repository(self):
        """Mock repository for testing."""
        return AsyncMock()

    @pytest_asyncio.fixture
    async def user_service(self, mock_repository):
        """Create UserService instance with mock repository."""
        with patch('services.user_service.BaseRepository', return_value=mock_repository):
            service = UserService()
            service.repository = mock_repository
            return service

    @pytest.fixture
    def sample_user_data(self):
        """Sample user data for testing."""
        return {
            "user_id": "test_user_123",
            "email": "test@example.com",
            "name": "Test User",
            "role": "student",
            "grade": "12"
        }

    @pytest.fixture
    def sample_user_response(self):
        """Sample user response from database."""
        return {
            "_id": "507f1f77bcf86cd799439011",
            "user_id": "test_user_123",
            "email": "test@example.com",
            "name": "Test User",
            "role": "student",
            "grade": "12",
            "created_at": datetime.now(),
            "last_login": None,
            "students": [],
            "counselor_id": None,
            "parent_id": None
        }

    @pytest.mark.asyncio
    async def test_create_user_success(self, user_service, mock_repository, sample_user_data, sample_user_response):
        """Test successful user creation."""
        # Mock repository methods
        mock_repository.find_one.return_value = None  # User doesn't exist
        mock_repository.create.return_value = sample_user_response
        
        result = await user_service.create_user(sample_user_data)
        
        # Verify repository calls
        mock_repository.find_one.assert_called_once_with({"user_id": "test_user_123"})
        mock_repository.create.assert_called_once()
        
        # Verify result
        assert result == sample_user_response

    @pytest.mark.asyncio
    async def test_create_user_already_exists(self, user_service, mock_repository, sample_user_data, sample_user_response):
        """Test user creation when user already exists."""
        # Mock repository to return existing user
        mock_repository.find_one.return_value = sample_user_response
        
        with pytest.raises(ConflictError):
            await user_service.create_user(sample_user_data)
        
        # Verify repository calls
        mock_repository.find_one.assert_called_once_with({"user_id": "test_user_123"})
        mock_repository.create.assert_not_called()

    @pytest.mark.asyncio
    async def test_get_user_by_id_found(self, user_service, mock_repository, sample_user_response):
        """Test getting user by ID when user exists."""
        user_id = "test_user_123"
        mock_repository.find_one.return_value = sample_user_response
        
        result = await user_service.get_user_by_uid(user_id)
        
        mock_repository.find_one.assert_called_once_with({"user_id": user_id})
        assert result == sample_user_response

    @pytest.mark.asyncio
    async def test_get_user_by_id_not_found(self, user_service, mock_repository):
        """Test getting user by ID when user doesn't exist."""
        user_id = "nonexistent_user"
        mock_repository.find_one.return_value = None
        
        with pytest.raises(NotFoundError):
            await user_service.get_user_by_uid(user_id)
        
        mock_repository.find_one.assert_called_once_with({"user_id": user_id})

    @pytest.mark.asyncio
    async def test_update_user_success(self, user_service, mock_repository, sample_user_response):
        """Test successful user update."""
        user_id = "test_user_123"
        update_data = {"name": "Updated Name", "role": "counselor"}
        
        # Mock repository methods
        mock_repository.find_one.return_value = sample_user_response
        mock_repository.update_one.return_value = True
        
        updated_response = sample_user_response.copy()
        updated_response.update(update_data)
        mock_repository.find_one.side_effect = [sample_user_response, updated_response]
        
        result = await user_service.update_user(user_id, update_data)
        
        # Verify repository calls
        assert mock_repository.find_one.call_count == 2
        mock_repository.update_one.assert_called_once()
        assert result == updated_response

    @pytest.mark.asyncio
    async def test_update_user_not_found(self, user_service, mock_repository):
        """Test user update when user doesn't exist."""
        user_id = "nonexistent_user"
        update_data = {"name": "Updated Name"}
        
        mock_repository.find_one.return_value = None
        
        with pytest.raises(NotFoundError):
            await user_service.update_user(user_id, update_data)

    @pytest.mark.asyncio
    async def test_delete_user_success(self, user_service, mock_repository):
        """Test successful user deletion."""
        user_id = "test_user_123"
        
        # Mock repository methods
        mock_repository.delete_many.return_value = 1  # Deleted associated responses
        mock_repository.delete_one.return_value = True  # Deleted user
        
        result = await user_service.delete_user(user_id)
        
        # Verify repository calls
        mock_repository.delete_many.assert_called_once_with({"user_id": user_id})
        mock_repository.delete_one.assert_called_once_with({"user_id": user_id})
        assert result is True

    @pytest.mark.asyncio
    async def test_delete_user_not_found(self, user_service, mock_repository):
        """Test user deletion when user doesn't exist."""
        user_id = "nonexistent_user"
        
        # Mock repository methods
        mock_repository.delete_many.return_value = 0
        mock_repository.delete_one.return_value = False  # User not found
        
        with pytest.raises(NotFoundError):
            await user_service.delete_user(user_id)

    @pytest.mark.asyncio
    async def test_list_users(self, user_service, mock_repository):
        """Test listing users by role."""
        role = "student"
        users_data = [
            {"user_id": "user_1", "role": "student"},
            {"user_id": "user_2", "role": "student"}
        ]

        mock_repository.find_many.return_value = users_data

        result = await user_service.get_users_by_role(role)

        mock_repository.find_many.assert_called_once_with({"role": role}, None)
        assert len(result) == 2
        assert result[0]["role"] == "student"

    @pytest.mark.asyncio
    async def test_list_users_with_filter(self, user_service, mock_repository):
        """Test listing users with role filter."""
        role = "counselor"
        counselor_data = [{"user_id": "counselor_1", "role": "counselor"}]

        mock_repository.find_many.return_value = counselor_data

        result = await user_service.get_users_by_role(role)

        mock_repository.find_many.assert_called_once_with({"role": role}, None)
        assert len(result) == 1
        assert result[0]["role"] == "counselor"

    @pytest.mark.asyncio
    async def test_update_last_login(self, user_service, mock_repository):
        """Test updating user's last login timestamp."""
        user_id = "test_user_123"
        
        mock_repository.update_one.return_value = True
        
        result = await user_service.update_last_login(user_id)
        
        mock_repository.update_one.assert_called_once()
        call_args = mock_repository.update_one.call_args
        assert call_args[0][0] == {"user_id": user_id}
        assert "last_login" in call_args[0][1]
        assert result is True

    @pytest.mark.asyncio
    async def test_add_student_to_counselor(self, user_service, mock_repository):
        """Test adding student to counselor."""
        counselor_id = "counselor_123"
        student_id = "student_123"
        
        # Mock collection for the $addToSet operation
        mock_collection = AsyncMock()
        mock_repository.collection = mock_collection
        mock_repository.update_one.return_value = True
        
        result = await user_service.assign_student_to_counselor(counselor_id, student_id)
        
        # Verify collection update call
        mock_collection.update_one.assert_called_once()
        # Verify repository update call
        mock_repository.update_one.assert_called_once()
        assert result is True

    @pytest.mark.asyncio
    async def test_add_student_to_counselor_not_found(self, user_service, mock_repository):
        """Test adding student to counselor when student doesn't exist."""
        counselor_id = "counselor_123"
        student_id = "nonexistent_student"
        
        # Mock collection for the $addToSet operation
        mock_collection = AsyncMock()
        mock_repository.collection = mock_collection
        mock_repository.update_one.return_value = False  # Student not found
        
        with pytest.raises(NotFoundError):
            await user_service.assign_student_to_counselor(counselor_id, student_id) 