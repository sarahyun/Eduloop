from pydantic import BaseModel, Field
from typing import Optional, List, Union
from datetime import datetime
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")

# User models
class User(BaseModel):
    user_id: str  # Unique identifier for the user (Firebase UID)
    email: str  # User's email address
    name: Optional[str] = None  # Optional full name of the user
    created_at: datetime = Field(default_factory=datetime.now)  # Account creation timestamp
    last_login: Optional[datetime] = None  # Optional timestamp for the last login
    role: str  # Role (student/counselor/parent)
    students: Optional[List[str]] = []  # List of student IDs (for counselors/parents)
    grade: Optional[str] = None  # Optional field for student to hold grade
    counselor_id: Optional[str] = None  # Optional field for student to hold counselor ID
    parent_id: Optional[str] = None  # Optional field for student to hold parent ID

class UserCreate(BaseModel):
    user_id: str  # Firebase UID
    email: str
    name: Optional[str] = None
    role: str = "student"
    grade: Optional[str] = None
    counselor_id: Optional[str] = None
    parent_id: Optional[str] = None

class UserUpdate(BaseModel):
    name: Optional[str] = None
    last_login: Optional[datetime] = None
    role: Optional[str] = None
    students: Optional[List[str]] = None
    grade: Optional[str] = None
    counselor_id: Optional[str] = None
    parent_id: Optional[str] = None

class UserResponse(BaseModel):
    user_id: str
    email: str
    name: Optional[str] = None
    created_at: datetime
    last_login: Optional[datetime] = None
    role: str
    students: Optional[List[str]] = []
    grade: Optional[str] = None
    counselor_id: Optional[str] = None
    parent_id: Optional[str] = None

# Question-Answer models
class Answer(BaseModel):
    question_id: str
    question_text: str
    answer: str

class Response(BaseModel):
    response_id: str
    user_id: str
    form_id: str
    submitted_at: datetime
    responses: List[Answer]

class ResponseCreate(BaseModel):
    user_id: str
    form_id: str
    responses: List[Answer]

class ResponseUpdate(BaseModel):
    responses: List[Answer]

# Conversation models
class ConversationCreate(BaseModel):
    userId: str
    title: Optional[str] = None

class MessageCreate(BaseModel):
    conversationId: Union[str, int]  # Accept both string and int
    role: str
    content: str
    metadata: Optional[dict] = None

# Question response models
class QuestionResponseCreate(BaseModel):
    userId: str
    questionId: str
    sectionId: str
    response: str

# Chat models
class ChatRequest(BaseModel):
    message: str
    conversationId: str
    userId: str

# Auth models
class LoginRequest(BaseModel):
    email: str
    password: Optional[str] = None