"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessagesByChatId = exports.getUserChatRooms = exports.getChatHistory = exports.sendMessage = exports.setIoInstance = void 0;
const chatRepository_1 = require("../repositories/chatRepository");
// This will be initialized in index.ts and passed to controllers if needed
let ioInstance;
const setIoInstance = (io) => {
    ioInstance = io;
};
exports.setIoInstance = setIoInstance;
const sendMessage = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId, senderId, receiverId, content } = req.body;
    console.log('sendMessage called with:', { productId, senderId, receiverId, content });
    if (!productId || !senderId || !receiverId || !content) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    try {
        console.log('Attempting to find chat room...');
        let chat = yield (0, chatRepository_1.findChatRoom)(productId, senderId, receiverId);
        console.log('Chat room found/not found:', chat);
        let chatId;
        if (chat) {
            chatId = chat.id;
        }
        else {
            const productAuthor = yield (0, chatRepository_1.findProductAuthor)(productId);
            if (!productAuthor) {
                return res.status(404).json({ message: 'Product not found' });
            }
            const actualSellerId = productAuthor.author_id;
            const sellerIdForChat = actualSellerId;
            const buyerIdForChat = Number(senderId) === Number(actualSellerId) ? receiverId : senderId;
            console.log('Attempting to create chat room...');
            chatId = yield (0, chatRepository_1.createChatRoom)(productId, sellerIdForChat, buyerIdForChat);
            console.log('Chat room created with ID:', chatId);
        }
        console.log('Attempting to create message...');
        const messageId = yield (0, chatRepository_1.createMessage)(chatId, senderId, content);
        console.log('Message created with ID:', messageId);
        const newMessage = {
            id: messageId,
            chat_id: chatId,
            sender_id: senderId,
            content: content,
            sent_at: new Date().toISOString(),
        };
        yield (0, chatRepository_1.updateChatLastMessageAt)(chatId);
        if (ioInstance) {
            ioInstance.to(chatId.toString()).emit('newMessage', newMessage);
        }
        res.status(201).json({ message: 'Message sent successfully', newMessage: newMessage });
    }
    catch (error) {
        console.error('Error in sendMessage:', error);
        next(error);
    }
});
exports.sendMessage = sendMessage;
const getChatHistory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId, user1Id, user2Id } = req.params;
    console.log('getChatHistory called with:', { productId, user1Id, user2Id });
    try {
        console.log('Attempting to find chat room for history...');
        // Do not convert productId to Number, as repository expects a string
        let chat = yield (0, chatRepository_1.findChatRoom)(productId, Number(user1Id), Number(user2Id));
        console.log('Chat room for history found/not found:', chat);
        let chatId;
        let messages = [];
        if (chat) {
            chatId = chat.id;
            console.log('Attempting to find chat messages for chatId:', chatId);
            messages = yield (0, chatRepository_1.findChatMessages)(chatId);
            console.log('Chat messages found:', messages.length);
        }
        else {
            // If chat does not exist, create it.
            console.log('No chat room found. Creating a new one.');
            // Do not convert productId to Number
            const productAuthor = yield (0, chatRepository_1.findProductAuthor)(productId);
            if (!productAuthor) {
                return res.status(404).json({ message: 'Product not found' });
            }
            const actualSellerId = productAuthor.author_id;
            const sellerIdForChat = actualSellerId;
            const buyerIdForChat = Number(user1Id) === Number(actualSellerId) ? Number(user2Id) : Number(user1Id);
            // Do not convert productId to Number
            chatId = yield (0, chatRepository_1.createChatRoom)(productId, sellerIdForChat, buyerIdForChat);
            console.log('New chat room created with ID:', chatId);
            // Messages will be an empty array for a new chat room
        }
        res.status(200).json({ chatId, messages }); // Always return chatId and messages
    }
    catch (error) {
        console.error('Error in getChatHistory:', error);
        next(error);
    }
});
exports.getChatHistory = getChatHistory;
const getUserChatRooms = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    console.log('getUserChatRooms called with userId:', userId);
    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
    }
    try {
        console.log('Attempting to find all user chat rooms for userId:', userId);
        const chats = yield (0, chatRepository_1.findAllUserChatRooms)(Number(userId));
        console.log('User chat rooms found:', chats.length);
        res.status(200).json(chats);
    }
    catch (error) {
        console.error('Error in getUserChatRooms:', error);
        next(error);
    }
});
exports.getUserChatRooms = getUserChatRooms;
const getMessagesByChatId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { chatId } = req.params;
    console.log('getMessagesByChatId called with chatId:', chatId);
    try {
        const messages = yield (0, chatRepository_1.findChatMessages)(Number(chatId));
        res.status(200).json(messages);
    }
    catch (error) {
        console.error('Error in getMessagesByChatId:', error);
        next(error);
    }
});
exports.getMessagesByChatId = getMessagesByChatId;
