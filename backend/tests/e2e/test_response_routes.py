"""
End-to-end tests for response routes.
"""
import pytest
import pytest_asyncio
from unittest.mock import AsyncMock, patch
from httpx import AsyncClient
from datetime import datetime

from main import app


class TestResponseRoutes:
    """Test cases for response API routes."""

    @pytest_asyncio.fixture
    async def client(self):
        """Create test client."""
        async with AsyncClient(app=app, base_url="http://test") as client:
            yield client

    @pytest.fixture
    def mock_response_service(self):
        """Mock response service for testing."""
        return AsyncMock()

    @pytest.fixture
    def sample_response_data(self):
        """Sample response data."""
        return {
            "id": "507f1f77bcf86cd799439011",
            "response_id": "resp_123",
            "user_id": "user_123",
            "form_id": "academic_profile",
            "submitted_at": datetime.now().isoformat(),
            "responses": [
                {
                    "question_id": "q1",
                    "question_text": "What is your GPA?",
                    "answer": "3.8"
                }
            ]
        }

    @pytest.mark.asyncio
    async def test_create_response_success(self, client, mock_response_service, sample_response_data):
        """Test successful response creation via API."""
        response_data = {
            "user_id": "user_123",
            "form_id": "academic_profile",
            "responses": [
                {
                    "question_id": "q1",
                    "question_text": "What is your GPA?",
                    "answer": "3.8"
                }
            ]
        }
        
        mock_response_service.create_response.return_value = sample_response_data
        
        with patch('routes.responses.response_service', mock_response_service):
            response = await client.post("/responses/", json=response_data)
        
        assert response.status_code == 201
        response_json = response.json()
        assert response_json["user_id"] == "user_123"
        assert response_json["form_id"] == "academic_profile"
        assert len(response_json["responses"]) == 1

    @pytest.mark.asyncio
    async def test_create_response_invalid_data(self, client):
        """Test response creation with invalid data."""
        invalid_data = {
            "user_id": "user_123",
            # Missing required form_id
            "responses": []
        }
        
        response = await client.post("/responses/", json=invalid_data)
        
        assert response.status_code == 422  # Validation error

    @pytest.mark.asyncio
    async def test_get_response_success(self, client, mock_response_service, sample_response_data):
        """Test successful response retrieval."""
        response_id = "resp_123"
        mock_response_service.get_response.return_value = sample_response_data
        
        with patch('routes.responses.response_service', mock_response_service):
            response = await client.get(f"/responses/{response_id}")
        
        assert response.status_code == 200
        response_json = response.json()
        assert response_json["response_id"] == response_id

    @pytest.mark.asyncio
    async def test_get_response_not_found(self, client, mock_response_service):
        """Test response retrieval when response doesn't exist."""
        from core.exceptions import NotFoundError
        
        response_id = "nonexistent_response"
        mock_response_service.get_response.side_effect = NotFoundError("Response not found")
        
        with patch('routes.responses.response_service', mock_response_service):
            response = await client.get(f"/responses/{response_id}")
        
        assert response.status_code == 404
        assert "Response not found" in response.json()["detail"]

    @pytest.mark.asyncio
    async def test_update_response_success(self, client, mock_response_service, sample_response_data):
        """Test successful response update."""
        response_id = "resp_123"
        update_data = {
            "responses": [
                {
                    "question_id": "q1",
                    "question_text": "What is your GPA?",
                    "answer": "3.9"  # Updated answer
                }
            ]
        }
        
        updated_response = sample_response_data.copy()
        updated_response["responses"][0]["answer"] = "3.9"
        mock_response_service.update_response.return_value = updated_response
        
        with patch('routes.responses.response_service', mock_response_service):
            response = await client.put(f"/responses/{response_id}", json=update_data)
        
        assert response.status_code == 200
        response_json = response.json()
        assert response_json["responses"][0]["answer"] == "3.9"

    @pytest.mark.asyncio
    async def test_update_response_not_found(self, client, mock_response_service):
        """Test response update when response doesn't exist."""
        from core.exceptions import NotFoundError
        
        response_id = "nonexistent_response"
        update_data = {
            "responses": [
                {
                    "question_id": "q1",
                    "question_text": "What is your GPA?",
                    "answer": "3.9"
                }
            ]
        }
        
        mock_response_service.update_response.side_effect = NotFoundError("Response not found")
        
        with patch('routes.responses.response_service', mock_response_service):
            response = await client.put(f"/responses/{response_id}", json=update_data)
        
        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_delete_response_success(self, client, mock_response_service):
        """Test successful response deletion."""
        response_id = "resp_123"
        mock_response_service.delete_response.return_value = True
        
        with patch('routes.responses.response_service', mock_response_service):
            response = await client.delete(f"/responses/{response_id}")
        
        assert response.status_code == 204

    @pytest.mark.asyncio
    async def test_delete_response_not_found(self, client, mock_response_service):
        """Test response deletion when response doesn't exist."""
        from core.exceptions import NotFoundError
        
        response_id = "nonexistent_response"
        mock_response_service.delete_response.side_effect = NotFoundError("Response not found")
        
        with patch('routes.responses.response_service', mock_response_service):
            response = await client.delete(f"/responses/{response_id}")
        
        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_get_user_responses_success(self, client, mock_response_service):
        """Test successful retrieval of user responses."""
        user_id = "user_123"
        user_responses = [
            {
                "id": "507f1f77bcf86cd799439011",
                "response_id": "resp_1",
                "user_id": user_id,
                "form_id": "academic_profile",
                "submitted_at": datetime.now().isoformat()
            },
            {
                "id": "507f1f77bcf86cd799439012",
                "response_id": "resp_2",
                "user_id": user_id,
                "form_id": "extracurricular_profile",
                "submitted_at": datetime.now().isoformat()
            }
        ]
        
        mock_response_service.get_user_responses.return_value = user_responses
        
        with patch('routes.responses.response_service', mock_response_service):
            response = await client.get(f"/responses/user/{user_id}")
        
        assert response.status_code == 200
        response_json = response.json()
        assert len(response_json) == 2
        assert all(r["user_id"] == user_id for r in response_json)

    @pytest.mark.asyncio
    async def test_get_user_responses_with_form_filter(self, client, mock_response_service):
        """Test user responses retrieval with form filter."""
        user_id = "user_123"
        form_id = "academic_profile"
        filtered_responses = [
            {
                "id": "507f1f77bcf86cd799439011",
                "response_id": "resp_1",
                "user_id": user_id,
                "form_id": form_id,
                "submitted_at": datetime.now().isoformat()
            }
        ]
        
        mock_response_service.get_user_responses.return_value = filtered_responses
        
        with patch('routes.responses.response_service', mock_response_service):
            response = await client.get(f"/responses/user/{user_id}?form_id={form_id}")
        
        assert response.status_code == 200
        response_json = response.json()
        assert len(response_json) == 1
        assert response_json[0]["form_id"] == form_id

    @pytest.mark.asyncio
    async def test_get_user_responses_empty(self, client, mock_response_service):
        """Test user responses retrieval when user has no responses."""
        user_id = "user_with_no_responses"
        mock_response_service.get_user_responses.return_value = []
        
        with patch('routes.responses.response_service', mock_response_service):
            response = await client.get(f"/responses/user/{user_id}")
        
        assert response.status_code == 200
        response_json = response.json()
        assert response_json == []

    @pytest.mark.asyncio
    async def test_submit_question_response_success(self, client, mock_response_service):
        """Test successful question response submission."""
        question_response_data = {
            "userId": "user_123",
            "questionId": "q1",
            "sectionId": "academic",
            "response": "Computer Science"
        }
        
        mock_response_service.submit_question_response.return_value = {
            "id": "507f1f77bcf86cd799439011",
            "success": True,
            "message": "Response saved successfully"
        }
        
        with patch('routes.responses.response_service', mock_response_service):
            response = await client.post("/responses/question", json=question_response_data)
        
        assert response.status_code == 201
        response_json = response.json()
        assert response_json["success"] is True
        assert "saved successfully" in response_json["message"]

    @pytest.mark.asyncio
    async def test_submit_question_response_invalid_data(self, client):
        """Test question response submission with invalid data."""
        invalid_data = {
            "userId": "user_123",
            # Missing required questionId
            "sectionId": "academic",
            "response": "Computer Science"
        }
        
        response = await client.post("/responses/question", json=invalid_data)
        
        assert response.status_code == 422  # Validation error

    @pytest.mark.asyncio
    async def test_get_responses_by_form_success(self, client, mock_response_service):
        """Test successful retrieval of responses by form ID."""
        form_id = "academic_profile"
        form_responses = [
            {
                "id": "507f1f77bcf86cd799439011",
                "response_id": "resp_1",
                "user_id": "user_1",
                "form_id": form_id
            },
            {
                "id": "507f1f77bcf86cd799439012",
                "response_id": "resp_2",
                "user_id": "user_2",
                "form_id": form_id
            }
        ]
        
        mock_response_service.get_responses_by_form.return_value = form_responses
        
        with patch('routes.responses.response_service', mock_response_service):
            response = await client.get(f"/responses/form/{form_id}")
        
        assert response.status_code == 200
        response_json = response.json()
        assert len(response_json) == 2
        assert all(r["form_id"] == form_id for r in response_json)

    @pytest.mark.asyncio
    async def test_internal_server_error(self, client, mock_response_service):
        """Test handling of internal server errors."""
        response_id = "resp_123"
        mock_response_service.get_response.side_effect = Exception("Database connection failed")
        
        with patch('routes.responses.response_service', mock_response_service):
            response = await client.get(f"/responses/{response_id}")
        
        assert response.status_code == 500
        assert "Internal server error" in response.json()["detail"] 