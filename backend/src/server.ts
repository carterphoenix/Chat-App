import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/authRoutes';
import protectedRoutes from './routes/protectedRoutes';
import { chatHandler } from './controllers/chatController';
import cors from 'cors';
import { register, login } from './controllers/authController';


dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});


// Apply CORS middleware before other middleware and routes
app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from this origin
  methods: ['GET', 'POST'], // Specify allowed methods
  credentials: true, // If you are sending cookies or authentication headers
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend'))); 

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', protectedRoutes);

// Socket.io
io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});
chatHandler(io);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI!)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
