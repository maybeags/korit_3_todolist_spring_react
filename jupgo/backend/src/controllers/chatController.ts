import { Request, Response, NextFunction } from 'express';
import { Server } from 'socket.io';
import {
  findChatRoom,
  findProductAuthor,
  createChatRoom,
  createMessage,
  updateChatLastMessageAt,
  findChatMessages,
  findAllUserChatRooms,
  deleteChatRoomById,
  deleteMessagesByChatId
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
    // Do not convert productId to Number, as repository expects a string
    let chat = await findChatRoom(productId, Number(user1Id), Number(user2Id));
    console.log('Chat room for history found/not found:', chat);

    let chatId;
    let messages: any[] = [];

    if (chat) {
      chatId = (chat as ChatRow).id;
      console.log('Attempting to find chat messages for chatId:', chatId);
      messages = await findChatMessages(chatId);
      console.log('Chat messages found:', messages.length);
    } else {
      // If chat does not exist, create it.
      console.log('No chat room found. Creating a new one.');
      // Do not convert productId to Number
      const productAuthor = await findProductAuthor(productId);
      if (!productAuthor) {
        return res.status(404).json({ message: 'Product not found' });
      }
      const actualSellerId = productAuthor.author_id;
      const sellerIdForChat = actualSellerId;
      const buyerIdForChat = Number(user1Id) === Number(actualSellerId) ? Number(user2Id) : Number(user1Id);

      // Do not convert productId to Number
      chatId = await createChatRoom(productId, sellerIdForChat, buyerIdForChat);
      console.log('New chat room created with ID:', chatId);
      // Messages will be an empty array for a new chat room
    }

    res.status(200).json({ chatId, messages }); // Always return chatId and messages
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

export const getMessagesByChatId = async (req: Request, res: Response, next: NextFunction) => {
  const { chatId } = req.params;
  console.log('getMessagesByChatId called with chatId:', chatId);

  try {
    const messages = await findChatMessages(Number(chatId));
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error in getMessagesByChatId:', error);
    next(error);
  }
};

export const deleteChatRoom = async (req: Request, res: Response, next: NextFunction) => {
  const { chatId } = req.params;
  console.log('Received DELETE request for chatId:', chatId); // Added log

  try {
    await deleteMessagesByChatId(Number(chatId)); // Delete messages first
    const affectedRows = await deleteChatRoomById(Number(chatId)); // Then delete the chat room

    if (affectedRows === 0) {
      return res.status(404).json({ message: 'Chat room not found' });
    }

    res.status(200).json({ message: 'Chat room deleted successfully' });
  } catch (error) {
    console.error('Error in deleteChatRoom:', error);
    next(error);
  }
};
