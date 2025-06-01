from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import ChatRequest, ConversationCreate, MessageCreate, QuestionResponseCreate
from database import db, serialize_doc
from ai_service import ai_service
from routes.users import router as users_router
from routes.profiles import router as responses_router
from routes.colleges import router as colleges_router
from routes.auth import router as auth_router
from datetime import datetime
import time

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
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(responses_router)
app.include_router(colleges_router)

# Conversation routes
@app.post("/conversations")
async def create_conversation(conversation: ConversationCreate):
    try:
        # Generate a numeric ID for consistency with frontend expectations
        numeric_id = int(time.time() * 1000)  # Use timestamp as numeric ID
        
        conversation_data = {
            "userId": conversation.userId,
            "title": conversation.title or "New Conversation",
            "lastMessage": "",
            "timestamp": datetime.now().isoformat(),
            "numericId": numeric_id  # Store both for compatibility
        }
        
        result = await db.conversations.insert_one(conversation_data)
        conversation_data["id"] = numeric_id  # Return numeric ID to frontend
        if "_id" in conversation_data:
            del conversation_data["_id"]
        if "numericId" in conversation_data:
            del conversation_data["numericId"]  # Don't expose internal field
        
        return conversation_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create conversation: {str(e)}")

@app.get("/conversations/{user_id}")
async def get_user_conversations(user_id: str):
    try:
        conversations = []
        async for conversation in db.conversations.find({"userId": user_id}):
            conversation_data = serialize_doc(conversation)
            # Use numeric ID if available, otherwise use a generated one
            if "numericId" in conversation_data:
                conversation_data["id"] = conversation_data["numericId"]
                del conversation_data["numericId"]
            else:
                conversation_data["id"] = hash(conversation_data["_id"]) % 1000000  # Generate from ObjectId
            del conversation_data["_id"]
            conversations.append(conversation_data)
        
        # If no conversations exist, return some default ones
        if not conversations:
            conversations = [
                {
                    "id": 1,
                    "userId": user_id,
                    "title": "College Planning Discussion",
                    "lastMessage": "How can I improve my college application?",
                    "timestamp": datetime.now().isoformat()
                },
                {
                    "id": 2,
                    "userId": user_id,
                    "title": "Profile Completion Help",
                    "lastMessage": "Let me help you complete your profile.",
                    "timestamp": datetime.now().isoformat()
                }
            ]
        
        return conversations
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get conversations: {str(e)}")

@app.post("/messages")
async def create_message(message: MessageCreate):
    try:
        # Convert conversationId to string for consistent storage
        conversation_id_str = str(message.conversationId)
        
        # Create user message
        user_message_data = {
            "conversationId": conversation_id_str,
            "role": message.role,
            "content": message.content,
            "timestamp": datetime.now().isoformat()
        }
        
        user_result = await db.messages.insert_one(user_message_data)
        user_message_data["id"] = str(user_result.inserted_id)
        if "_id" in user_message_data:
            del user_message_data["_id"]
        
        # Generate AI response
        ai_response_content = await generate_ai_response(message.content)
        
        # Create AI message
        ai_message_data = {
            "conversationId": conversation_id_str,
            "role": "assistant",
            "content": ai_response_content,
            "timestamp": datetime.now().isoformat()
        }
        
        ai_result = await db.messages.insert_one(ai_message_data)
        ai_message_data["id"] = str(ai_result.inserted_id)
        if "_id" in ai_message_data:
            del ai_message_data["_id"]
        
        return {
            "userMessage": user_message_data,
            "aiMessage": ai_message_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create message: {str(e)}")

@app.get("/messages/{conversation_id}")
async def get_conversation_messages(conversation_id: str):
    try:
        messages = []
        # Use string comparison instead of converting to int
        async for message in db.messages.find({"conversationId": conversation_id}):
            message_data = serialize_doc(message)
            message_data["id"] = message_data.pop("_id")
            messages.append(message_data)
        
        # If no messages exist, return a default welcome message
        if not messages:
            messages = [
                {
                    "id": 1,
                    "conversationId": conversation_id,  # Keep as string
                    "role": "assistant",
                    "content": "Hello! I'm here to help you with your college planning. How can I assist you today?",
                    "timestamp": datetime.now().isoformat()
                }
            ]
        
        return messages
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get messages: {str(e)}")

async def generate_ai_response(content: str) -> str:
    """Generate AI response using OpenAI for all cases"""
    try:
        # Check if this is a profile completion context
        if "CONTEXT: You are a helpful college counselor" in content:
            # This is profile completion mode - send the full context to OpenAI
            response = ai_service.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": content},  # Send the full context as system message
                ],
                max_tokens=500,
                temperature=0.7
            )
            return response.choices[0].message.content
        
        else:
            # For regular chat, use the existing AI service method
            return await ai_service.generate_mentor_response(
                user_message=content,
                conversation_history=[],
                student_profile=None
            )
    except Exception as e:
        print(f"AI response generation error: {e}")
        return "I'm here to help you with your college journey! What would you like to know?"

@app.post("/question-responses/")
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

@app.get("/question-responses/{user_id}")
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
@app.post("/chat")
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

@app.get("/college-recommendations/{user_id}")
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

@app.get("/profile-insights/{user_id}")
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
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)