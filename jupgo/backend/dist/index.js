"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const chatRoutes_1 = __importDefault(require("./routes/chatRoutes"));
const authMiddleware_1 = require("./middleware/authMiddleware");
const chatController_1 = require("./controllers/chatController");
const errorHandler_1 = require("./middleware/errorHandler");
const env_1 = require("./config/env"); // Import env configuration
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
// Pass the io instance to the chat controller
(0, chatController_1.setIoInstance)(io);
const PORT = env_1.env.PORT; // Use PORT from env
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    socket.on('joinRoom', (chatId) => {
        if (chatId) {
            socket.join(chatId.toString());
            console.log(`User ${socket.id} joined room ${chatId}`);
        }
    });
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});
// Public routes
app.use('/api', authRoutes_1.default);
// Protected routes
app.use('/api', authMiddleware_1.authenticateToken, userRoutes_1.default);
app.use('/api', authMiddleware_1.authenticateToken, productRoutes_1.default);
app.use('/api', authMiddleware_1.authenticateToken, chatRoutes_1.default);
// Error handling middleware
app.use(errorHandler_1.errorHandler);
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
