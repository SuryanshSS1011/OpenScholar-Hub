import type { NextApiRequest, NextApiResponse } from 'next';
import { Server as SocketIOServer } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import type { Socket as NetSocket } from 'net';

interface SocketServer extends HTTPServer {
  io?: SocketIOServer | undefined;
}

interface SocketWithIO extends NetSocket {
  server: SocketServer;
}

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponseWithSocket
) {
  if (res.socket.server.io) {
    console.log('Socket is already running');
  } else {
    console.log('Socket is initializing');
    const io = new SocketIOServer(res.socket.server);
    res.socket.server.io = io;

    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      socket.on('join_channel', (channelId: string) => {
        socket.join(channelId);
        console.log(`User ${socket.id} joined channel ${channelId}`);
      });

      socket.on('leave_channel', (channelId: string) => {
        socket.leave(channelId);
        console.log(`User ${socket.id} left channel ${channelId}`);
      });

      socket.on('send_message', (data: { channelId: string; message: string; user: string }) => {
        socket.to(data.channelId).emit('new_message', {
          message: data.message,
          user: data.user,
          timestamp: new Date().toISOString(),
        });
      });

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    });
  }
  res.end();
}
