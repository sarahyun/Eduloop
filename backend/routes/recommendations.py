from bson import ObjectId
from fastapi import APIRouter, HTTPException
from core.database import BaseRepository
from services.recommendation_service import recommendation_service
from datetime import datetime, timedelta
from typing import Optional
import asyncio

router = APIRouter(prefix="/recommendations", tags=["recommendations"])
recommendations_repository = BaseRepository("recommendations")

GENERATION_DEADLOCK_SECONDS = 180
GENERATION_GRACE_PERIOD_SECONDS = 30

@router.post("/generate/{user_id}")
async def create_recommendations(user_id: str):
    """Start async generation of college recommendations for a user"""
    try:
        # Check if a recent generation is already in progress
        recent_generating = await recommendations_repository.find_one({
            "user_id": user_id,
            "status": "generating",
            "updated_at": {"$gt": datetime.now() - timedelta(seconds=GENERATION_GRACE_PERIOD_SECONDS)}
        })

        if recent_generating:
            return {
                "status": "generating",
                "message": "Recommendation generation already in progress",
                "recommendation_id": str(recent_generating["_id"]),
                "updated_at": recent_generating["updated_at"].isoformat()
            }

        now = datetime.now()

        initial_data = {
            "user_id": user_id,
            "recommendations": [],
            "status": "generating",
            "created_at": now,
            "updated_at": now,
            "generation_metadata": {
                "started_at": now.isoformat(),
                "context_source": "user_responses"
            }
        }

        created_doc = await recommendations_repository.create(initial_data)
        recommendation_id = created_doc["_id"]

        asyncio.create_task(generate_recommendations_background(user_id, recommendation_id))

        return {
            "status": "generating",
            "message": "Recommendation generation started",
            "recommendation_id": str(recommendation_id),
            "started_at": now.isoformat()
        }

    except Exception as e:
        print(f"❌ Error creating recommendations: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to start generation: {str(e)}")


async def generate_recommendations_background(user_id: str, recommendation_id: str):
    try:
        print(f"🔄 Starting background generation for user: {user_id}")

        await recommendations_repository.update_one(
            {"_id": ObjectId(recommendation_id)},
            {"updated_at": datetime.now()}
        )

        print("📞 Calling generate_full_recommendations")
        recommendations = await recommendation_service.generate_full_recommendations(user_id)
        print("✅ Recommendation service returned")

        if not recommendations or not hasattr(recommendations, 'recommendations'):
            raise ValueError("Invalid or missing recommendation data")

        print(f"📦 Received {len(recommendations.recommendations)} recs")
        print(recommendation_id)
        result = await recommendations_repository.update_one(
            {"_id": ObjectId(recommendation_id)},
            {
                "recommendations": [rec.dict() for rec in recommendations.recommendations],
                "status": "completed",
                "updated_at": datetime.now(),
                "generation_metadata": recommendations.generation_metadata
            }
        )

        print(f"🧪 Update result: {result}")

        print(f"✅ Background generation completed for user: {user_id}")

    except Exception as e:
        print(f"❌ Background generation failed: {e}")
        import traceback
        print(traceback.format_exc())
        await recommendations_repository.update_one(
            {"_id": ObjectId(recommendation_id)},
            {
                "status": "failed",
                "updated_at": datetime.now(),
                "error": str(e)
            }
        )



@router.get("/{user_id}/status")
async def get_generation_status(user_id: str):
    """Get the latest generation status"""
    try:
        docs = await recommendations_repository.find_many({"user_id": user_id})

        if not docs:
            return {"status": "not_found", "message": "No recommendations found"}

        doc = max(docs, key=lambda x: x.get("updated_at", datetime.min))

        # Deadlock check
        now = datetime.now()
        updated_at = doc.get("updated_at", datetime.min)
        time_diff = now - updated_at

        if doc["status"] == "generating" and time_diff.total_seconds() > GENERATION_DEADLOCK_SECONDS:
            await recommendations_repository.update_one(
                {"_id": ObjectId(doc["_id"])},
                {
                    "status": "failed",
                    "updated_at": now,
                    "error": f"Timed out after {int(time_diff.total_seconds())}s"
                }
            )
            return {
                "status": "failed",
                "error": f"Generation timed out after {int(time_diff.total_seconds())} seconds",
                "recommendation_id": str(doc["_id"]),
                "updated_at": now.isoformat()
            }

        response = {
            "status": doc["status"],
            "recommendation_id": str(doc["_id"]),
            "updated_at": updated_at.isoformat() if updated_at else None,
        }

        if doc["status"] == "failed" and "error" in doc:
            response["error"] = doc["error"]

        if doc["status"] == "completed":
            response["generation_metadata"] = doc.get("generation_metadata", {})
            response["recommendation_count"] = len(doc.get("recommendations", []))

        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching status: {str(e)}")


@router.get("/{user_id}")
async def get_user_recommendations(user_id: str):
    """Fetch the latest completed recommendations for a user"""
    try:
        # Fetch all completed recommendations for the user
        docs = await recommendations_repository.find_many({
            "user_id": user_id,
            "status": "completed"
        })

        if not docs:
            raise HTTPException(status_code=404, detail="No completed recommendations found")

        # Return the one with the most recent updated_at
        latest = max(docs, key=lambda x: x.get("updated_at", datetime.min))

        return {
            "status": "completed",
            "recommendations": latest.get("recommendations", []),
            "generation_metadata": latest.get("generation_metadata", {}),
            "updated_at": latest["updated_at"].isoformat()
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching recommendations: {str(e)}")


@router.delete("/{user_id}")
async def delete_user_recommendations(user_id: str):
    """Delete all recommendations for a user"""
    try:
        count = await recommendations_repository.delete_many({"user_id": user_id})
        return {
            "message": f"Deleted {count} recommendation records",
            "deleted_count": count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting recommendations: {str(e)}")
