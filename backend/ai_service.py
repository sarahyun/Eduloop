import os
import openai
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class CollegeRecommendation(BaseModel):
    name: str
    matchScore: float
    reasoning: str
    category: str  # 'reach', 'match', 'safety'
    highlights: List[str]
    confidenceScore: float
    learningFactors: List[str]

class ProfileInsight(BaseModel):
    type: str  # 'strength', 'growth_area', 'recommendation', 'strategy'
    title: str
    description: str
    actionItems: List[str]

class AIService:
    def __init__(self):
        self.client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    async def generate_mentor_response(self, user_message: str, conversation_history: List[Dict], student_profile: Optional[Dict] = None) -> str:
        """Generate AI mentor response for student conversations"""
        try:
            # Build context from student profile and conversation history
            context = "You are an experienced college counselor and mentor. Provide helpful, encouraging guidance."
            
            if student_profile:
                context += f"\n\nStudent Profile Summary:\n"
                if student_profile.get('careerMajor'):
                    context += f"- Interested in: {student_profile['careerMajor']}\n"
                if student_profile.get('dreamSchools'):
                    context += f"- Dream schools: {student_profile['dreamSchools']}\n"
                if student_profile.get('currentGPA'):
                    context += f"- GPA: {student_profile['currentGPA']}\n"
                if student_profile.get('extracurriculars'):
                    context += f"- Activities: {student_profile['extracurriculars']}\n"

            messages = [{"role": "system", "content": context}]
            
            # Add conversation history
            for msg in conversation_history[-10:]:  # Last 10 messages for context
                messages.append({
                    "role": msg["role"],
                    "content": msg["content"]
                })
            
            messages.append({"role": "user", "content": user_message})

            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=messages,
                max_tokens=500,
                temperature=0.7
            )

            return response.choices[0].message.content

        except Exception as e:
            return f"I'm having trouble connecting right now. Please try again later. Error: {str(e)}"

    async def generate_college_recommendations(self, student_profile: Dict) -> List[CollegeRecommendation]:
        """Generate personalized college recommendations based on student profile"""
        try:
            prompt = f"""
            Based on this student profile, recommend 6-8 colleges categorized as reach, match, and safety schools.
            
            Student Profile:
            - Academic Interests: {student_profile.get('careerMajor', 'Undecided')}
            - GPA: {student_profile.get('currentGPA', 'Not provided')}
            - SAT Score: {student_profile.get('satScore', 'Not provided')}
            - ACT Score: {student_profile.get('actScore', 'Not provided')}
            - Extracurriculars: {student_profile.get('extracurriculars', 'Not provided')}
            - Preferred Location: {student_profile.get('collegeLocation', 'Any')}
            - College Size Preference: {student_profile.get('collegeSize', 'Any')}
            - College Environment: {student_profile.get('collegeEnvironment', 'Any')}
            - Dream Schools: {student_profile.get('dreamSchools', 'Not specified')}
            
            Respond with a JSON object containing an array of college recommendations.
            """

            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are a college admissions expert. Provide realistic, helpful college recommendations in JSON format."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                max_tokens=2000
            )

            # Parse and return recommendations
            import json
            result = json.loads(response.choices[0].message.content)
            
            recommendations = []
            for rec in result.get('recommendations', []):
                recommendations.append(CollegeRecommendation(
                    name=rec.get('name', ''),
                    matchScore=rec.get('matchScore', 0.0),
                    reasoning=rec.get('reasoning', ''),
                    category=rec.get('category', 'match'),
                    highlights=rec.get('highlights', []),
                    confidenceScore=rec.get('confidenceScore', 0.0),
                    learningFactors=rec.get('learningFactors', [])
                ))
            
            return recommendations

        except Exception as e:
            # Return empty list if AI service fails
            return []

    async def generate_profile_insights(self, student_profile: Dict, conversation_history: Optional[List[Dict]] = None) -> List[ProfileInsight]:
        """Generate insights about student's college readiness and profile"""
        try:
            prompt = f"""
            Analyze this student's college application profile and provide 3-5 insights about their strengths, 
            growth areas, and strategic recommendations.
            
            Student Profile:
            - Academic Interests: {student_profile.get('careerMajor', 'Undecided')}
            - GPA: {student_profile.get('currentGPA', 'Not provided')}
            - Test Scores: SAT {student_profile.get('satScore', 'Not provided')}, ACT {student_profile.get('actScore', 'Not provided')}
            - Extracurriculars: {student_profile.get('extracurriculars', 'Not provided')}
            - Leadership: {student_profile.get('personalLeadership', 'Not provided')}
            - Community Service: {student_profile.get('personalCommunity', 'Not provided')}
            - College Goals: {student_profile.get('collegeGoals', 'Not provided')}
            - Career Aspirations: {student_profile.get('careerAspirations', 'Not provided')}
            
            Provide insights in JSON format with type, title, description, and actionItems for each insight.
            """

            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are a college admissions counselor providing strategic guidance. Respond in JSON format."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                max_tokens=1500
            )

            import json
            result = json.loads(response.choices[0].message.content)
            
            insights = []
            for insight in result.get('insights', []):
                insights.append(ProfileInsight(
                    type=insight.get('type', 'recommendation'),
                    title=insight.get('title', ''),
                    description=insight.get('description', ''),
                    actionItems=insight.get('actionItems', [])
                ))
            
            return insights

        except Exception as e:
            return []

    async def search_colleges(self, query: str, user_profile: Optional[Dict] = None) -> Dict[str, Any]:
        """AI-powered college search with personalized results"""
        try:
            context = f"Search query: {query}"
            if user_profile:
                context += f"\nStudent preferences: {user_profile.get('collegeLocation', '')}, {user_profile.get('collegeSize', '')}"

            prompt = f"""
            Based on this search query and student context, suggest relevant colleges and search strategy.
            
            {context}
            
            Provide a JSON response with colleges array and searchStrategy explanation.
            """

            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are a college search expert. Help students find relevant colleges based on their queries."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                max_tokens=1000
            )

            import json
            return json.loads(response.choices[0].message.content)

        except Exception as e:
            return {"colleges": [], "searchStrategy": "Search temporarily unavailable"}

# Create a global instance
ai_service = AIService()