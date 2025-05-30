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
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

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
          ...context.conversationHistory.map(msg => ({ role: msg.role as 'user' | 'assistant', content: msg.content }))
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

  async reRankRecommendations(
    studentProfile: any, 
    conversationHistory: Array<{ role: string; content: string }>,
    userFeedback: Array<{ collegeId: number; action: 'saved' | 'dismissed' | 'clicked'; timestamp: Date }>,
    currentRecommendations: any[]
  ): Promise<CollegeRecommendation[]> {
    try {
      const systemPrompt = `You are an expert college recommendation engine that learns from student feedback and conversations. 
      
      Your task is to re-rank and refine college recommendations based on:
      1. Student's evolving profile and interests revealed through conversations
      2. User feedback patterns (saves, dismissals, clicks)
      3. Conversation context and newly discovered preferences
      4. Implicit signals about what matters most to the student

      Student Profile: ${JSON.stringify(studentProfile)}
      
      Recent Conversation Context: ${conversationHistory.slice(-10).map(msg => `${msg.role}: ${msg.content}`).join('\n')}
      
      User Feedback Patterns: ${JSON.stringify(userFeedback)}
      
      Current Recommendations: ${JSON.stringify(currentRecommendations)}
      
      Instructions:
      - Analyze conversation for emerging interests, values, and priorities
      - Learn from feedback patterns (what they save vs dismiss)
      - Adjust match scores based on new insights
      - Provide updated reasoning that reflects learning
      - Include confidence scores and learning factors
      - Respond with JSON array of recommendations
      
      Response format:
      {
        "recommendations": [
          {
            "name": "College Name",
            "matchScore": 85,
            "reasoning": "Updated reasoning based on conversation insights",
            "category": "match",
            "highlights": ["Key selling points"],
            "confidenceScore": 0.92,
            "learningFactors": ["What we learned that improved this match"]
          }
        ]
      }`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: systemPrompt }],
        response_format: { type: "json_object" },
        max_tokens: 2000,
      });

      const result = JSON.parse(response.choices[0].message.content || '{"recommendations": []}');
      return result.recommendations || [];
    } catch (error) {
      console.error('Error re-ranking recommendations:', error);
      throw new Error("Failed to re-rank recommendations");
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

  async generateOnboardingResponse(context: {
    userMessage: string;
    section?: string;
    conversationHistory: Array<{ role: string; content: string }>;
    questions: Array<{ id: string; question: string }>;
  }): Promise<{
    response: string;
    isComplete: boolean;
    profileUpdates?: Record<string, string>;
  }> {
    try {
      const { userMessage, section, conversationHistory, questions } = context;
      
      // Debug logging
      console.log('OpenAI context:', { userMessage, section, questions: questions || 'undefined', conversationHistory: conversationHistory || 'undefined' });
      
      // Build context about the current section and questions
      const sectionContext = section ? `
Current section: ${section}
Questions for this section:
${questions && Array.isArray(questions) ? questions.map(q => `- ${q.question}`).join('\n') : 'No questions defined'}
` : '';


      
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a friendly college counselor having a conversation with a student to build their profile. 

${sectionContext}

Guidelines:
- Work through the questions in the order they are listed
- After each user response, move to the next question in the sequence
- Keep responses brief and conversational
- Don't ask excessive follow-up questions
- Extract key information for the profile
- Return response in JSON format: {"response": "your response", "isComplete": boolean, "profileUpdates": {questionId: "extracted answer"}}

Conversation history:
${conversationHistory ? conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n') : 'No previous conversation'}`
          },
          {
            role: "user",
            content: userMessage
          }
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(completion.choices[0].message.content || '{"response": "Could you tell me more?", "isComplete": false, "profileUpdates": {}}');
      
      return {
        response: result.response || "I'd love to learn more about you.",
        isComplete: result.isComplete || false,
        profileUpdates: result.profileUpdates || {}
      };
    } catch (error) {
      console.error('Error generating onboarding response:', error);
      return {
        response: "I'm having trouble processing that. Could you try rephrasing your response?",
        isComplete: false
      };
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
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: "You are a helpful college counselor assistant that generates thoughtful follow-up questions. Always respond with valid JSON containing a 'questions' array." },
          { role: "user", content: prompt }
        ],
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
  confidenceScore: number;
  learningFactors: string[];
}

export const aiService = new AIService();
