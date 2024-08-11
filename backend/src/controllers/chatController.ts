import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { Message } from '../models/Message'; // Import the Message model

// Extend Socket interface to include user property
interface AuthenticatedSocket extends Socket {
  user?: string;
  username?: string; // Add username property
}

// In-memory store for user IDs to usernames
const usernames: Record<string, string> = {};

export function chatHandler(io: Server) {
  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log('A user connected');

    // Authenticate user
    socket.on('authenticate', (data: { token: string }) => {
      try {
        const decoded = jwt.verify(data.token, process.env.JWT_SECRET!) as { id: string, username: string };
        socket.user = decoded.id;
        socket.username = decoded.username;
        usernames[socket.user] = socket.username; // Store username
        console.log('User authenticated:', socket.username);
      } catch (err) {
        console.log('Authentication error:', err);
        socket.disconnect(); // Disconnect user if authentication fails
      }
    });

    // Handle sending messages
    socket.on('sendMessage', async (data: { room: string, message: string }) => {
      if (socket.user) {
        // Save message to database
        const newMessage = new Message({
          room: data.room,
          sender: socket.username,
          message: data.message,
        });
        await newMessage.save();

        io.to(data.room).emit('message', { sender: socket.username, message: data.message });
      } else {
        console.log('User not authenticated');
      }
    });

    // Handle joining rooms
    socket.on('joinRoom', (room: string) => {
      socket.join(room);
      console.log(`User ${socket.username} joined room: ${room}`);
      
      // Send previous messages to user
      Message.find({ room }).sort({ timestamp: 1 }).then(messages => {
        socket.emit('previousMessages', messages);
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('A user disconnected');
      // Optionally, remove user from usernames mapping
    });
  });
}
