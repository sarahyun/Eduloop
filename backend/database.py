from motor.motor_asyncio import AsyncIOMotorClient
import os

# MongoDB connection
MONGO_URI = os.getenv('MONGODB_URI')
client = AsyncIOMotorClient(MONGO_URI)
db = client['CollegeCounselingDB']

# Helper functions
def serialize_doc(doc):
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc

async def get_database():
    return db