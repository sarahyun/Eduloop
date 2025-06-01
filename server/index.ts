import express, { type Request, Response, NextFunction } from "express";
import { createProxyMiddleware } from 'http-proxy-middleware';
import { spawn } from 'child_process';
import { createServer } from 'http';
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// OpenAI configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Session configuration (commented out for now since session is not imported)
// app.use(session({
//   secret: process.env.SESSION_SECRET || 'your-secret-key-here',
//   resave: false,
//   saveUninitialized: false,
//   cookie: {
//     secure: false, // Set to true in production with HTTPS
//     httpOnly: true,
//     maxAge: 24 * 60 * 60 * 1000 // 24 hours
//   }
// }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const oldSend = res.send;
  res.send = function (data) {
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${Date.now() - start}ms`);
    res.send = oldSend;
    return oldSend.apply(res, arguments);
  };
  next();
});

(async () => {
  // Start the FastAPI backend
  let fastApiProcess: any;
  try {
    log("Starting FastAPI backend...");
    fastApiProcess = spawn('python', ['main.py'], {
      cwd: './backend',
      stdio: 'pipe'
    });
    
    fastApiProcess.stdout?.on('data', (data: any) => {
      log(`[FastAPI] ${data.toString().trim()}`);
    });
    
    fastApiProcess.stderr?.on('data', (data: any) => {
      log(`[FastAPI Error] ${data.toString().trim()}`);
    });

    // Wait a moment for FastAPI to start
    await new Promise(resolve => setTimeout(resolve, 2000));
  } catch (error) {
    log(`Failed to start FastAPI backend: ${error}`);
  }

  // Handle auth endpoints directly in Express
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const response = await fetch('http://localhost:8000/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return res.status(response.status).json(data);
      }
      
      res.json(data);
    } catch (error) {
      console.error('Auth signup error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const response = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return res.status(response.status).json(data);
      }
      
      res.json(data);
    } catch (error) {
      console.error('Auth login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/auth/me', async (req, res) => {
    // For now, return a mock user since we're assuming successful signup
    // In a real app, this would check session/token authentication
    res.json({
      id: 1,
      userId: "mock-user-123",
      name: "Test User",
      email: "test@example.com",
      role: "student",
      grade: "12th"
    });
  });

  app.get('/api/profile/:userId', async (req, res) => {
    // Mock profile data for dashboard
    res.json({
      id: 1,
      userId: req.params.userId,
      careerMajor: "Computer Science",
      dreamSchools: "Stanford, MIT",
      gpa: "3.8",
      profileCompletion: 75,
      createdAt: new Date().toISOString()
    });
  });

  app.get('/api/recommendations/:userId', async (req, res) => {
    // Mock college recommendations
    res.json([
      {
        id: 1,
        name: "Stanford University",
        location: "Stanford, CA",
        matchScore: 85,
        category: "reach"
      },
      {
        id: 2,
        name: "UC Berkeley",
        location: "Berkeley, CA", 
        matchScore: 78,
        category: "match"
      }
    ]);
  });

  app.get('/api/saved-colleges/:userId', async (req, res) => {
    // Mock saved colleges
    res.json([]);
  });

  // Helper function to call OpenAI API
  async function callOpenAI(messages: Array<{role: string, content: string}>) {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: messages,
          max_tokens: 500,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }

  // Helper function to generate profile completion response
  function generateProfileCompletionResponse(userInput: string, context: string) {
    // Extract unanswered questions from context
    const questionMatches = context.match(/Question \d+: ([^?]+\?)/g) || [];
    const unansweredQuestions = questionMatches.slice(0, 3); // Limit to first 3 questions
    
    if (unansweredQuestions.length === 0) {
      return "Great! It looks like you've completed this section. Is there anything specific you'd like to discuss about your college planning?";
    }
    
    const questionsText = unansweredQuestions.join('\n');
    
    return `I see you're working on completing your profile. Based on your input "${userInput}", let me help you with the remaining questions in this section:\n\n${questionsText}\n\nWould you like to answer any of these questions? I'm here to help guide you through them.`;
  }

  // Enhanced message handling endpoint
  app.post('/api/messages', async (req: Request, res: Response) => {
    try {
      const { conversationId, role, content } = req.body;
      
      // Check if this is a profile completion context
      const isProfileCompletion = content.includes("CONTEXT: You are a helpful college counselor");
      
      let aiResponse;
      let userMessage = null;
      
      if (isProfileCompletion) {
        // For profile completion, extract the actual user message from context
        const userMessageMatch = content.match(/STUDENT MESSAGE: (.+)$/);
        const actualUserMessage = userMessageMatch ? userMessageMatch[1] : content;
        
        // Create user message with the actual content (not the context)
        userMessage = {
          id: Date.now(),
          conversationId,
          role: 'user',
          content: actualUserMessage,
          createdAt: new Date().toISOString()
        };
        
        // Use OpenAI with the full context for AI response
        try {
          const messages = [
            {
              role: "system",
              content: content // Send the full context as system message
            }
          ];
          
          aiResponse = await callOpenAI(messages);
        } catch (error) {
          console.error('OpenAI error:', error);
          aiResponse = "I'm here to help you complete your profile! What would you like to work on?";
        }
      } else {
        // For regular chat, create normal user message
        userMessage = {
          id: Date.now(),
          conversationId,
          role,
          content,
          createdAt: new Date().toISOString()
        };
        
        // Use OpenAI for regular chat
        try {
          const messages = [
            {
              role: "system",
              content: "You are a helpful college counselor assistant. Provide guidance on college planning, applications, and academic decisions."
            },
            {
              role: "user",
              content: content
            }
          ];
          
          aiResponse = await callOpenAI(messages);
        } catch (error) {
          console.error('OpenAI error:', error);
          aiResponse = "I'm sorry, I'm having trouble connecting to my AI service right now. Please try again in a moment.";
        }
      }
      
      // Create AI message
      const aiMessage = {
        id: Date.now() + 1,
        conversationId,
        role: 'assistant',
        content: aiResponse,
        createdAt: new Date().toISOString()
      };
      
      res.json({
        userMessage,
        aiMessage
      });
    } catch (error) {
      console.error('Message handling error:', error);
      res.status(500).json({ error: 'Failed to process message' });
    }
  });

  // Get conversations for a user (updated to handle string userId)
  app.get('/api/conversations/:userId', (req: Request, res: Response) => {
    const { userId } = req.params;
    
    // Mock conversation data with string userId
    const conversations = [
      {
        id: 1,
        userId: userId, // Now a string
        title: 'College Planning Discussion',
        lastMessage: 'How can I improve my college application?',
        timestamp: new Date().toISOString()
      },
      {
        id: 2,
        userId: userId, // Now a string
        title: 'Profile Completion Help',
        lastMessage: 'Let me help you complete your profile.',
        timestamp: new Date().toISOString()
      }
    ];
    
    res.json(conversations);
  });

  // Create new conversation (updated to handle string userId)
  app.post('/api/conversations', (req: Request, res: Response) => {
    const { userId, title } = req.body;
    
    const newConversation = {
      id: Date.now(),
      userId: userId, // Now a string
      title: title || 'New Conversation',
      lastMessage: '',
      timestamp: new Date().toISOString()
    };
    
    res.json(newConversation);
  });

  // Get messages for a conversation
  app.get('/api/messages/:conversationId', (req: Request, res: Response) => {
    const { conversationId } = req.params;
    
    // Mock messages data - filter out any context messages
    const allMessages = [
      {
        id: 1,
        conversationId: parseInt(conversationId),
        role: 'assistant',
        content: 'Hello! I\'m here to help you with your college planning. How can I assist you today?',
        createdAt: new Date().toISOString()
      }
    ];
    
    // Filter out context messages before returning
    const messages = allMessages.filter(message => {
      if (message.role === 'user' && message.content.includes('CONTEXT: You are a helpful college counselor')) {
        return false;
      }
      return true;
    });
    
    res.json(messages);
  });

  // Proxy other API requests to FastAPI backend
  app.use('/api', createProxyMiddleware({
    target: 'http://localhost:8000',
    changeOrigin: true,
    pathRewrite: {
      '^/api': '',
    },
    timeout: 10000,
    proxyTimeout: 10000,
    onError: (err, req, res) => {
      console.error('Proxy error:', err);
      res.status(500).json({ error: 'Proxy error' });
    }
  }));

  const server = createServer(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
