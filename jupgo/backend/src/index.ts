import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import swaggerUi from 'swagger-ui-express';
import specs from './swagger';

import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import productRoutes from './routes/productRoutes';
import chatRoutes from './routes/chatRoutes';
import categoryRoutes from './routes/categoryRoutes'; // Add this line
import { authenticateToken } from './middleware/authMiddleware';
import { setIoInstance } from './controllers/chatController';
import { errorHandler } from './middleware/errorHandler';
import { env } from './config/env'; // Import env configuration

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Pass the io instance to the chat controller
setIoInstance(io);

const PORT = env.PORT; // Use PORT from env

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads')); // Serve static files
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('joinRoom', (chatId) => {
    if(chatId) {
      socket.join(chatId.toString());
      console.log(`User ${socket.id} joined room ${chatId}`);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Public routes
app.use('/api', authRoutes);
app.use('/api', categoryRoutes); // Add this line

// Protected routes
app.use('/api', authenticateToken, userRoutes);
app.use('/api', authenticateToken, productRoutes);
app.use('/api', authenticateToken, chatRoutes);

// Error handling middleware
app.use(errorHandler);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});