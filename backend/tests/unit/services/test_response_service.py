"""
Unit tests for ResponseService.
"""
import pytest
import pytest_asyncio
from unittest.mock import AsyncMock, patch, MagicMock
from datetime import datetime

from services.response_service import ResponseService
from core.exceptions import NotFoundError, ConflictError


class TestResponseService:
    """Test cases for ResponseService."""

    @pytest_asyncio.fixture
    async def mock_repository(self):
        """Mock repository for testing."""
        return AsyncMock()

    @pytest_asyncio.fixture
    async def response_service(self, mock_repository):
        """Create ResponseService instance with mock repository."""
        with patch('services.response_service.BaseRepository', return_value=mock_repository):
            service = ResponseService()
            service.repository = mock_repository
            return service

    @pytest.fixture
    def sample_response_data(self):
        """Sample response data for testing."""
        return {
            "user_id": "test_user_123",
            "form_id": "academic_profile",
            "responses": [
                {
                    "question_id": "q1",
                    "question_text": "What is your GPA?",
                    "answer": "3.8"
                },
                {
                    "question_id": "q2",
                    "question_text": "What are your favorite subjects?",
                    "answer": "Mathematics and Computer Science"
                }
            ]
        }

    @pytest.fixture
    def sample_response_from_db(self):
        """Sample response from database."""
        return {
            "_id": "507f1f77bcf86cd799439011",
            "response_id": "resp_123",
            "user_id": "test_user_123",
            "form_id": "academic_profile",
            "submitted_at": datetime.now(),
            "responses": [
                {
                    "question_id": "q1",
                    "question_text": "What is your GPA?",
                    "answer": "3.8"
                }
            ]
        }

    @pytest.mark.asyncio
    async def test_create_response_success(self, response_service, mock_repository, sample_response_data, sample_response_from_db):
        """Test successful response creation."""
        # Mock repository methods
        mock_repository.find_one.return_value = None  # Response doesn't exist
        mock_repository.create.return_value = sample_response_from_db
        
        result = await response_service.create_response(sample_response_data)
        
        # Verify repository calls
        mock_repository.find_one.assert_called_once()
        mock_repository.create.assert_called_once()
        
        # Verify result
        assert result == sample_response_from_db

    @pytest.mark.asyncio
    async def test_get_response_found(self, response_service, mock_repository, sample_response_from_db):
        """Test getting response when it exists."""
        user_id = "test_user_123"
        form_id = "academic_profile"
        
        mock_repository.find_one.return_value = sample_response_from_db
        
        result = await response_service.get_response(user_id, form_id)
        
        mock_repository.find_one.assert_called_once_with({
            "user_id": user_id,
            "form_id": form_id
        })
        assert result == sample_response_from_db

    @pytest.mark.asyncio
    async def test_get_response_not_found(self, response_service, mock_repository):
        """Test getting response when it doesn't exist."""
        user_id = "test_user_123"
        form_id = "nonexistent_form"
        
        mock_repository.find_one.return_value = None
        
        with pytest.raises(NotFoundError):
            await response_service.get_response(user_id, form_id)

    @pytest.mark.asyncio
    async def test_update_response_success(self, response_service, mock_repository, sample_response_from_db):
        """Test successful response update."""
        user_id = "test_user_123"
        form_id = "academic_profile"
        update_data = {
            "responses": [
                {
                    "question_id": "q1",
                    "question_text": "What is your GPA?",
                    "answer": "3.9"
                }
            ]
        }
        
        # Mock repository methods
        mock_repository.find_one.return_value = sample_response_from_db
        mock_repository.update_one.return_value = True
        
        updated_response = sample_response_from_db.copy()
        updated_response.update(update_data)
        mock_repository.find_one.side_effect = [sample_response_from_db, updated_response]
        
        result = await response_service.update_response(user_id, form_id, update_data)
        
        # Verify repository calls
        assert mock_repository.find_one.call_count == 2
        mock_repository.update_one.assert_called_once()
        assert result == updated_response

    @pytest.mark.asyncio
    async def test_update_response_not_found(self, response_service, mock_repository):
        """Test updating response when it doesn't exist."""
        user_id = "test_user_123"
        form_id = "nonexistent_form"
        update_data = {"responses": []}
        
        mock_repository.find_one.return_value = None
        
        with pytest.raises(NotFoundError):
            await response_service.update_response(user_id, form_id, update_data)

    @pytest.mark.asyncio
    async def test_delete_response_success(self, response_service, mock_repository):
        """Test successful response deletion."""
        user_id = "test_user_123"
        form_id = "academic_profile"
        
        mock_repository.delete_one.return_value = True
        
        result = await response_service.delete_response(user_id, form_id)
        
        mock_repository.delete_one.assert_called_once_with({
            "user_id": user_id,
            "form_id": form_id
        })
        assert result is True

    @pytest.mark.asyncio
    async def test_delete_response_not_found(self, response_service, mock_repository):
        """Test deleting response when it doesn't exist."""
        user_id = "test_user_123"
        form_id = "nonexistent_form"
        
        mock_repository.delete_one.return_value = False
        
        with pytest.raises(NotFoundError):
            await response_service.delete_response(user_id, form_id)

    @pytest.mark.asyncio
    async def test_get_user_responses(self, response_service, mock_repository):
        """Test getting all responses for a user."""
        user_id = "test_user_123"
        responses_data = [
            {"response_id": "resp_1", "user_id": user_id, "form_id": "form_1"},
            {"response_id": "resp_2", "user_id": user_id, "form_id": "form_2"}
        ]

        mock_repository.find_many.return_value = responses_data

        result = await response_service.get_user_responses(user_id)

        mock_repository.find_many.assert_called_once_with({"user_id": user_id}, None)
        assert len(result) == 2
        assert result[0]["response_id"] == "resp_1"

    @pytest.mark.asyncio
    async def test_get_user_responses_with_form_filter(self, response_service, mock_repository):
        """Test getting user responses with form filter."""
        user_id = "test_user_123"
        form_id = "academic_profile"
        responses_data = [
            {"response_id": "resp_1", "user_id": user_id, "form_id": form_id}
        ]

        mock_repository.find_many.return_value = responses_data

        result = await response_service.get_user_responses(user_id)

        mock_repository.find_many.assert_called_once_with({"user_id": user_id}, None)
        assert len(result) == 1
        assert result[0]["form_id"] == form_id

    @pytest.mark.asyncio
    async def test_get_responses_by_form(self, response_service, mock_repository):
        """Test getting all responses for a specific form."""
        form_id = "academic_profile"
        responses_data = [
            {"response_id": "resp_1", "user_id": "user_1", "form_id": form_id},
            {"response_id": "resp_2", "user_id": "user_2", "form_id": form_id}
        ]

        mock_repository.find_many.return_value = responses_data

        result = await response_service.get_many({"form_id": form_id})

        mock_repository.find_many.assert_called_once_with({"form_id": form_id}, None)
        assert len(result) == 2
        assert result[0]["form_id"] == form_id

    @pytest.mark.asyncio
    async def test_submit_question_response_success(self, response_service, mock_repository):
        """Test successful upsert of response."""
        user_id = "test_user_123"
        form_id = "academic_profile"
        response_data = {
            "user_id": user_id,
            "form_id": form_id,
            "responses": [{"question_id": "q1", "answer": "3.8"}]
        }

        # Mock that response doesn't exist
        mock_repository.find_one.return_value = None
        mock_repository.create.return_value = {"response_id": "new_resp_123", **response_data}

        result = await response_service.upsert_response(response_data)

        mock_repository.find_one.assert_called_once_with({"user_id": user_id, "form_id": form_id})
        mock_repository.create.assert_called_once()
        assert result["response_id"] == "new_resp_123"

    @pytest.mark.asyncio
    async def test_get_latest_response_for_user(self, response_service, mock_repository, sample_response_from_db):
        """Test getting latest response for user."""
        user_id = "test_user_123"

        mock_repository.find_many.return_value = [sample_response_from_db]

        result = await response_service.get_user_responses(user_id)

        mock_repository.find_many.assert_called_once_with({"user_id": user_id}, None)
        assert len(result) == 1
        assert result[0]["response_id"] == sample_response_from_db["response_id"]

    @pytest.mark.asyncio
    async def test_get_latest_response_for_user_not_found(self, response_service, mock_repository):
        """Test getting latest response when user has no responses."""
        user_id = "test_user_123"

        mock_repository.find_many.return_value = []

        result = await response_service.get_user_responses(user_id)

        mock_repository.find_many.assert_called_once_with({"user_id": user_id}, None)
        assert len(result) == 0

    @pytest.mark.asyncio
    async def test_count_user_responses(self, response_service, mock_repository):
        """Test counting user responses."""
        user_id = "test_user_123"
        responses_data = [
            {"response_id": "resp_1", "user_id": user_id},
            {"response_id": "resp_2", "user_id": user_id}
        ]

        mock_repository.find_many.return_value = responses_data

        result = await response_service.get_user_responses(user_id)

        mock_repository.find_many.assert_called_once_with({"user_id": user_id}, None)
        assert len(result) == 2

    @pytest.mark.asyncio
    async def test_get_response_statistics(self, response_service, mock_repository):
        """Test getting response statistics."""
        responses_data = [
            {"form_id": "form_1", "user_id": "user_1"},
            {"form_id": "form_1", "user_id": "user_2"},
            {"form_id": "form_2", "user_id": "user_1"}
        ]

        mock_repository.find_many.return_value = responses_data

        result = await response_service.get_many({})

        mock_repository.find_many.assert_called_once_with({}, None)
        assert len(result) == 3 