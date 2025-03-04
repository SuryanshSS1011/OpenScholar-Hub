// @/pages/api/socketio.js
import { Server } from 'socket.io';

const ioHandler = (req, res) => {
  if (!res.socket.server.io) {
    console.log('Initializing Socket.io server...');
    const io = new Server(res.socket.server);
    
    // Socket.io event handlers
    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);
      
      // Channel subscription
      socket.on('join_channel', (channelId) => {
        console.log(`Socket ${socket.id} joining channel: ${channelId}`);
        socket.join(`channel_${channelId}`);
      });
      
      // Leave channel
      socket.on('leave_channel', (channelId) => {
        console.log(`Socket ${socket.id} leaving channel: ${channelId}`);
        socket.leave(`channel_${channelId}`);
      });
      
      // Typing indicator
      socket.on('user_typing', ({ channel, user }) => {
        console.log(`User ${user} typing in channel ${channel}`);
        socket.to(`channel_${channel}`).emit('user_typing', { channel, user });
      });
      
      // Disconnect event
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
    
    res.socket.server.io = io;
  }
  
  res.end();
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default ioHandler;