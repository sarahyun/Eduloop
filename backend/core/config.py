import os
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings and configuration."""
    
    # Database
    mongodb_uri: str = os.getenv('MONGODB_URI', 'mongodb://localhost:27017')
    database_name: str = os.getenv('DATABASE_NAME', 'CollegeCounselingDB')
    
    # OpenAI
    openai_api_key: str = os.getenv('OPENAI_API_KEY', '')
    
    # API
    api_title: str = "College Counseling API"
    api_version: str = "1.0.0"
    debug: bool = os.getenv('DEBUG', 'False').lower() == 'true'
    
    # CORS
    allowed_origins: list = ["*"]  # Configure based on environment
    
    # Redis (if needed)
    redis_url: Optional[str] = os.getenv('REDIS_URL')
    
    class Config:
        env_file = ".env"
        extra = "allow"  # Allow extra fields to prevent validation errors


# Global settings instance
settings = Settings() 