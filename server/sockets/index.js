const { Server } = require('socket.io');
const { createClerkClient } = require('@clerk/clerk-sdk-node');
const User = require('../models/User');

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

function initSockets(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      // Extract token from handshake auth or authorization header
      const token = socket.handshake.auth?.token || 
                    socket.handshake.headers?.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return next(new Error('Authentication required'));
      }

      // Verify token with Clerk
      const session = await clerkClient.sessions.verifySession(token, token);
      
      if (!session || !session.userId) {
        return next(new Error('Invalid token'));
      }

      // Find user in MongoDB
      const user = await User.findOne({ clerkId: session.userId })
        .select('_id username firstName lastName avatar');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      // Attach user to socket
      socket.user = user;
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id, 'User:', socket.user.username);

    // Join challenge room
    socket.on('join-room', ({ roomId }) => {
      socket.join(roomId);
      socket.to(roomId).emit('user-joined', { 
        socketId: socket.id,
        username: socket.user.username 
      });
    });

    // Chat message
    socket.on('chat', ({ roomId, message }) => {
      io.to(roomId).emit('chat', { 
        message, 
        user: socket.user.username,
        userId: socket.user._id,
        timestamp: Date.now() 
      });
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });

  return io;
}

module.exports = initSockets;
