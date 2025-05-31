import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import { createProxyMiddleware } from 'http-proxy-middleware';
import { spawn } from 'child_process';
import { createServer } from 'http';
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-here',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

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
