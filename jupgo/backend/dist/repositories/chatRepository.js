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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findAllUserChatRooms = exports.findChatMessages = exports.updateChatLastMessageAt = exports.createMessage = exports.createChatRoom = exports.findProductAuthor = exports.findChatRoom = void 0;
const db_1 = __importDefault(require("../db"));
const findChatRoom = (productId, user1Id, user2Id) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('findChatRoom called with:', { productId, user1Id, user2Id });
    const query = 'SELECT id FROM chats WHERE product_id = ? AND ((seller_id = ? AND buyer_id = ?) OR (seller_id = ? AND buyer_id = ?)) LIMIT 1';
    const params = [productId, user1Id, user2Id, user2Id, user1Id];
    console.log('Executing findChatRoom query:', query, 'with params:', params);
    try {
        const [chats] = yield db_1.default.execute(query, params);
        console.log('findChatRoom query executed, rows:', chats);
        return Array.isArray(chats) ? chats[0] : null;
    }
    catch (error) {
        console.error('Error in findChatRoom:', error);
        throw error;
    }
});
exports.findChatRoom = findChatRoom;
const findProductAuthor = (productId) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('findProductAuthor called with productId:', productId);
    const query = 'SELECT author_id FROM products WHERE id = ?';
    const params = [productId];
    console.log('Executing findProductAuthor query:', query, 'with params:', params);
    try {
        const [productRows] = yield db_1.default.execute(query, params);
        console.log('findProductAuthor query executed, rows:', productRows);
        return Array.isArray(productRows) ? productRows[0] : null;
    }
    catch (error) {
        console.error('Error in findProductAuthor:', error);
        throw error;
    }
});
exports.findProductAuthor = findProductAuthor;
const createChatRoom = (productId, sellerId, buyerId) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('createChatRoom called with:', { productId, sellerId, buyerId });
    const query = 'INSERT INTO chats (product_id, seller_id, buyer_id) VALUES (?, ?, ?)';
    const params = [productId, sellerId, buyerId];
    console.log('Executing createChatRoom query:', query, 'with params:', params);
    try {
        const [result] = yield db_1.default.execute(query, params);
        console.log('createChatRoom query executed, insertId:', result.insertId);
        return result.insertId;
    }
    catch (error) {
        console.error('Error in createChatRoom:', error);
        throw error;
    }
});
exports.createChatRoom = createChatRoom;
const createMessage = (chatId, senderId, content) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('createMessage called with:', { chatId, senderId, content });
    const query = 'INSERT INTO messages (chat_id, sender_id, content) VALUES (?, ?, ?)';
    const params = [chatId, senderId, content];
    console.log('Executing createMessage query:', query, 'with params:', params);
    try {
        const [messageResult] = yield db_1.default.execute(query, params);
        console.log('createMessage query executed, insertId:', messageResult.insertId);
        return messageResult.insertId;
    }
    catch (error) {
        console.error('Error in createMessage:', error);
        throw error;
    }
});
exports.createMessage = createMessage;
const updateChatLastMessageAt = (chatId) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('updateChatLastMessageAt called with chatId:', chatId);
    const query = 'UPDATE chats SET last_message_at = CURRENT_TIMESTAMP WHERE id = ?';
    const params = [chatId];
    console.log('Executing updateChatLastMessageAt query:', query, 'with params:', params);
    try {
        yield db_1.default.execute(query, params);
        console.log('updateChatLastMessageAt query executed.');
    }
    catch (error) {
        console.error('Error in updateChatLastMessageAt:', error);
        throw error;
    }
});
exports.updateChatLastMessageAt = updateChatLastMessageAt;
const findChatMessages = (chatId) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('findChatMessages called with chatId:', chatId);
    const query = 'SELECT id, sender_id, content, sent_at FROM messages WHERE chat_id = ? ORDER BY sent_at ASC';
    const params = [chatId];
    console.log('Executing findChatMessages query:', query, 'with params:', params);
    try {
        const [messages] = yield db_1.default.execute(query, params);
        console.log('findChatMessages query executed, messages count:', (Array.isArray(messages) ? messages : []).length);
        return Array.isArray(messages) ? messages : [];
    }
    catch (error) {
        console.error('Error in findChatMessages:', error);
        throw error;
    }
});
exports.findChatMessages = findChatMessages;
const findAllUserChatRooms = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('findAllUserChatRooms called with userId:', userId);
    const query = `
    SELECT
        c.id AS chatId,
        c.product_id AS productId,
        p.name AS productName,
        (SELECT image_url FROM product_images WHERE product_id = c.product_id LIMIT 1) AS productImageUrl,
        other_user.id AS otherUserId,
        other_user_profile.nickname AS otherUserNickname,
        other_user_profile.profile_image_url AS otherUserProfileImageUrl,
        last_message.content AS lastMessage,
        last_message.sent_at AS lastMessageAt
    FROM chats c
    JOIN products p ON c.product_id = p.id
    LEFT JOIN (
        SELECT
            chat_id,
            content,
            sent_at,
            ROW_NUMBER() OVER(PARTITION BY chat_id ORDER BY sent_at DESC) as rn
        FROM messages
    ) AS last_message ON c.id = last_message.chat_id AND last_message.rn = 1
    JOIN users AS other_user ON other_user.id = IF(c.seller_id = ?, c.buyer_id, c.seller_id)
    JOIN user_profiles AS other_user_profile ON other_user.id = other_user_profile.user_id
    WHERE (c.seller_id = ? OR c.buyer_id = ?)
    ORDER BY last_message.sent_at DESC;
  `;
    const params = [userId, userId, userId];
    console.log('Executing findAllUserChatRooms query:', query, 'with params:', params);
    try {
        const [rows] = yield db_1.default.execute(query, params);
        console.log('findAllUserChatRooms query executed, chat rooms count:', (Array.isArray(rows) ? rows : []).length);
        return Array.isArray(rows) ? rows : [];
    }
    catch (error) {
        console.error('Error in findAllUserChatRooms:', error);
        throw error;
    }
});
exports.findAllUserChatRooms = findAllUserChatRooms;
