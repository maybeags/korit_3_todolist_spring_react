import { Router } from 'express';
import { sendMessage, getChatHistory, getUserChatRooms } from '../controllers/chatController';

const router = Router();

router.post('/chat/messages', sendMessage);
router.get('/chat/messages/:productId/:user1Id/:user2Id', getChatHistory);
router.get('/chats/:userId', getUserChatRooms);

export default router;
