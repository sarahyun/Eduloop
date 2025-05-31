from fastapi import APIRouter, HTTPException
from typing import Optional
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import db, serialize_doc

router = APIRouter(prefix="/api/colleges", tags=["colleges"])

@router.get("")
async def get_colleges():
    try:
        colleges = []
        async for college in db.colleges.find({}):
            colleges.append(serialize_doc(college))
        return colleges
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get colleges: {str(e)}")

@router.get("/search")
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