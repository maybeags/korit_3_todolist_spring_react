import { Router } from 'express';
import { sendMessage, getUserChatRooms, getMessagesByChatId, getChatHistory, deleteChatRoom } from '../controllers/chatController';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: Chat messaging and room management
 */

/**
 * @swagger
 * /chat/messages:
 *   post:
 *     summary: Send a chat message
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - senderId
 *               - receiverId
 *               - content
 *             properties:
 *               productId:
 *                 type: string
 *                 description: ID of the product related to the chat
 *               senderId:
 *                 type: integer
 *                 description: ID of the message sender
 *               receiverId:
 *                 type: integer
 *                 description: ID of the message receiver
 *               content:
 *                 type: string
 *                 description: Content of the message
 *     responses:
 *       201:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 newMessage:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     chat_id:
 *                       type: integer
 *                     sender_id:
 *                       type: integer
 *                     content:
 *                       type: string
 *                     sent_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: All fields are required
 *       500:
 *         description: Server error
 *
 * /chat/messages/{productId}/{user1Id}/{user2Id}:
 *   get:
 *     summary: Get chat history for a product between two users
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the product related to the chat
 *       - in: path
 *         name: user1Id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the first user
 *       - in: path
 *         name: user2Id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the second user
 *     responses:
 *       200:
 *         description: Chat history and chat ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 chatId:
 *                   type: integer
 *                 messages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       chat_id:
 *                         type: integer
 *                       sender_id:
 *                         type: integer
 *                       content:
 *                         type: string
 *                       sent_at:
 *                         type: string
 *                         format: date-time
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 *
 * /chats/{userId}:
 *   get:
 *     summary: Get all chat rooms for a user
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the user to retrieve chat rooms for
 *     responses:
 *       200:
 *         description: A list of chat rooms
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   chat_id:
 *                     type: integer
 *                   product_id:
 *                     type: string
 *                   product_name:
 *                     type: string
 *                   product_image:
 *                     type: string
 *                   other_user_id:
 *                     type: integer
 *                   other_user_nickname:
 *                     type: string
 *                   last_message_content:
 *                     type: string
 *                   last_message_sent_at:
 *                     type: string
 *                     format: date-time
 *       400:
 *         description: User ID is required
 *       500:
 *         description: Server error
 *
 * /chat/messages/byChatId/{chatId}:
 *   get:
 *     summary: Get messages by chat ID
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the chat room to retrieve messages for
 *     responses:
 *       200:
 *         description: A list of messages in the chat room
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   chat_id:
 *                     type: integer
 *                   sender_id:
 *                     type: integer
 *                   content:
 *                     type: string
 *                   sent_at:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Server error
 */
router.post('/chat/messages', sendMessage);
router.get('/chat/messages/:productId/:user1Id/:user2Id', getChatHistory);
router.get('/chats/:userId', getUserChatRooms);
router.get('/chat/messages/byChatId/:chatId', getMessagesByChatId);
router.delete('/chats/:chatId', deleteChatRoom);

export default router;
