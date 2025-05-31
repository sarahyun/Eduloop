from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import ChatRequest, ConversationCreate, MessageCreate, QuestionResponseCreate
from database import db, serialize_doc
from ai_service import ai_service
from routes.users import router as users_router
from routes.profiles import router as profiles_router
from routes.colleges import router as colleges_router
from datetime import datetime

app = FastAPI(title="College Counseling API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(users_router)
app.include_router(profiles_router)
app.include_router(colleges_router)

# Conversation routes
@app.post("/api/conversations/")
async def create_conversation(conversation: ConversationCreate):
    try:
        conversation_data = {
            "userId": conversation.userId,
            "title": conversation.title or "New Conversation",
            "createdAt": datetime.now(),
            "updatedAt": None
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
        async for conversation in db.conversations.find({"userId": user_id}):
            conversations.append(serialize_doc(conversation))
        return conversations
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get conversations: {str(e)}")

@app.post("/api/messages/")
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
        async for message in db.messages.find({"conversationId": conversation_id}):
            messages.append(serialize_doc(message))
        return messages
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get messages: {str(e)}")

@app.post("/api/question-responses/")
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
async def get_user_question_responses(user_id: str, section: str = None):
    try:
        query = {"userId": user_id}
        if section:
            query["sectionId"] = section
            
        responses = []
        async for response in db.questionResponses.find(query):
            responses.append(serialize_doc(response))
        return responses
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get question responses: {str(e)}")

# AI-powered routes
@app.post("/api/chat")
async def chat_with_mentor(request: ChatRequest):
    try:
        # Get student profile and conversation history
        profile = await db.studentProfiles.find_one({"userId": request.userId})
        
        conversation_history = []
        async for message in db.messages.find({"conversationId": request.conversationId}).sort("createdAt", 1):
            conversation_history.append({
                "role": message["role"],
                "content": message["content"]
            })
        
        # Generate AI response
        ai_response = await ai_service.generate_mentor_response(
            user_message=request.message,
            conversation_history=conversation_history,
            student_profile=profile
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
        raise HTTPException(status_code=500, detail=f"Failed to process chat: {str(e)}")

@app.get("/api/college-recommendations/{user_id}")
async def get_college_recommendations(user_id: str):
    try:
        profile = await db.studentProfiles.find_one({"userId": user_id})
        if not profile:
            raise HTTPException(status_code=404, detail="Student profile not found")
        
        recommendations = await ai_service.generate_college_recommendations(profile)
        return {"recommendations": recommendations}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get recommendations: {str(e)}")

@app.get("/api/profile-insights/{user_id}")
async def get_profile_insights(user_id: str):
    try:
        profile = await db.studentProfiles.find_one({"userId": user_id})
        if not profile:
            raise HTTPException(status_code=404, detail="Student profile not found")
        
        # Get conversation history for additional context
        conversation_history = []
        async for message in db.messages.find({"userId": user_id}).sort("createdAt", 1):
            conversation_history.append({
                "role": message["role"],
                "content": message["content"]
            })
        
        insights = await ai_service.generate_profile_insights(profile, conversation_history)
        return {"insights": insights}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get insights: {str(e)}")

@app.get("/")
async def root():
    return {"message": "College Counseling API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)