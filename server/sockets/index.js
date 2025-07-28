const { Server } = require('socket.io');

function initSockets(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    // Join challenge room
    socket.on('join-room', ({ roomId }) => {
      socket.join(roomId);
      socket.to(roomId).emit('user-joined', { socketId: socket.id });
    });

    // Chat message
    socket.on('chat', ({ roomId, message, user }) => {
      io.to(roomId).emit('chat', { message, user, timestamp: Date.now() });
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });

  return io;
}

module.exports = initSockets;
