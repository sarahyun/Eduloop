### profile_service.py

import os
import json
import asyncio
from typing import Dict, Any, Optional
from datetime import datetime
from bson import ObjectId
from openai import OpenAI
from core.database import BaseRepository

class ProfileService:
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.responses_repository = BaseRepository("responses")
        self.profile_generations_repository = BaseRepository("profileGenerations")
        self.profile_prompt = self.load_profile_generation_prompt()

    def load_profile_generation_prompt(self) -> str:
        try:
            prompt_path = os.path.join(os.path.dirname(__file__), "..", "prompts", "profile_generation_prompt.txt")
            with open(prompt_path, 'r', encoding='utf-8') as file:
                return file.read()
        except Exception as e:
            print(f"❌ Failed to load profile generation prompt: {str(e)}")
            return """You are an expert college counselor creating comprehensive student profiles. Generate a detailed analysis in JSON format with a student_profile array of section objects. Each section should have: section_id, title, type, and content."""

    async def fetch_user_responses_context(self, user_id: str) -> str:
        try:
            responses = await self.responses_repository.find_many({"user_id": user_id})
            if not responses:
                return "No student profile information available."

            context_parts = ["Student Profile Information:"]
            for response_doc in responses:
                form_name = response_doc.get("form_id", "Unknown Form").replace("_", " ").title()
                context_parts.append(f"\n{form_name}:")
                for answer in response_doc.get("responses", []):
                    q, a = answer.get("question_text", ""), answer.get("answer", "")
                    if q and a:
                        context_parts.append(f"- {q}: {a}")
            return "\n".join(context_parts)

        except Exception as e:
            print(f"❌ Error fetching responses: {e}")
            return "Error retrieving student profile information."

    async def generate_profile(self, context: str) -> Dict[str, Any]:
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": self.profile_prompt},
                    {"role": "user", "content": context}
                ],
                response_format={"type": "json_object"},
                max_tokens=10000,
                temperature=0.7
            )
            raw_content = response.choices[0].message.content
            result = json.loads(raw_content)
            return result if "student_profile" in result else {"student_profile": []}

        except Exception as e:
            print(f"❌ Failed to generate profile: {e}")
            return {
                "student_profile": [
                    {
                        "section_id": "error",
                        "title": "Profile Generation Error",
                        "type": "paragraph",
                        "content": f"Unable to generate profile: {str(e)}"
                    }
                ]
            }

    async def _background_profile_generation(self, profile_generation_id: ObjectId, user_id: str):
        try:
            await self.profile_generations_repository.update_one(
                {"_id": ObjectId(profile_generation_id)},
                {
                    "status": "generating",
                    "updated_at": datetime.utcnow()
                }
            )

            context = await self.fetch_user_responses_context(user_id)

            if context.startswith("No"):
                await self.profile_generations_repository.update_one(
                    {"_id": ObjectId(profile_generation_id)},
                    {
                        "status": "completed",
                        "student_profile": {
                            "student_profile": [
                                {
                                    "section_id": "no_data",
                                    "title": "Complete Your Profile",
                                    "type": "paragraph",
                                    "content": "No profile data available."
                                }
                            ]
                        },
                        "updated_at": datetime.utcnow()
                    }
                )
                return

            profile_data = await self.generate_profile(context)
            await self.profile_generations_repository.update_one(
                {"_id": ObjectId(profile_generation_id)},
                {
                    "status": "completed",
                    "student_profile": profile_data,
                    "updated_at": datetime.utcnow()
                }
            )

        except Exception as e:
            await self.profile_generations_repository.update_one(
                {"_id": ObjectId(profile_generation_id)},
                {
                    "status": "failed",
                    "error": str(e),
                    "updated_at": datetime.utcnow()
                }
            )

    async def create_profile_generation(self, user_id: str) -> Dict[str, Any]:
        try:
            now = datetime.utcnow()
            record = {
                "user_id": user_id,
                "student_profile": None,
                "created_at": now,
                "updated_at": now,
                "status": "generating",
                "generation_metadata": {
                    "context_source": "user_responses",
                    "model": "gpt-4o",
                    "prompt_version": "v1",
                    "generated_at": now.isoformat()
                }
            }
            created = await self.profile_generations_repository.create(record)
            asyncio.create_task(self._background_profile_generation(created["_id"], user_id))
            return created

        except Exception as e:
            raise Exception(f"Failed to create profile generation: {str(e)}")

    async def get_generation_status(self, user_id: str) -> Optional[Dict[str, Any]]:
        try:
            generations = await self.profile_generations_repository.find_many({"user_id": user_id})
            if not generations:
                return None

            latest = max(generations, key=lambda x: x.get("created_at", datetime.min))
            if latest["status"] == "generating" and (datetime.utcnow() - latest["created_at"]).total_seconds() > 180:
                await self.profile_generations_repository.update_one(
                    {"_id": ObjectId(latest["_id"])},
                    {
                        "status": "failed",
                        "error": "Timeout after 3 minutes",
                        "updated_at": datetime.utcnow()
                    }
                )
                latest["status"] = "failed"
            return {
                "status": latest["status"],
                "created_at": latest.get("created_at"),
                "updated_at": latest.get("updated_at"),
                "error": latest.get("error"),
                "generation_id": str(latest["_id"])
            }

        except Exception as e:
            raise Exception(f"Error getting generation status: {str(e)}")

    async def get_latest_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        try:
            completed = await self.profile_generations_repository.find_many({"user_id": user_id, "status": "completed"})
            if not completed:
                return None
            return max(completed, key=lambda x: x.get("created_at", datetime.min))
        except Exception as e:
            raise Exception(f"Failed to get latest profile: {str(e)}")

    async def get_profile_history(self, user_id: str, skip: int = 0, limit: int = 10) -> list:
        try:
            history = await self.profile_generations_repository.find_many({"user_id": user_id})
            sorted_history = sorted(history, key=lambda x: x.get("created_at", datetime.min), reverse=True)
            return sorted_history[skip:skip+limit]
        except Exception as e:
            raise Exception(f"Failed to get profile history: {str(e)}")

profile_service = ProfileService()