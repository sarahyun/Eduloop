import openai
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import json
import logging

from core.config import settings
from core.exceptions import ExternalServiceError, handle_external_service_error

logger = logging.getLogger(__name__)


class AIService:
    """AI service for OpenAI interactions."""
    
    def __init__(self):
        if not settings.openai_api_key:
            logger.warning("OpenAI API key not configured")
        self.client = openai.OpenAI(api_key=settings.openai_api_key)
    
    async def generate_mentor_response(
        self, 
        user_message: str, 
        conversation_history: List[Dict[str, str]], 
        student_profile: Optional[Dict[str, Any]] = None
    ) -> str:
        """Generate a mentor response using OpenAI."""
        try:
            # Build context from conversation history
            messages = [
                {"role": "system", "content": "You are a helpful college counselor and mentor. Provide personalized advice to help students with their college planning and applications."}
            ]
            
            # Add conversation history
            for msg in conversation_history[-10:]:  # Keep last 10 messages for context
                messages.append({"role": msg["role"], "content": msg["content"]})
            
            # Add current user message
            messages.append({"role": "user", "content": user_message})
            
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=messages,
                max_tokens=500,
                temperature=0.7
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"AI mentor response generation error: {e}")
            return "I'm here to help you with your college journey! What would you like to know?"
    
# Global service instance
ai_service = AIService() 