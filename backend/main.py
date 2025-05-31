from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId
import os
from ai_service import ai_service

app = FastAPI(title="College Counseling API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URI = os.getenv('MONGODB_URI')
client = AsyncIOMotorClient(MONGO_URI)
db = client['CollegeCounselingDB']

# Pydantic models
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

class ConversationCreate(BaseModel):
    userId: str
    title: Optional[str] = None

class MessageCreate(BaseModel):
    conversationId: str
    role: str
    content: str
    metadata: Optional[dict] = None

class QuestionResponseCreate(BaseModel):
    userId: str
    questionId: str
    sectionId: str
    response: str

# Helper functions
def serialize_doc(doc):
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc

# User routes
@app.post("/api/users/", response_model=UserResponse)
async def create_user(user: UserCreate):
    try:
        user_data = {
            "userId": user.userId,
            "email": user.email,
            "name": user.name,
            "role": user.role,
            "grade": user.grade,
            "students": [],
            "counselorId": None,
            "parentId": None,
            "createdAt": datetime.now(),
            "lastLogin": None
        }
        
        result = await db.users.insert_one(user_data)
        
        return UserResponse(
            user_id=user.userId,
            email=user.email,
            name=user.name,
            role=user.role,
            grade=user.grade
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create user: {str(e)}")

@app.get("/api/users/{uid}", response_model=UserResponse)
async def get_user(uid: str):
    try:
        user = await db.users.find_one({"userId": uid})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return UserResponse(
            user_id=user["userId"],
            email=user["email"],
            name=user["name"],
            role=user["role"],
            grade=user.get("grade")
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user: {str(e)}")

# Student profile routes
@app.post("/api/profiles")
async def create_profile(profile: StudentProfileCreate):
    try:
        profile_data = profile.dict()
        profile_data["createdAt"] = datetime.now()
        profile_data["updatedAt"] = None
        
        result = await db.studentProfiles.insert_one(profile_data)
        profile_data["_id"] = str(result.inserted_id)
        
        return serialize_doc(profile_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create profile: {str(e)}")

@app.get("/api/profiles/{user_id}")
async def get_profile(user_id: str):
    try:
        profile = await db.studentProfiles.find_one({"userId": user_id})
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        return serialize_doc(profile)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get profile: {str(e)}")

@app.put("/api/profiles/{user_id}")
async def update_profile(user_id: str, profile_update: StudentProfileUpdate):
    try:
        update_data = {k: v for k, v in profile_update.dict().items() if v is not None}
        update_data["updatedAt"] = datetime.now()
        
        result = await db.studentProfiles.update_one(
            {"userId": user_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        updated_profile = await db.studentProfiles.find_one({"userId": user_id})
        return serialize_doc(updated_profile)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update profile: {str(e)}")

# College routes
@app.get("/api/colleges")
async def get_colleges():
    try:
        colleges = []
        async for college in db.colleges.find({}):
            colleges.append(serialize_doc(college))
        return colleges
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get colleges: {str(e)}")

@app.get("/api/colleges/search")
async def search_colleges(q: str = ""):
    try:
        colleges = []
        query = {
            "$or": [
                {"name": {"$regex": q, "$options": "i"}},
                {"location": {"$regex": q, "$options": "i"}}
            ]
        } if q else {}
        
        async for college in db.colleges.find(query):
            colleges.append(serialize_doc(college))
        return colleges
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to search colleges: {str(e)}")

# Conversation routes
@app.post("/api/conversations")
async def create_conversation(conversation: ConversationCreate):
    try:
        conversation_data = {
            "userId": conversation.userId,
            "title": conversation.title,
            "createdAt": datetime.now(),
            "updatedAt": datetime.now()
        }
        
        result = await db.conversations.insert_one(conversation_data)
        conversation_data["_id"] = str(result.inserted_id)
        
        return serialize_doc(conversation_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create conversation: {str(e)}")

@app.get("/api/conversations/{user_id}")
async def get_user_conversations(user_id: str):
    try:
        conversations = []
        async for conv in db.conversations.find({"userId": user_id}):
            conversations.append(serialize_doc(conv))
        return conversations
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get conversations: {str(e)}")

# Message routes
@app.post("/api/messages")
async def create_message(message: MessageCreate):
    try:
        message_data = {
            "conversationId": message.conversationId,
            "role": message.role,
            "content": message.content,
            "metadata": message.metadata,
            "createdAt": datetime.now()
        }
        
        result = await db.messages.insert_one(message_data)
        message_data["_id"] = str(result.inserted_id)
        
        return serialize_doc(message_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create message: {str(e)}")

@app.get("/api/messages/{conversation_id}")
async def get_conversation_messages(conversation_id: str):
    try:
        messages = []
        async for msg in db.messages.find({"conversationId": conversation_id}):
            messages.append(serialize_doc(msg))
        return messages
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get messages: {str(e)}")

# Question response routes
@app.post("/api/question-responses")
async def create_question_response(response: QuestionResponseCreate):
    try:
        response_data = {
            "userId": response.userId,
            "questionId": response.questionId,
            "sectionId": response.sectionId,
            "response": response.response,
            "createdAt": datetime.now()
        }
        
        result = await db.questionResponses.insert_one(response_data)
        response_data["_id"] = str(result.inserted_id)
        
        return serialize_doc(response_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create question response: {str(e)}")

@app.get("/api/question-responses/{user_id}")
async def get_user_question_responses(user_id: str, section: Optional[str] = None):
    try:
        query = {"userId": user_id}
        if section:
            query["sectionId"] = section
            
        responses = []
        async for resp in db.questionResponses.find(query):
            responses.append(serialize_doc(resp))
        return responses
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get question responses: {str(e)}")

# AI-powered routes
class ChatRequest(BaseModel):
    message: str
    conversationId: str
    userId: str

@app.post("/api/chat")
async def chat_with_mentor(request: ChatRequest):
    try:
        # Get conversation history
        messages = []
        async for msg in db.messages.find({"conversationId": request.conversationId}):
            messages.append({"role": msg["role"], "content": msg["content"]})
        
        # Get student profile for context
        student_profile = await db.studentProfiles.find_one({"userId": request.userId})
        
        # Generate AI response
        ai_response = await ai_service.generate_mentor_response(
            request.message, 
            messages, 
            student_profile
        )
        
        # Save user message
        await db.messages.insert_one({
            "conversationId": request.conversationId,
            "role": "user",
            "content": request.message,
            "createdAt": datetime.now()
        })
        
        # Save AI response
        await db.messages.insert_one({
            "conversationId": request.conversationId,
            "role": "assistant",
            "content": ai_response,
            "createdAt": datetime.now()
        })
        
        return {"response": ai_response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")

@app.get("/api/recommendations/{user_id}")
async def get_college_recommendations(user_id: str):
    try:
        # Get student profile
        student_profile = await db.studentProfiles.find_one({"userId": user_id})
        if not student_profile:
            raise HTTPException(status_code=404, detail="Student profile not found")
        
        # Generate recommendations using AI
        recommendations = await ai_service.generate_college_recommendations(student_profile)
        
        return {"recommendations": [rec.dict() for rec in recommendations]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate recommendations: {str(e)}")

@app.get("/api/insights/{user_id}")
async def get_profile_insights(user_id: str):
    try:
        # Get student profile
        student_profile = await db.studentProfiles.find_one({"userId": user_id})
        if not student_profile:
            raise HTTPException(status_code=404, detail="Student profile not found")
        
        # Generate insights using AI
        insights = await ai_service.generate_profile_insights(student_profile)
        
        return {"insights": [insight.dict() for insight in insights]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate insights: {str(e)}")

@app.get("/")
async def root():
    return {"message": "College Counseling API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)