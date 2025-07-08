import { Request, Response, NextFunction } from 'express';
import { Server } from 'socket.io';
import { 
  findChatRoom, 
  findProductAuthor, 
  createChatRoom, 
  createMessage, 
  updateChatLastMessageAt, 
  findChatMessages, 
  findAllUserChatRooms 
} from '../repositories/chatRepository';

interface ChatRow {
  id: number;
}

// This will be initialized in index.ts and passed to controllers if needed
let ioInstance: Server;

export const setIoInstance = (io: Server) => {
  ioInstance = io;
};

export const sendMessage = async (req: Request, res: Response, next: NextFunction) => {
  const { productId, senderId, receiverId, content } = req.body;
  console.log('sendMessage called with:', { productId, senderId, receiverId, content });

  if (!productId || !senderId || !receiverId || !content) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    console.log('Attempting to find chat room...');
    let chat = await findChatRoom(productId, senderId, receiverId);
    console.log('Chat room found/not found:', chat);
    let chatId;

    if (chat) {
      chatId = (chat as ChatRow).id;
    } else {
      const productAuthor = await findProductAuthor(productId);
      if (!productAuthor) {
        return res.status(404).json({ message: 'Product not found' });
      }
      const actualSellerId = productAuthor.author_id;
      const sellerIdForChat = actualSellerId;
      const buyerIdForChat = Number(senderId) === Number(actualSellerId) ? receiverId : senderId;
      
      console.log('Attempting to create chat room...');
      chatId = await createChatRoom(productId, sellerIdForChat, buyerIdForChat);
      console.log('Chat room created with ID:', chatId);
    }

    console.log('Attempting to create message...');
    const messageId = await createMessage(chatId, senderId, content);
    console.log('Message created with ID:', messageId);
    
    const newMessage = {
        id: messageId,
        chat_id: chatId,
        sender_id: senderId,
        content: content,
        sent_at: new Date().toISOString(),
    };

    await updateChatLastMessageAt(chatId);
    
    if (ioInstance) {
      ioInstance.to(chatId.toString()).emit('newMessage', newMessage);
    }

    res.status(201).json({ message: 'Message sent successfully', newMessage: newMessage });
  } catch (error: any) {
    console.error('Error in sendMessage:', error);
    next(error);
  }
};

export const getChatHistory = async (req: Request, res: Response, next: NextFunction) => {
  const { productId, user1Id, user2Id } = req.params;
  console.log('getChatHistory called with:', { productId, user1Id, user2Id });

  try {
    console.log('Attempting to find chat room for history...');
    const chat = await findChatRoom(productId, Number(user1Id), Number(user2Id));
    console.log('Chat room for history found/not found:', chat);

    if (!chat) {
      return res.status(200).json([]);
    }

    const chatId = (chat as ChatRow).id;

    console.log('Attempting to find chat messages for chatId:', chatId);
    const messages = await findChatMessages(chatId);
    console.log('Chat messages found:', messages.length);

    res.status(200).json(messages);
  } catch (error) {
    console.error('Error in getChatHistory:', error);
    next(error);
  }
};

export const getUserChatRooms = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    console.log('getUserChatRooms called with userId:', userId);

    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    try {
        console.log('Attempting to find all user chat rooms for userId:', userId);
        const chats = await findAllUserChatRooms(Number(userId));
        console.log('User chat rooms found:', chats.length);

        res.status(200).json(chats);
    } catch (error) {
        console.error('Error in getUserChatRooms:', error);
        next(error);
    }
};
