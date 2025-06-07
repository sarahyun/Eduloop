"""
Pytest configuration and shared fixtures for Eduloop backend tests.
"""
import asyncio
import os
import pytest
import pytest_asyncio
from unittest.mock import AsyncMock, MagicMock, patch
from typing import Dict, Any, List
from datetime import datetime
from bson import ObjectId

# Set test environment
os.environ["ENVIRONMENT"] = "test"
os.environ["MONGODB_URI"] = "mongodb://localhost:27017"
os.environ["DATABASE_NAME"] = "eduloop_test"
os.environ["OPENAI_API_KEY"] = "test-key"

from core.database import DatabaseManager
from core.config import settings
from models import User, Response, CollegeRecommendations


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture
async def mock_db_manager():
    """Mock database manager for unit tests."""
    mock_manager = MagicMock(spec=DatabaseManager)
    mock_manager.database = MagicMock()
    mock_manager.client = MagicMock()
    
    # Mock collections
    mock_manager.users = AsyncMock()
    mock_manager.responses = AsyncMock()
    mock_manager.recommendations = AsyncMock()
    mock_manager.profileGenerations = AsyncMock()
    mock_manager.conversations = AsyncMock()
    
    return mock_manager


@pytest_asyncio.fixture
async def test_db_manager():
    """Real database manager for integration tests."""
    db_manager = DatabaseManager()
    await db_manager.connect()
    yield db_manager
    await db_manager.disconnect()


@pytest.fixture
def mock_openai_client():
    """Mock OpenAI client for testing AI services."""
    mock_client = MagicMock()
    
    # Mock chat completions
    mock_response = MagicMock()
    mock_response.choices = [MagicMock()]
    mock_response.choices[0].message.content = '{"test": "response"}'
    
    mock_client.chat.completions.create.return_value = mock_response
    
    return mock_client


@pytest.fixture
def sample_user_data():
    """Sample user data for testing."""
    return {
        "user_id": "test_user_123",
        "email": "test@example.com",
        "name": "Test User",
        "role": "student",
        "grade": "12",
        "created_at": datetime.now()
    }


@pytest.fixture
def sample_response_data():
    """Sample response data for testing."""
    return {
        "response_id": "resp_123",
        "user_id": "test_user_123",
        "form_id": "academic_profile",
        "submitted_at": datetime.now(),
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
def sample_recommendation_data():
    """Sample recommendation data for testing."""
    return {
        "user_id": "test_user_123",
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
                "potential_challenges": ["Highly competitive"],
                "why_school_essay_points": ["Innovation culture"],
                "how_to_stand_out": ["Showcase technical projects"]
            }
        ],
        "status": "completed",
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }


@pytest.fixture
def mock_user_responses_context():
    """Mock user responses context for AI services."""
    return """
    Student Profile Information:
    
    Academic Profile:
    - What is your GPA?: 3.8
    - What are your favorite subjects?: Mathematics and Computer Science
    - What extracurricular activities are you involved in?: Robotics Club, Math Olympiad
    
    College Preferences:
    - What type of college environment do you prefer?: Research university
    - What is your preferred location?: West Coast
    """


@pytest.fixture
def mock_ai_response():
    """Mock AI response for testing."""
    return {
        "recommendations": [
            {
                "type": "Reach",
                "name": "MIT",
                "location": "Cambridge, MA",
                "fit_score": "75",
                "fit": {
                    "academic": "Great",
                    "social_cultural": "Good", 
                    "financial": "Fair"
                },
                "overall_fit_rationale": ["Top engineering program"],
                "distinctive_opportunities": [
                    {
                        "title": "CSAIL Research",
                        "search_query": "MIT CSAIL computer science research lab"
                    }
                ],
                "potential_challenges": ["Very competitive"],
                "why_school_essay_points": ["Innovation focus"],
                "how_to_stand_out": ["Technical portfolio"]
            }
        ]
    }


@pytest.fixture
def mock_profile_response():
    """Mock profile generation response."""
    return {
        "student_profile": [
            {
                "section_id": "core_snapshot",
                "title": "🌱 Core Snapshot",
                "type": "paragraph",
                "content": "You are a analytically-minded student with strong STEM interests."
            },
            {
                "section_id": "academic_profile",
                "title": "📚 Academic Profile",
                "type": "bullets",
                "content": [
                    "GPA: 3.8 - demonstrates consistent academic performance",
                    "Strong in mathematics and computer science",
                    "Active in STEM extracurriculars"
                ]
            }
        ]
    }


@pytest.fixture
def mock_conversation_data():
    """Mock conversation data for testing."""
    return {
        "conversation_id": "conv_123",
        "user_id": "test_user_123",
        "title": "College Planning Discussion",
        "messages": [
            {
                "role": "user",
                "content": "What colleges should I consider for computer science?",
                "timestamp": datetime.now()
            },
            {
                "role": "assistant", 
                "content": "Based on your profile, I'd recommend looking at MIT, Stanford, and Carnegie Mellon.",
                "timestamp": datetime.now()
            }
        ],
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }


@pytest_asyncio.fixture
async def async_mock_db():
    """Async mock database for testing."""
    mock_db = AsyncMock()
    
    # Mock collection methods
    mock_db.find_one = AsyncMock(return_value=None)
    mock_db.find = AsyncMock(return_value=[])
    mock_db.insert_one = AsyncMock()
    mock_db.update_one = AsyncMock()
    mock_db.delete_one = AsyncMock()
    mock_db.count_documents = AsyncMock(return_value=0)
    
    return mock_db


@pytest_asyncio.fixture(autouse=True)
async def cleanup_test_data(test_db_manager):
    """Clean up test data after each test."""
    yield
    # Cleanup logic would go here if using real database
    # For now, we're using mocks so no cleanup needed
    pass


@pytest.fixture
def mock_database_error():
    """Mock database error for testing error handling."""
    from core.exceptions import DatabaseError
    return DatabaseError("Test database error")


@pytest.fixture
def mock_openai_error():
    """Mock OpenAI error for testing error handling."""
    from openai import OpenAIError
    return OpenAIError("Test OpenAI error")


@pytest_asyncio.fixture
async def test_client():
    """Test client for API testing."""
    from httpx import AsyncClient
    from main import app
    
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client 