from fastapi import HTTPException
from typing import Optional
import logging

logger = logging.getLogger(__name__)


class BaseAPIException(HTTPException):
    """Base exception for API errors."""
    
    def __init__(self, detail: str, status_code: int = 500):
        super().__init__(status_code=status_code, detail=detail)
        logger.error(f"API Exception: {status_code} - {detail}")


class NotFoundError(BaseAPIException):
    """Resource not found exception."""
    
    def __init__(self, resource: str, identifier: Optional[str] = None):
        detail = f"{resource} not found"
        if identifier:
            detail += f" with identifier: {identifier}"
        super().__init__(detail=detail, status_code=404)


class ConflictError(BaseAPIException):
    """Resource conflict exception."""
    
    def __init__(self, resource: str, detail: Optional[str] = None):
        message = f"{resource} already exists"
        if detail:
            message += f": {detail}"
        super().__init__(detail=message, status_code=409)


class ValidationError(BaseAPIException):
    """Validation error exception."""
    
    def __init__(self, detail: str):
        super().__init__(detail=f"Validation error: {detail}", status_code=422)


class DatabaseError(BaseAPIException):
    """Database operation error."""
    
    def __init__(self, operation: str, error: Exception):
        detail = f"Database {operation} failed: {str(error)}"
        super().__init__(detail=detail, status_code=500)


class ExternalServiceError(BaseAPIException):
    """External service error (e.g., OpenAI API)."""
    
    def __init__(self, service: str, error: Exception):
        detail = f"{service} service error: {str(error)}"
        super().__init__(detail=detail, status_code=503)


def handle_database_error(operation: str):
    """Decorator to handle database errors consistently."""
    def decorator(func):
        async def wrapper(*args, **kwargs):
            try:
                return await func(*args, **kwargs)
            except Exception as e:
                logger.error(f"Database {operation} error: {str(e)}")
                raise DatabaseError(operation, e)
        return wrapper
    return decorator


def handle_external_service_error(service: str):
    """Decorator to handle external service errors consistently."""
    def decorator(func):
        async def wrapper(*args, **kwargs):
            try:
                return await func(*args, **kwargs)
            except Exception as e:
                logger.error(f"{service} service error: {str(e)}")
                raise ExternalServiceError(service, e)
        return wrapper
    return decorator 