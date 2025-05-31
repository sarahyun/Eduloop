from pydantic import BaseModel, Field
from typing import Optional, List
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
class UserCreate(BaseModel):
    userId: str  # Firebase UID
    email: str
    name: str
    role: str = "student"
    grade: Optional[str] = None

class UserResponse(BaseModel):
    user_id: str
    email: str
    name: str
    role: str
    grade: Optional[str] = None

# Student profile models
class StudentProfileCreate(BaseModel):
    userId: str
    careerMajor: Optional[str] = None
    dreamSchools: Optional[str] = None
    introFreeTimeActivities: Optional[str] = None
    introCollegeExperience: Optional[str] = None
    extracurriculars: Optional[str] = None
    gpaTestScores: Optional[str] = None
    currentGPA: Optional[str] = None
    satScore: Optional[str] = None
    actScore: Optional[str] = None
    apCourses: Optional[str] = None
    academicHonors: Optional[str] = None
    personalBackground: Optional[str] = None
    personalValues: Optional[str] = None
    personalChallenges: Optional[str] = None
    personalGrowth: Optional[str] = None
    personalLeadership: Optional[str] = None
    personalCommunity: Optional[str] = None
    collegeGoals: Optional[str] = None
    careerAspirations: Optional[str] = None
    personalGoals: Optional[str] = None
    preferredMajors: Optional[str] = None
    collegeSize: Optional[str] = None
    collegeLocation: Optional[str] = None
    collegeCost: Optional[str] = None
    collegeEnvironment: Optional[str] = None
    collegeActivities: Optional[str] = None
    profileCompletion: float = 0.0

class StudentProfileUpdate(BaseModel):
    careerMajor: Optional[str] = None
    dreamSchools: Optional[str] = None
    introFreeTimeActivities: Optional[str] = None
    introCollegeExperience: Optional[str] = None
    extracurriculars: Optional[str] = None
    gpaTestScores: Optional[str] = None
    currentGPA: Optional[str] = None
    satScore: Optional[str] = None
    actScore: Optional[str] = None
    apCourses: Optional[str] = None
    academicHonors: Optional[str] = None
    personalBackground: Optional[str] = None
    personalValues: Optional[str] = None
    personalChallenges: Optional[str] = None
    personalGrowth: Optional[str] = None
    personalLeadership: Optional[str] = None
    personalCommunity: Optional[str] = None
    collegeGoals: Optional[str] = None
    careerAspirations: Optional[str] = None
    personalGoals: Optional[str] = None
    preferredMajors: Optional[str] = None
    collegeSize: Optional[str] = None
    collegeLocation: Optional[str] = None
    collegeCost: Optional[str] = None
    collegeEnvironment: Optional[str] = None
    collegeActivities: Optional[str] = None
    profileCompletion: Optional[float] = None

# Conversation models
class ConversationCreate(BaseModel):
    userId: str
    title: Optional[str] = None

class MessageCreate(BaseModel):
    conversationId: str
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