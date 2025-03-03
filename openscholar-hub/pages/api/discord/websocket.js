// @/pages/api/discord/websocket.js
import { Server } from 'socket.io';
import { withApiAuthWs } from '@/utils/apiMiddleware';
import discordService from '@/utils/discordService';

const SocketHandler = (req, res) => {
  if (res.socket.server.io) {
    console.log('Socket is already running');
    res.end();
    return;
  }
  
  console.log('Setting up socket');
  const io = new Server(res.socket.server);
  res.socket.server.io = io;
  
  io.on('connection', (socket) => {
    console.log('Client connected');
    
    socket.on('join-channel', (channelId) => {
      socket.join(channelId);
    });
    
    socket.on('leave-channel', (channelId) => {
      socket.leave(channelId);
    });
    
    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });
  
  // Set up Discord message listener
  discordService.client.on('messageCreate', (message) => {
    // Forward Discord messages to connected clients
    io.to(message.channelId).emit('new-message', {
      id: message.id,
      content: message.content,
      author: {
        id: message.author.id,
        username: message.author.username,
        avatar: message.author.displayAvatarURL()
      },
      timestamp: message.createdTimestamp,
      attachments: Array.from(message.attachments.values())
    });
  });
  
  res.end();
};

export default withApiAuthWs(SocketHandler);