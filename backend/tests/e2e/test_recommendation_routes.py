"""
End-to-end tests for recommendation routes.
"""
import pytest
import pytest_asyncio
from unittest.mock import AsyncMock, patch
from httpx import AsyncClient
from datetime import datetime

from main import app


class TestRecommendationRoutes:
    """Test cases for recommendation API routes."""

    @pytest_asyncio.fixture
    async def client(self):
        """Create test client."""
        async with AsyncClient(app=app, base_url="http://test") as client:
            yield client

    @pytest.fixture
    def mock_recommendation_service(self):
        """Mock recommendation service for testing."""
        return AsyncMock()

    @pytest.fixture
    def sample_recommendation_data(self):
        """Sample recommendation data."""
        return {
            "id": "507f1f77bcf86cd799439011",
            "user_id": "user_123",
            "status": "completed",
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "recommendations": [
                {
                    "type": "Match",
                    "name": "Stanford University",
                    "location": "Stanford, CA",
                    "fit_score": "85",
                    "fit": {
                        "academic": "Great",
                        "social_cultural": "Good",
                        "financial": "Fair"
                    },
                    "overall_fit_rationale": ["Strong CS program", "Research opportunities"],
                    "distinctive_opportunities": [
                        {
                            "title": "AI Research Lab",
                            "url": "https://ai.stanford.edu"
                        }
                    ],
                    "potential_challenges": ["Highly competitive admission"],
                    "why_school_essay_points": ["Innovation culture", "Entrepreneurship focus"],
                    "how_to_stand_out": ["Technical portfolio", "Research experience"]
                }
            ]
        }

    @pytest.mark.asyncio
    async def test_create_recommendations_success(self, client, mock_recommendation_service, sample_recommendation_data):
        """Test successful recommendation creation via API."""
        create_data = {
            "user_id": "user_123"
        }
        
        mock_recommendation_service.create_recommendations.return_value = sample_recommendation_data
        
        with patch('routes.recommendations.recommendation_service', mock_recommendation_service):
            response = await client.post("/recommendations/", json=create_data)
        
        assert response.status_code == 201
        response_json = response.json()
        assert response_json["user_id"] == "user_123"
        assert response_json["status"] == "completed"
        assert len(response_json["recommendations"]) == 1

    @pytest.mark.asyncio
    async def test_create_recommendations_invalid_data(self, client):
        """Test recommendation creation with invalid data."""
        invalid_data = {
            # Missing required user_id
        }
        
        response = await client.post("/recommendations/", json=invalid_data)
        
        assert response.status_code == 422  # Validation error

    @pytest.mark.asyncio
    async def test_get_recommendations_success(self, client, mock_recommendation_service, sample_recommendation_data):
        """Test successful recommendation retrieval."""
        recommendation_id = "507f1f77bcf86cd799439011"
        mock_recommendation_service.get_recommendations.return_value = sample_recommendation_data
        
        with patch('routes.recommendations.recommendation_service', mock_recommendation_service):
            response = await client.get(f"/recommendations/{recommendation_id}")
        
        assert response.status_code == 200
        response_json = response.json()
        assert response_json["id"] == recommendation_id
        assert response_json["user_id"] == "user_123"

    @pytest.mark.asyncio
    async def test_get_recommendations_not_found(self, client, mock_recommendation_service):
        """Test recommendation retrieval when recommendation doesn't exist."""
        from core.exceptions import NotFoundError
        
        recommendation_id = "nonexistent_recommendation"
        mock_recommendation_service.get_recommendations.side_effect = NotFoundError("Recommendations not found")
        
        with patch('routes.recommendations.recommendation_service', mock_recommendation_service):
            response = await client.get(f"/recommendations/{recommendation_id}")
        
        assert response.status_code == 404
        assert "Recommendations not found" in response.json()["detail"]

    @pytest.mark.asyncio
    async def test_get_user_recommendations_success(self, client, mock_recommendation_service, sample_recommendation_data):
        """Test successful user recommendations retrieval."""
        user_id = "user_123"
        mock_recommendation_service.get_user_recommendations.return_value = [sample_recommendation_data]
        
        with patch('routes.recommendations.recommendation_service', mock_recommendation_service):
            response = await client.get(f"/recommendations/user/{user_id}")
        
        assert response.status_code == 200
        response_json = response.json()
        assert len(response_json) == 1
        assert response_json[0]["user_id"] == user_id

    @pytest.mark.asyncio
    async def test_get_user_recommendations_empty(self, client, mock_recommendation_service):
        """Test user recommendations retrieval when user has no recommendations."""
        user_id = "user_with_no_recommendations"
        mock_recommendation_service.get_user_recommendations.return_value = []
        
        with patch('routes.recommendations.recommendation_service', mock_recommendation_service):
            response = await client.get(f"/recommendations/user/{user_id}")
        
        assert response.status_code == 200
        response_json = response.json()
        assert response_json == []

    @pytest.mark.asyncio
    async def test_get_user_recommendations_latest(self, client, mock_recommendation_service, sample_recommendation_data):
        """Test getting latest user recommendations."""
        user_id = "user_123"
        mock_recommendation_service.get_user_recommendations.return_value = [sample_recommendation_data]
        
        with patch('routes.recommendations.recommendation_service', mock_recommendation_service):
            response = await client.get(f"/recommendations/user/{user_id}?latest=true")
        
        assert response.status_code == 200
        response_json = response.json()
        assert len(response_json) == 1
        assert response_json[0]["user_id"] == user_id

    @pytest.mark.asyncio
    async def test_update_recommendations_status_success(self, client, mock_recommendation_service, sample_recommendation_data):
        """Test successful recommendation status update."""
        recommendation_id = "507f1f77bcf86cd799439011"
        status_data = {
            "status": "in_progress"
        }
        
        updated_data = sample_recommendation_data.copy()
        updated_data["status"] = "in_progress"
        mock_recommendation_service.update_recommendations_status.return_value = updated_data
        
        with patch('routes.recommendations.recommendation_service', mock_recommendation_service):
            response = await client.patch(f"/recommendations/{recommendation_id}/status", json=status_data)
        
        assert response.status_code == 200
        response_json = response.json()
        assert response_json["status"] == "in_progress"

    @pytest.mark.asyncio
    async def test_update_recommendations_status_not_found(self, client, mock_recommendation_service):
        """Test recommendation status update when recommendation doesn't exist."""
        from core.exceptions import NotFoundError
        
        recommendation_id = "nonexistent_recommendation"
        status_data = {
            "status": "in_progress"
        }
        
        mock_recommendation_service.update_recommendations_status.side_effect = NotFoundError("Recommendations not found")
        
        with patch('routes.recommendations.recommendation_service', mock_recommendation_service):
            response = await client.patch(f"/recommendations/{recommendation_id}/status", json=status_data)
        
        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_delete_recommendations_success(self, client, mock_recommendation_service):
        """Test successful recommendation deletion."""
        recommendation_id = "507f1f77bcf86cd799439011"
        mock_recommendation_service.delete_recommendations.return_value = True
        
        with patch('routes.recommendations.recommendation_service', mock_recommendation_service):
            response = await client.delete(f"/recommendations/{recommendation_id}")
        
        assert response.status_code == 204

    @pytest.mark.asyncio
    async def test_delete_recommendations_not_found(self, client, mock_recommendation_service):
        """Test recommendation deletion when recommendation doesn't exist."""
        from core.exceptions import NotFoundError
        
        recommendation_id = "nonexistent_recommendation"
        mock_recommendation_service.delete_recommendations.side_effect = NotFoundError("Recommendations not found")
        
        with patch('routes.recommendations.recommendation_service', mock_recommendation_service):
            response = await client.delete(f"/recommendations/{recommendation_id}")
        
        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_generate_recommendations_success(self, client, mock_recommendation_service):
        """Test successful recommendation generation."""
        user_id = "user_123"
        generation_data = {
            "user_id": user_id,
            "force_regenerate": False
        }
        
        mock_recommendation_service.generate_recommendations.return_value = {
            "id": "507f1f77bcf86cd799439011",
            "user_id": user_id,
            "status": "in_progress",
            "message": "Recommendation generation started"
        }
        
        with patch('routes.recommendations.recommendation_service', mock_recommendation_service):
            response = await client.post("/recommendations/generate", json=generation_data)
        
        assert response.status_code == 202  # Accepted for async processing
        response_json = response.json()
        assert response_json["user_id"] == user_id
        assert response_json["status"] == "in_progress"

    @pytest.mark.asyncio
    async def test_generate_recommendations_force_regenerate(self, client, mock_recommendation_service):
        """Test recommendation generation with force regenerate."""
        user_id = "user_123"
        generation_data = {
            "user_id": user_id,
            "force_regenerate": True
        }
        
        mock_recommendation_service.generate_recommendations.return_value = {
            "id": "507f1f77bcf86cd799439011",
            "user_id": user_id,
            "status": "in_progress",
            "message": "Recommendation regeneration started"
        }
        
        with patch('routes.recommendations.recommendation_service', mock_recommendation_service):
            response = await client.post("/recommendations/generate", json=generation_data)
        
        assert response.status_code == 202
        response_json = response.json()
        assert "regeneration" in response_json["message"]

    @pytest.mark.asyncio
    async def test_get_recommendation_status_success(self, client, mock_recommendation_service):
        """Test successful recommendation status retrieval."""
        user_id = "user_123"
        status_data = {
            "user_id": user_id,
            "status": "completed",
            "progress": 100,
            "message": "Recommendations generated successfully"
        }
        
        mock_recommendation_service.get_recommendation_status.return_value = status_data
        
        with patch('routes.recommendations.recommendation_service', mock_recommendation_service):
            response = await client.get(f"/recommendations/status/{user_id}")
        
        assert response.status_code == 200
        response_json = response.json()
        assert response_json["user_id"] == user_id
        assert response_json["status"] == "completed"
        assert response_json["progress"] == 100

    @pytest.mark.asyncio
    async def test_get_recommendation_status_not_found(self, client, mock_recommendation_service):
        """Test recommendation status retrieval when no recommendations exist."""
        user_id = "user_with_no_recommendations"
        mock_recommendation_service.get_recommendation_status.return_value = None
        
        with patch('routes.recommendations.recommendation_service', mock_recommendation_service):
            response = await client.get(f"/recommendations/status/{user_id}")
        
        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_get_recommendations_by_type_success(self, client, mock_recommendation_service):
        """Test successful recommendation retrieval by type."""
        user_id = "user_123"
        recommendation_type = "Match"
        
        filtered_recommendations = [
            {
                "type": "Match",
                "name": "Stanford University",
                "location": "Stanford, CA",
                "fit_score": "85"
            },
            {
                "type": "Match",
                "name": "MIT",
                "location": "Cambridge, MA",
                "fit_score": "82"
            }
        ]
        
        mock_recommendation_service.get_recommendations_by_type.return_value = filtered_recommendations
        
        with patch('routes.recommendations.recommendation_service', mock_recommendation_service):
            response = await client.get(f"/recommendations/user/{user_id}/type/{recommendation_type}")
        
        assert response.status_code == 200
        response_json = response.json()
        assert len(response_json) == 2
        assert all(r["type"] == recommendation_type for r in response_json)

    @pytest.mark.asyncio
    async def test_export_recommendations_success(self, client, mock_recommendation_service):
        """Test successful recommendation export."""
        user_id = "user_123"
        export_format = "pdf"
        
        mock_recommendation_service.export_recommendations.return_value = {
            "download_url": "https://example.com/recommendations.pdf",
            "expires_at": datetime.now().isoformat()
        }
        
        with patch('routes.recommendations.recommendation_service', mock_recommendation_service):
            response = await client.get(f"/recommendations/user/{user_id}/export?format={export_format}")
        
        assert response.status_code == 200
        response_json = response.json()
        assert "download_url" in response_json
        assert response_json["download_url"].endswith(".pdf")

    @pytest.mark.asyncio
    async def test_internal_server_error(self, client, mock_recommendation_service):
        """Test handling of internal server errors."""
        recommendation_id = "507f1f77bcf86cd799439011"
        mock_recommendation_service.get_recommendations.side_effect = Exception("Database connection failed")
        
        with patch('routes.recommendations.recommendation_service', mock_recommendation_service):
            response = await client.get(f"/recommendations/{recommendation_id}")
        
        assert response.status_code == 500
        assert "Internal server error" in response.json()["detail"] 