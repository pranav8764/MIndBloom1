require("dotenv").config();
const express = require("express");
const http = require("http");
const { connect } = require("mongoose");
const cors = require("cors");
const { clerkMiddleware } = require("@clerk/express");
const rateLimit = require("express-rate-limit");

// Import routes
const userRoutes = require("./routes/userRoutes");
const journalRoutes = require("./routes/journalRoutes");
const habitRoutes = require("./routes/habitRoutes");
const achievementRoutes = require("./routes/achievementRoutes");
const challengeRoutes = require("./routes/challengeRoutes");

// Import socket configuration
const initSockets = require("./sockets/index");

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = initSockets(server);

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-production-domain.com'] 
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per window
  message: { message: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Test endpoints for rate limiting (before Clerk middleware)
// These simulate login/register endpoints for rate limiting testing
app.post("/api/auth/test-login", authLimiter, (req, res) => {
  res.status(200).json({ 
    message: "Rate limiting test endpoint - simulates login",
    timestamp: new Date().toISOString()
  });
});

app.post("/api/auth/test-register", authLimiter, (req, res) => {
  res.status(200).json({ 
    message: "Rate limiting test endpoint - simulates register",
    timestamp: new Date().toISOString()
  });
});

// Apply Clerk middleware after test endpoints
app.use(clerkMiddleware());

// Connect to MongoDB - Use MONGODB_URI from environment
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
if (!mongoUri) {
  console.error("❌ No MongoDB URI found in environment variables");
  process.exit(1);
}

connect(mongoUri)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    console.error("Make sure your MONGODB_URI is correct and accessible");
    process.exit(1);
  });

// Routes
app.use("/api/auth", userRoutes);
app.use("/api/journal", journalRoutes);
app.use("/api/habits", habitRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/challenges", challengeRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test endpoint for rate limiting (simulates login endpoint)
app.post("/api/auth/login", authLimiter, (req, res) => {
  // This is a test endpoint to demonstrate rate limiting
  // Actual authentication is handled by Clerk
  res.status(200).json({ 
    message: "This endpoint is rate-limited. Actual auth is handled by Clerk.",
    timestamp: new Date().toISOString()
  });
});

// Test endpoint for rate limiting (simulates register endpoint)
app.post("/api/auth/register", authLimiter, (req, res) => {
  // This is a test endpoint to demonstrate rate limiting
  // Actual authentication is handled by Clerk
  res.status(200).json({ 
    message: "This endpoint is rate-limited. Actual auth is handled by Clerk.",
    timestamp: new Date().toISOString()
  });
});

// 404 handler for API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({ message: "API endpoint not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  res.status(500).json({ 
    message: "Internal server error",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.io initialized`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
