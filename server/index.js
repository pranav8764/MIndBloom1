require("dotenv").config();
const express = require("express");
const http = require("http");
const { connect } = require("mongoose");
const cors = require("cors");

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

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.io initialized`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
