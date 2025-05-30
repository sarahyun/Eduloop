import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { aiService } from "./openai";
import { 
  insertUserSchema,
  insertStudentProfileSchema,
  insertConversationSchema,
  insertMessageSchema,
  insertSavedCollegeSchema,
  insertSearchQuerySchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(userData.email);
      
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const user = await storage.createUser(userData);
      res.json({ user: { id: user.id, username: user.username, email: user.email, fullName: user.fullName } });
    } catch (error) {
      res.status(400).json({ message: "Invalid user data", error: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      res.json({ user: { id: user.id, username: user.username, email: user.email, fullName: user.fullName } });
    } catch (error) {
      res.status(500).json({ message: "Login failed", error: error.message });
    }
  });

  // Student profile routes
  app.get("/api/profile/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const profile = await storage.getStudentProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch profile", error: error.message });
    }
  });

  app.post("/api/profile", async (req, res) => {
    try {
      const profileData = insertStudentProfileSchema.parse(req.body);
      const profile = await storage.createStudentProfile(profileData);
      res.json(profile);
    } catch (error) {
      res.status(400).json({ message: "Invalid profile data", error: error.message });
    }
  });

  app.put("/api/profile/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const updates = req.body;
      const profile = await storage.updateStudentProfile(userId, updates);
      res.json(profile);
    } catch (error) {
      res.status(400).json({ message: "Failed to update profile", error: error.message });
    }
  });

  // Update specific form answer
  app.patch("/api/profile/:userId/answer", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { questionId, answer } = req.body;
      
      if (!questionId || answer === undefined) {
        return res.status(400).json({ message: "questionId and answer are required" });
      }

      const updates = { [questionId]: answer };
      const updatedProfile = await storage.updateStudentProfile(userId, updates);
      res.json(updatedProfile);
    } catch (error) {
      res.status(400).json({ message: "Failed to update answer", error: error.message });
    }
  });

  // Chat onboarding with OpenAI
  app.post("/api/chat/onboarding", async (req, res) => {
    try {
      const { message, section, conversationHistory, questions } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      // Generate AI response using OpenAI
      const aiResponse = await aiService.generateOnboardingResponse({
        userMessage: message,
        section,
        conversationHistory,
        questions
      });

      res.json(aiResponse);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate response", error: error.message });
    }
  });

  // College routes
  app.get("/api/colleges", async (req, res) => {
    try {
      const colleges = await storage.getColleges();
      res.json(colleges);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch colleges", error: error.message });
    }
  });

  app.get("/api/colleges/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: "Query parameter 'q' is required" });
      }

      const colleges = await storage.searchColleges(q);
      res.json(colleges);
    } catch (error) {
      res.status(500).json({ message: "Search failed", error: error.message });
    }
  });

  // AI-powered college search
  app.post("/api/colleges/ai-search", async (req, res) => {
    try {
      const { query, userId } = req.body;
      if (!query) {
        return res.status(400).json({ message: "Query is required" });
      }

      // Get user profile for personalized search
      let userProfile = null;
      if (userId) {
        userProfile = await storage.getStudentProfile(userId);
      }

      const searchResult = await aiService.searchColleges(query, userProfile);
      
      // Save search query for history
      if (userId) {
        await storage.createSearchQuery({
          userId,
          query,
          results: searchResult
        });
      }

      res.json(searchResult);
    } catch (error) {
      res.status(500).json({ message: "AI search failed", error: error.message });
    }
  });

  // Conversation routes
  app.get("/api/conversations/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const conversations = await storage.getUserConversations(userId);
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conversations", error: error.message });
    }
  });

  app.post("/api/conversations", async (req, res) => {
    try {
      const conversationData = insertConversationSchema.parse(req.body);
      const conversation = await storage.createConversation(conversationData);
      res.json(conversation);
    } catch (error) {
      res.status(400).json({ message: "Invalid conversation data", error: error.message });
    }
  });

  app.get("/api/conversations/:conversationId/messages", async (req, res) => {
    try {
      const conversationId = parseInt(req.params.conversationId);
      const messages = await storage.getConversationMessages(conversationId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages", error: error.message });
    }
  });

  app.post("/api/conversations/:conversationId/messages", async (req, res) => {
    try {
      const conversationId = parseInt(req.params.conversationId);
      const messageData = insertMessageSchema.parse({
        ...req.body,
        conversationId
      });

      // Save user message
      const userMessage = await storage.createMessage(messageData);

      // Generate AI response if the message is from a user
      if (messageData.role === 'user') {
        // Get conversation history
        const messages = await storage.getConversationMessages(conversationId);
        const conversation = await storage.getConversation(conversationId);
        
        // Get user profile for context
        let userProfile = null;
        if (conversation?.userId) {
          userProfile = await storage.getStudentProfile(conversation.userId);
        }

        const conversationHistory = messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }));

        const context = {
          userId: conversation?.userId || 0,
          studentProfile: userProfile,
          conversationHistory
        };

        const aiResponse = await aiService.generateMentorResponse(context);

        // Save AI response
        const aiMessage = await storage.createMessage({
          conversationId,
          role: 'assistant',
          content: aiResponse
        });

        // Update conversation timestamp
        await storage.updateConversation(conversationId, {
          updatedAt: new Date()
        });

        res.json({ userMessage, aiMessage });
      } else {
        res.json({ userMessage });
      }
    } catch (error) {
      res.status(400).json({ message: "Failed to create message", error: error.message });
    }
  });

  // Recommendations routes
  app.get("/api/recommendations/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const recommendations = await storage.getUserRecommendations(userId);
      
      // Fetch college details for each recommendation
      const recommendationsWithDetails = await Promise.all(
        recommendations.map(async (rec) => {
          const college = await storage.getCollege(rec.collegeId);
          return {
            ...rec,
            college
          };
        })
      );

      res.json(recommendationsWithDetails);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recommendations", error: error.message });
    }
  });

  app.post("/api/recommendations/generate", async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const profile = await storage.getStudentProfile(userId);
      if (!profile) {
        return res.status(404).json({ message: "Student profile not found" });
      }

      const recommendations = await aiService.generateCollegeRecommendations(profile);
      
      // Match recommendations with actual colleges and save them
      const colleges = await storage.getColleges();
      const savedRecommendations = [];

      for (const rec of recommendations) {
        const college = colleges.find(c => 
          c.name.toLowerCase().includes(rec.name.toLowerCase()) ||
          rec.name.toLowerCase().includes(c.name.toLowerCase())
        );

        if (college) {
          const saved = await storage.createRecommendation({
            userId,
            collegeId: college.id,
            matchScore: rec.matchScore,
            reasoning: rec.reasoning,
            category: rec.category
          });
          savedRecommendations.push({
            ...saved,
            college
          });
        }
      }

      res.json(savedRecommendations);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate recommendations", error: error.message });
    }
  });

  // Saved colleges routes
  app.get("/api/saved-colleges/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const savedColleges = await storage.getUserSavedColleges(userId);
      
      const savedWithDetails = await Promise.all(
        savedColleges.map(async (saved) => {
          const college = await storage.getCollege(saved.collegeId);
          return {
            ...saved,
            college
          };
        })
      );

      res.json(savedWithDetails);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch saved colleges", error: error.message });
    }
  });

  app.post("/api/saved-colleges", async (req, res) => {
    try {
      const savedCollegeData = insertSavedCollegeSchema.parse(req.body);
      const savedCollege = await storage.createSavedCollege(savedCollegeData);
      res.json(savedCollege);
    } catch (error) {
      res.status(400).json({ message: "Failed to save college", error: error.message });
    }
  });

  app.delete("/api/saved-colleges/:userId/:collegeId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const collegeId = parseInt(req.params.collegeId);
      await storage.deleteSavedCollege(userId, collegeId);
      res.json({ message: "College removed from saved list" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove saved college", error: error.message });
    }
  });

  // Insights routes
  app.post("/api/insights/generate", async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const profile = await storage.getStudentProfile(userId);
      if (!profile) {
        return res.status(404).json({ message: "Student profile not found" });
      }

      // Get recent conversation history for additional context
      const conversations = await storage.getUserConversations(userId);
      const recentMessages = [];
      
      if (conversations.length > 0) {
        const latestConversation = conversations[0];
        const messages = await storage.getConversationMessages(latestConversation.id);
        recentMessages.push(...messages.slice(-10).map(msg => ({
          role: msg.role,
          content: msg.content
        })));
      }

      const insights = await aiService.generateProfileInsights(profile, recentMessages);
      res.json(insights);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate insights", error: error.message });
    }
  });

  // Generate follow-up questions
  app.post("/api/generate-followup-questions", async (req, res) => {
    try {
      const { stepId, response, previousResponses } = req.body;
      
      if (!response || response.length < 20) {
        return res.json({ questions: [] });
      }

      const questions = await aiService.generateFollowUpQuestions(stepId, response, previousResponses);
      res.json({ questions });
    } catch (error) {
      console.error(`Error generating follow-up questions:`, error);
      res.status(500).json({ error: "Failed to generate follow-up questions" });
    }
  });

  // Search history
  app.get("/api/search-history/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const searchHistory = await storage.getUserSearchHistory(userId);
      res.json(searchHistory);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch search history", error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
