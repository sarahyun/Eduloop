import os
import json
import openai
from typing import Dict, List, Optional
from models import (
    CollegeRecommendations, 
    CollegeRecommendationItem, 
    DistinctiveOpportunity,
    SchoolFit
)
from datetime import datetime
from core.database import BaseRepository

class RecommendationService:
    def __init__(self):
        
        self.client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.responses_repository = BaseRepository("responses")
        
    async def fetch_user_responses_context(self, user_id: str) -> str:
        """
        Fetch all user responses and format them into a context string for the LLM
        """
        try:
            print(f"🔍 Fetching user responses for user_id: {user_id}")
            # Fetch all responses for the user using BaseRepository
            responses = await self.responses_repository.find_many({"user_id": user_id})
            
            print(f"📊 Found {len(responses)} response documents")
            
            if not responses:
                print("⚠️  No responses found, returning default message")
                return "No student profile information available."
            
            # Format responses into a readable context
            context_parts = ["Student Profile Information:\n"]
            
            for response_doc in responses:
                form_id = response_doc.get("form_id", "Unknown Form")
                # Convert form_id back to readable format
                form_name = form_id.replace("_", " ").title()
                context_parts.append(f"\n{form_name}:")
                
                answers = response_doc.get("responses", [])
                print(f"📝 Form '{form_name}' has {len(answers)} answers")
                for answer in answers:
                    question_text = answer.get("question_text", "")
                    answer_text = answer.get("answer", "")
                    if question_text and answer_text:
                        context_parts.append(f"- {question_text}: {answer_text}")
            
            final_context = "\n".join(context_parts)
            print(f"📄 Generated context length: {len(final_context)} characters")
            print(f"📄 Context preview: {final_context[:200]}...")
            return final_context
            
        except Exception as e:
            print(f"❌ Error fetching user responses: {e}")
            return "Error retrieving student profile information."
        
    def load_college_recs_prompt(self) -> str:
        """Load the college recommendations prompt from file"""
        try:
            # Get the correct path relative to the backend directory
            current_dir = os.path.dirname(os.path.abspath(__file__))
            prompt_path = os.path.join(current_dir, '..', 'prompts', 'college_recs_prompt.txt')
            print(f"📁 Looking for prompt file at: {prompt_path}")
            
            with open(prompt_path, 'r') as f:
                content = f.read()
                print(f"📄 Loaded prompt file: {len(content)} characters")
                return content
        except FileNotFoundError as e:
            print(f"❌ Prompt file not found: {e}")
            # Fallback to a basic prompt if file not found
            return """
            You are a college counselor. Based on the student profile below, recommend 9 colleges (3 reach, 3 match, 3 safety).
            
            Student Profile:
            {context}
            
            Provide recommendations in JSON format with the following structure:
            {
                "recommendations": [
                    {
                        "type": "Reach" | "Match" | "Safety",
                        "name": "College Name",
                        "location": "City, State",
                        "fit_score": "1-100",
                        "fit": {
                            "academic": "Good",
                            "social_cultural": "Great", 
                            "financial": "Fair"
                        },
                        "overall_fit_rationale": ["reason 1", "reason 2"],
                        "distinctive_opportunities": [],
                        "potential_challenges": ["challenge 1"],
                        "why_school_essay_points": ["point 1"],
                        "how_to_stand_out": ["tip 1"]
                    }
                ]
            }
            """
    
    def load_web_search_prompt(self) -> str:
        """Load the web search prompt from file"""
        try:
            # Get the correct path relative to the backend directory
            current_dir = os.path.dirname(os.path.abspath(__file__))
            prompt_path = os.path.join(current_dir, '..', 'prompts', 'web_search_prompt.txt')
            print(f"📁 Looking for web search prompt at: {prompt_path}")
            
            with open(prompt_path, 'r') as f:
                content = f.read()
                print(f"📄 Loaded web search prompt: {len(content)} characters")
                return content
        except FileNotFoundError as e:
            print(f"❌ Web search prompt file not found: {e}")
            return """
            Replace the search_query fields in this JSON with actual URLs found via web search.
            For each entry, use the provided search_query to find the most relevant and official program page.
            Prioritize .edu domains and original school websites.
            """

    async def generate_recommendations(self, context: str) -> Dict:
        """
        Step 1: Generate college recommendations using the college_recs_prompt
        Returns the JSON structure with search_query fields
        """
        try:
            print("🤖 Loading college recommendations prompt...")
            college_prompt = self.load_college_recs_prompt()
            
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system", 
                        "content": college_prompt
                    },
                    {
                        "role": "user", 
                        "content": context
                    }
                ],
                response_format={"type": "json_object"},
                max_tokens=10000,
                temperature=0.7
            )
            
            print("✅ Received response from OpenAI")
            raw_content = response.choices[0].message.content
            print(f"📄 Raw OpenAI response length: {len(raw_content)} characters")
            print(f"📄 Raw response preview: {raw_content[:500]}...")
            
            result = json.loads(raw_content)
            print(f"🎯 Parsed JSON successfully, found {len(result.get('recommendations', []))} recommendations")
            
            return result
            
        except Exception as e:
            print(f"❌ Failed to generate recommendations: {str(e)}")
            raise Exception(f"Failed to generate recommendations: {str(e)}")

    async def format_as_json_list(self, web_search_output: str) -> List[Dict]:
        """
        Format web search output as a JSON list of {title, url} pairs
        """
        try:
            print("🔧 Formatting web search output as JSON list...")
            print(f"📄 Input web_search_output: {web_search_output}")
            
            # First, try to parse the output directly as JSON
            try:
                parsed_output = json.loads(web_search_output)
                print(f"📄 Successfully parsed web search output as JSON: {type(parsed_output)}")
                
                # If it's already a dict with 'data' field, extract the data
                if isinstance(parsed_output, dict) and 'data' in parsed_output:
                    data_list = parsed_output['data']
                    print(f"📄 Extracted data list with {len(data_list)} items")
                    return data_list
                # If it's already a list, return it directly
                elif isinstance(parsed_output, list):
                    print(f"📄 Output is already a list with {len(parsed_output)} items")
                    return parsed_output
            except json.JSONDecodeError:
                print("📄 Web search output is not valid JSON, using GPT to format...")
            
            # If direct parsing fails, use GPT to format it
            json_format_prompt = """
            You are a JSON formatting assistant. Take the provided text and convert it to a valid JSON array.
            Do not exclude any information or include any additional information.
            """
            
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system", 
                        "content": json_format_prompt
                    },
                    {
                        "role": "user", 
                        "content": web_search_output
                    }
                ],
                response_format={"type": "json_object"},
                max_tokens=3000,
                temperature=0.1
            )
            
            print("✅ Received JSON formatting response from OpenAI")
            raw_content = response.choices[0].message.content
            print(f"📄 JSON formatted response length: {len(raw_content)} characters")
            
            # Parse the JSON - it might be wrapped in an object
            parsed = json.loads(raw_content)
            print(f"📄 Parsed GPT response: {type(parsed)}")
            
            # If GPT wrapped it in an object, try to extract the array
            if isinstance(parsed, dict):
                # Look for common keys that might contain the array
                for key in ['data', 'results', 'items', 'list']:
                    if key in parsed and isinstance(parsed[key], list):
                        print(f"📄 Found array in '{key}' field")
                        return parsed[key]
                # If no standard key found, return the first list value
                for value in parsed.values():
                    if isinstance(value, list):
                        print(f"📄 Found first list value")
                        return value
            
            # If it's already a list, return it
            if isinstance(parsed, list):
                return parsed
            
            # Fallback: return empty list
            print("⚠️ Could not extract list from parsed response, returning empty list")
            return []
            
        except Exception as e:
            print(f"❌ Failed to format as JSON list: {str(e)}")
            raise Exception(f"Failed to format as JSON list: {str(e)}")

    async def fetch_links_with_web_search(self, recommendations_json: Dict) -> Dict:
        """
        Step 2: Extract distinctive opportunities, use web search to get URLs, and replace in-place
        
        This method performs:
        1. Extract all distinctive_opportunities with search_query fields
        2. Send just the list of {title, search_query} to web search
        3. Get back {title, url} pairs
        4. Replace search_query fields in-place in the original JSON
        """
        try:
            web_search_prompt = self.load_web_search_prompt()
            # Keep original dict for modification
            result_json = recommendations_json.copy()
            
            # Step 1: Extract all distinctive opportunities with search_query
            opportunities_to_search = []
            for rec in result_json.get("recommendations", []):
                for opp in rec.get("distinctive_opportunities", []):
                    if "search_query" in opp:
                        opportunities_to_search.append({
                            "title": opp.get("title", ""),
                            "search_query": opp.get("search_query", "")
                        })
            
            print(f"🔍 Found {len(opportunities_to_search)} opportunities to search for")
            
            if not opportunities_to_search:
                print("ℹ️ No opportunities with search_query found, returning original")
                return result_json
            
            # Step 2: Send just the opportunities list to web search
            opportunities_json_str = json.dumps(opportunities_to_search, indent=2)
            print(f"📤 Sending opportunities to web search: {opportunities_json_str[:200]}...")
            
            response = self.client.responses.create(
                model="gpt-4.1",
                input=[
                    {
                        "role": "system",
                        "content": web_search_prompt
                    },
                    {
                        "role": "user",
                        "content": opportunities_json_str
                    }
                ],
                tools=[{
                    "type": "web_search_preview",
                    "search_context_size": "medium"
                }],
                tool_choice={"type": "web_search_preview"}
            )
            
            print("✅ Received response from OpenAI with web search")
            
            # Step 3: Format the web search output as JSON list of {title, url}
            output_text = response.output_text
            print(output_text)
            
            try:
                url_results = await self.format_as_json_list(output_text)
                print(f"✅ Successfully formatted {len(url_results)} URL results")
            except Exception as e:
                print(f"⚠️ Failed to format web search output as JSON: {e}")
      
            
            # Step 4: Replace search_query fields in-place with URLs
            self._replace_search_queries_with_urls(result_json, url_results)
            
            print("✅ Successfully replaced search queries with URLs in-place")
            return result_json
            
        except Exception as e:
            print(f"❌ Failed to fetch links with web search: {str(e)}")
            # If web search fails, return original with search_query fields removed but keeping original URLs
            for rec in recommendations_json.get("recommendations", []):
                for opp in rec.get("distinctive_opportunities", []):
                    if "search_query" in opp:
                        del opp["search_query"]  # Just remove search_query, keep original URL
            return recommendations_json


    def _replace_search_queries_with_urls(self, recommendations_json: Dict, url_results: List[Dict]):
        """Replace search_query fields with actual URLs from web search results, using original URL as fallback"""
        print(f"🔍 Debug: url_results type: {type(url_results)}")
        print(f"🔍 Debug: url_results length: {len(url_results) if url_results else 0}")
        if url_results:
            print(f"🔍 Debug: First item type: {type(url_results[0])}")
            print(f"🔍 Debug: First item: {url_results[0]}")
        
        # Create a mapping from title to URL for quick lookup
        title_to_url = {}
        for i, result in enumerate(url_results):
            try:
                # Handle case where result might be a string or other type
                if isinstance(result, dict):
                    title = result.get("title", "").strip()
                    url = result.get("url", "")
                elif isinstance(result, str):
                    print(f"⚠️ Warning: url_results[{i}] is a string: {result}")
                    continue
                else:
                    print(f"⚠️ Warning: url_results[{i}] is unexpected type {type(result)}: {result}")
                    continue
                    
                if title and url:
                    title_to_url[title] = url
            except Exception as e:
                print(f"❌ Error processing url_results[{i}]: {e}")
                continue
        
        print(f"📋 Created URL mapping for {len(title_to_url)} titles")
        
        # Replace search_query fields with URLs, using original URL as fallback
        for rec in recommendations_json.get("recommendations", []):
            for opp in rec.get("distinctive_opportunities", []):
                if "search_query" in opp:
                    title = opp.get("title", "").strip()
                    original_url = opp.get("url")  # Store original URL from first LLM
                    
                    if title in title_to_url:
                        # Use web search result if found
                        opp["url"] = title_to_url[title]
                        print(f"✅ Matched '{title}' -> {title_to_url[title]}")
                    else:
                        # Use original URL as fallback if web search didn't find a match
                        if original_url:
                            print(f"📌 Using original URL for '{title}' -> {original_url}")

                    del opp["search_query"]

    def parse_recommendations_to_model(self, recommendations_json: Dict, user_id: str) -> CollegeRecommendations:
        """Convert the JSON response to Pydantic models"""
        try:
            recommendation_items = []
            
            for rec_data in recommendations_json.get("recommendations", []):
                # Parse distinctive opportunities
                opportunities = []
                for opp_data in rec_data.get("distinctive_opportunities", []):
                    opportunities.append(DistinctiveOpportunity(
                        title=opp_data.get("title", ""),
                        description=opp_data.get("description", ""),
                        url=opp_data.get("url"),
                        search_query=opp_data.get("search_query")
                    ))
                
                # Parse school fit
                fit_data = rec_data.get("fit", {})
                school_fit = SchoolFit(
                    academic=fit_data.get("academic", "Good"),
                    social_cultural=fit_data.get("social_cultural", "Good"),
                    financial=fit_data.get("financial", "Good")
                )
                
                # Create recommendation item
                rec_item = CollegeRecommendationItem(
                    type=rec_data.get("type", "Match"),
                    name=rec_data.get("name", ""),
                    location=rec_data.get("location", ""),
                    fit_score=rec_data.get("fit_score", "50"),
                    fit=school_fit,
                    overall_fit_rationale=rec_data.get("overall_fit_rationale", []),
                    distinctive_opportunities=opportunities,
                    potential_challenges=rec_data.get("potential_challenges", []),
                    why_school_essay_points=rec_data.get("why_school_essay_points", []),
                    how_to_stand_out=rec_data.get("how_to_stand_out", [])
                )
                
                recommendation_items.append(rec_item)
            
            return CollegeRecommendations(
                user_id=user_id,
                recommendations=recommendation_items,
                status="completed",
                generation_metadata={
                    "model": "gpt-4o",
                    "prompt_version": "v1.0",
                    "generated_at": datetime.now().isoformat(),
                    "context_source": "user_responses"
                }
            )
            
        except Exception as e:
            raise Exception(f"Failed to parse recommendations: {str(e)}")

    async def generate_full_recommendations(self, user_id: str, context: Optional[str] = None) -> CollegeRecommendations:
        """
        Complete workflow: Automatically fetch user context and generate recommendations
        If context is provided, it will be used instead of fetching from user responses (for testing)
        """
        print(f"🚀 Starting full recommendations generation for user: {user_id}")
        
        # If no context provided, fetch from user responses
        if context is None:
            print("📥 No context provided, fetching from user responses...")
            context = await self.fetch_user_responses_context(user_id)
        else:
            print("📥 Using provided context")
        
        print("⏳ Step 1: Generating recommendations...")
        # Step 1: Generate recommendations
        raw_recommendations = await self.generate_recommendations(context)

        print(f"📄 Raw recommendations: {raw_recommendations}")
        
        print("⏳ Step 2: Fetching links with web search...")
        # Step 2: Extract opportunities, web search for URLs, replace in-place
        recommendations_with_links = await self.fetch_links_with_web_search(raw_recommendations)
        
        print("⏳ Step 3: Parsing to models...")
        # Step 3: Parse to models
        final_recommendations = self.parse_recommendations_to_model(recommendations_with_links, user_id)
        
        print(f"✅ Complete! Generated {len(final_recommendations.recommendations)} recommendations")
        return final_recommendations

# Create a global instance
recommendation_service = RecommendationService() 