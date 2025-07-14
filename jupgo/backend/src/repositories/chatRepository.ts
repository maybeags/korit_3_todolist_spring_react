import pool from '../db';

export const findChatRoom = async (productId: string, user1Id: number, user2Id: number) => {
  console.log('findChatRoom called with:', { productId, user1Id, user2Id });
  const query = 'SELECT id FROM chats WHERE product_id = ? AND ((seller_id = ? AND buyer_id = ?) OR (seller_id = ? AND buyer_id = ?)) LIMIT 1';
  const params = [productId, user1Id, user2Id, user2Id, user1Id];
  console.log('Executing findChatRoom query:', query, 'with params:', params);
  try {
    const [chats] = await pool.execute(query, params);
    console.log('findChatRoom query executed, rows:', chats);
    return Array.isArray(chats) ? chats[0] : null;
  } catch (error) {
    console.error('Error in findChatRoom:', error);
    throw error;
  }
};

export const findProductAuthor = async (productId: string) => {
  console.log('findProductAuthor called with productId:', productId);
  const query = 'SELECT author_id FROM products WHERE id = ?';
  const params = [productId];
  console.log('Executing findProductAuthor query:', query, 'with params:', params);
  try {
    const [productRows]: [any[], any] = await pool.execute(query, params);
    console.log('findProductAuthor query executed, rows:', productRows);
    return Array.isArray(productRows) ? productRows[0] : null;
  } catch (error) {
    console.error('Error in findProductAuthor:', error);
    throw error;
  }
};

export const createChatRoom = async (productId: string, sellerId: number, buyerId: number) => {
  console.log('createChatRoom called with:', { productId, sellerId, buyerId });
  const query = 'INSERT INTO chats (product_id, seller_id, buyer_id) VALUES (?, ?, ?)';
  const params = [productId, sellerId, buyerId];
  console.log('Executing createChatRoom query:', query, 'with params:', params);
  try {
    const [result]: [any, any] = await pool.execute(query, params);
    console.log('createChatRoom query executed, insertId:', result.insertId);
    return result.insertId;
  } catch (error) {
    console.error('Error in createChatRoom:', error);
    throw error;
  }
};

export const createMessage = async (chatId: number, senderId: number, content: string) => {
  console.log('createMessage called with:', { chatId, senderId, content });
  const query = 'INSERT INTO messages (chat_id, sender_id, content) VALUES (?, ?, ?)';
  const params = [chatId, senderId, content];
  console.log('Executing createMessage query:', query, 'with params:', params);
  try {
    const [messageResult]:[any, any] = await pool.execute(query, params);
    console.log('createMessage query executed, insertId:', messageResult.insertId);
    return messageResult.insertId;
  } catch (error) {
    console.error('Error in createMessage:', error);
    throw error;
  }
};

export const updateChatLastMessageAt = async (chatId: number) => {
  console.log('updateChatLastMessageAt called with chatId:', chatId);
  const query = 'UPDATE chats SET last_message_at = CURRENT_TIMESTAMP WHERE id = ?';
  const params = [chatId];
  console.log('Executing updateChatLastMessageAt query:', query, 'with params:', params);
  try {
    await pool.execute(query, params);
    console.log('updateChatLastMessageAt query executed.');
  } catch (error) {
    console.error('Error in updateChatLastMessageAt:', error);
    throw error;
  }
};

export const findChatMessages = async (chatId: number) => {
  console.log('findChatMessages called with chatId:', chatId);
  const query = 'SELECT id, sender_id, content, sent_at FROM messages WHERE chat_id = ? ORDER BY sent_at ASC';
  const params = [chatId];
  console.log('Executing findChatMessages query:', query, 'with params:', params);
  try {
    const [messages] = await pool.execute(query, params);
    console.log('findChatMessages query executed, messages count:', (Array.isArray(messages) ? messages : []).length);
    return Array.isArray(messages) ? messages : [];
  } catch (error) {
    console.error('Error in findChatMessages:', error);
    throw error;
  }
};

export const findAllUserChatRooms = async (userId: number) => {
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
    const [rows] = await pool.execute(query, params);
    console.log('findAllUserChatRooms query executed, chat rooms count:', (Array.isArray(rows) ? rows : []).length);
    return Array.isArray(rows) ? rows : [];
  } catch (error) {
    console.error('Error in findAllUserChatRooms:', error);
    throw error;
  }
};

export const deleteMessagesByChatId = async (chatId: number) => {
  console.log('Attempting to delete messages for chatId:', chatId); // Added log
  const query = 'DELETE FROM messages WHERE chat_id = ?';
  const params = [chatId];
  console.log('Executing deleteMessagesByChatId query:', query, 'with params:', params);
  try {
    const [result]: [any, any] = await pool.execute(query, params);
    console.log('deleteMessagesByChatId query executed, affectedRows:', result.affectedRows);
    return result.affectedRows;
  } catch (error) {
    console.error('Error in deleteMessagesByChatId:', error);
    throw error;
  }
};

export const deleteChatRoomById = async (chatId: number) => {
  console.log('Attempting to delete chat room with chatId:', chatId); // Added log
  const query = 'DELETE FROM chats WHERE id = ?';
  const params = [chatId];
  console.log('Executing deleteChatRoomById query:', query, 'with params:', params);
  try {
    const [result]: [any, any] = await pool.execute(query, params);
    console.log('deleteChatRoomById query executed, affectedRows:', result.affectedRows);
    return result.affectedRows;
  } catch (error) {
    console.error('Error in deleteChatRoomById:', error);
    throw error;
  }
};
