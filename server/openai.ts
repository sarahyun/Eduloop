import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface ConversationContext {
  userId: number;
  studentProfile?: any;
  conversationHistory: Array<{ role: string; content: string }>;
  currentTopic?: string;
}

export interface CollegeSearchResult {
  colleges: Array<{
    id: number;
    name: string;
    matchScore: number;
    reasoning: string;
    category: 'reach' | 'match' | 'safety';
  }>;
  searchStrategy: string;
}

export interface ProfileInsight {
  type: 'strength' | 'growth_area' | 'recommendation' | 'strategy';
  title: string;
  description: string;
  actionItems: string[];
}

export class AIService {
  async generateMentorResponse(context: ConversationContext): Promise<string> {
    try {
      const systemPrompt = `You are an expert college counselor and AI mentor. You have deep knowledge about colleges, admissions, student development, and career guidance. Your role is to:

1. Provide personalized, thoughtful advice based on the student's profile and conversation history
2. Ask follow-up questions to better understand the student's interests and goals
3. Suggest specific colleges, programs, and opportunities that align with their profile
4. Help students reflect on their values, interests, and aspirations
5. Be encouraging, supportive, and authentic in your communication style

Student Context:
- User ID: ${context.userId}
- Profile: ${JSON.stringify(context.studentProfile || {})}
- Current Topic: ${context.currentTopic || 'General conversation'}

Guidelines:
- Keep responses conversational and engaging (2-3 sentences typically)
- Ask thoughtful follow-up questions when appropriate
- Reference specific colleges, programs, or opportunities when relevant
- Be encouraging and supportive while being realistic
- Help students discover new interests and possibilities`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          ...context.conversationHistory
        ],
        max_tokens: 300,
      });

      return response.choices[0].message.content || "I'm here to help you with your college journey! What would you like to explore?";
    } catch (error) {
      console.error('Error generating mentor response:', error);
      throw new Error("Sorry, I'm having trouble responding right now. Please try again.");
    }
  }

  async searchColleges(query: string, userProfile?: any): Promise<CollegeSearchResult> {
    try {
      const systemPrompt = `You are an expert college search engine that understands natural language queries about colleges and universities. Analyze the search query and user profile to recommend relevant colleges.

User Profile: ${JSON.stringify(userProfile || {})}

Based on the search query, provide a structured response with college recommendations. Consider factors like:
- Academic programs and strengths
- Campus culture and environment
- Location preferences
- Size and setting
- Selectivity and fit
- Special programs or opportunities

Return your response in this exact JSON format:
{
  "colleges": [
    {
      "name": "College Name",
      "matchScore": 85,
      "reasoning": "Specific reasons why this college matches the query",
      "category": "reach|match|safety"
    }
  ],
  "searchStrategy": "Brief explanation of the search approach and criteria used"
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: query }
        ],
        response_format: { type: "json_object" },
      });

      return JSON.parse(response.choices[0].message.content || '{"colleges": [], "searchStrategy": "Unable to process search"}');
    } catch (error) {
      console.error('Error searching colleges:', error);
      throw new Error("Sorry, I couldn't process your search. Please try rephrasing your query.");
    }
  }

  async generateProfileInsights(studentProfile: any, conversationHistory?: Array<{ role: string; content: string }>): Promise<ProfileInsight[]> {
    try {
      const systemPrompt = `You are an expert college counselor analyzing a student's profile and conversation history to provide actionable insights. Generate specific, personalized insights that will help the student strengthen their college applications and personal development.

Student Profile: ${JSON.stringify(studentProfile)}
Recent Conversations: ${JSON.stringify(conversationHistory || [])}

Provide insights in these categories:
1. Strengths - What the student does well
2. Growth Areas - Areas for improvement or development  
3. Recommendations - Specific actions they should take
4. Strategy - Application and positioning advice

Return your response in this exact JSON format:
{
  "insights": [
    {
      "type": "strength|growth_area|recommendation|strategy",
      "title": "Brief insight title",
      "description": "Detailed explanation of the insight",
      "actionItems": ["Specific action 1", "Specific action 2"]
    }
  ]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Generate personalized insights for this student profile." }
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || '{"insights": []}');
      return result.insights || [];
    } catch (error) {
      console.error('Error generating profile insights:', error);
      throw new Error("Unable to generate insights at this time.");
    }
  }

  async generateCollegeRecommendations(studentProfile: any): Promise<CollegeRecommendation[]> {
    try {
      const systemPrompt = `You are an expert college counselor providing personalized college recommendations. Based on the student's profile, suggest colleges that would be excellent fits across reach, match, and safety categories.

Student Profile: ${JSON.stringify(studentProfile)}

Consider these factors:
- Academic interests and strengths
- GPA and test scores
- Extracurricular activities and leadership
- Values and preferences
- Career goals
- Location and setting preferences

Recommend a diverse mix of colleges with specific reasoning for each. Return your response in this exact JSON format:
{
  "recommendations": [
    {
      "name": "College Name",
      "matchScore": 85,
      "reasoning": "Detailed explanation of why this college fits the student",
      "category": "reach|match|safety",
      "highlights": ["Key strength 1", "Key strength 2", "Key strength 3"]
    }
  ]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Generate personalized college recommendations for this student." }
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || '{"recommendations": []}');
      return result.recommendations || [];
    } catch (error) {
      console.error('Error generating college recommendations:', error);
      throw new Error("Unable to generate recommendations at this time.");
    }
  }

  async generateFollowUpQuestions(stepId: string, response: string, previousResponses: any): Promise<string[]> {
    const contextMap: { [key: string]: string } = {
      careerMajor: "the student's career and major interests",
      dreamSchools: "the student's thoughts on specific colleges",
      freeTime: "how the student spends their free time and hobbies",
      collegeExperience: "what the student wants from college and their concerns",
      extracurriculars: "the student's activities and achievements"
    };

    const context = contextMap[stepId] || "the student's response";
    
    const prompt = `Based on ${context}, generate 1-2 thoughtful follow-up questions that would help understand the student better for college recommendations. 

Student's response: "${response}"

Previous responses context: ${JSON.stringify(previousResponses)}

Generate questions that:
- Are specific and personal
- Help reveal deeper motivations or interests
- Are conversational and supportive
- Avoid being repetitive of what they already shared
- Would be useful for college matching

Respond with a JSON array of questions (maximum 2).`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 300,
      });

      const result = JSON.parse(completion.choices[0].message.content || "{}");
      return result.questions || [];
    } catch (error) {
      console.error("Error generating follow-up questions:", error);
      return [];
    }
  }
}

export interface CollegeRecommendation {
  name: string;
  matchScore: number;
  reasoning: string;
  category: 'reach' | 'match' | 'safety';
  highlights: string[];
}

export const aiService = new AIService();
