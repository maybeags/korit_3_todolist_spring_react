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
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./db")); // Import the MariaDB connection pool
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
// Create uploads directory if it doesn't exist
console.log('__dirname:', __dirname);
const uploadsDir = path_1.default.resolve(__dirname, '../uploads');
console.log('uploadsDir:', uploadsDir);
if (!fs_1.default.existsSync(uploadsDir)) {
    try {
        fs_1.default.mkdirSync(uploadsDir);
        console.log(`Uploads directory created at: ${uploadsDir}`);
    }
    catch (error) {
        console.error(`Failed to create uploads directory at ${uploadsDir}:`, error);
        // Re-throw the error to stop the server from starting with a critical issue
        throw error;
    }
}
// Serve static files from the uploads directory
app.use('/uploads', express_1.default.static(uploadsDir));
// Multer configuration for image uploads
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = (0, multer_1.default)({ storage: storage });
// API for user registration
app.post('/api/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }
    try {
        // Check if user already exists
        const [existingUsers] = yield db_1.default.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (Array.isArray(existingUsers) && existingUsers.length > 0) {
            return res.status(409).json({ message: 'User with this email already exists' });
        }
        const salt = yield bcryptjs_1.default.genSalt(10);
        const passwordHash = yield bcryptjs_1.default.hash(password, salt);
        // Insert user into users table
        const [result] = yield db_1.default.execute('INSERT INTO users (email, password_hash) VALUES (?, ?)', [email, passwordHash]);
        const insertId = result.insertId;
        // Insert a default user profile
        yield db_1.default.execute('INSERT INTO user_profiles (user_id, nickname, location) VALUES (?, ?, ?)', [insertId, `User${insertId}`, 'Unknown'] // Default nickname and location
        );
        console.log(`New user registered: ${email}`);
        res.status(201).json({ message: 'User registered successfully', user: { id: insertId, email: email } });
    }
    catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));
// API for user sign-in
app.post('/api/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }
    try {
        const [rows] = yield db_1.default.execute('SELECT id, password_hash FROM users WHERE email = ?', [email]);
        const users = Array.isArray(rows) ? rows : [];
        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const user = users[0];
        const isMatch = yield bcryptjs_1.default.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        // Fetch user profile information
        const [profileRows] = yield db_1.default.execute('SELECT nickname, location, profile_image_url FROM user_profiles WHERE user_id = ?', [user.id]);
        let userProfile = { nickname: 'Unknown', location: 'Unknown', profile_image_url: null };
        if (Array.isArray(profileRows) && profileRows.length > 0) {
            userProfile = profileRows[0];
        }
        res.status(200).json({ message: 'Signed in successfully', user: { id: user.id, email: email, nickname: userProfile.nickname, location: userProfile.location, profileImage: userProfile.profile_image_url } });
    }
    catch (error) {
        console.error('Error during signin:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));
// API to get user profile by user ID
app.get('/api/user/profile/:userId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const [rows] = yield db_1.default.execute('SELECT u.email, up.nickname, up.location, up.profile_image_url FROM users u JOIN user_profiles up ON u.id = up.user_id WHERE u.id = ?', [userId]);
        let user = null;
        if (Array.isArray(rows) && rows.length > 0) {
            user = rows[0];
        }
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    }
    catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));
// API to update user profile
app.put('/api/user/profile', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, nickname, location, profileImage } = req.body;
    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
    }
    try {
        // Check if user exists
        const [userRows] = yield db_1.default.execute('SELECT id FROM users WHERE id = ?', [userId]);
        if (!Array.isArray(userRows) || userRows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Update user profile
        yield db_1.default.execute('UPDATE user_profiles SET nickname = ?, location = ?, profile_image_url = ? WHERE user_id = ?', [nickname, location, profileImage, userId]);
        res.status(200).json({ message: 'Profile updated successfully' });
    }
    catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));
// API to get all products with optional search
// API to get all products with optional search
app.get('/api/products', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { search } = req.query;
    let query = `
    SELECT
      p.id, p.name, p.price, p.description, p.status, p.created_at,
      up.nickname AS author, up.location,
      JSON_ARRAYAGG(pi.image_url) AS images
    FROM products p
    JOIN user_profiles up ON p.author_id = up.user_id
    LEFT JOIN product_images pi ON p.id = pi.product_id
  `;
    const params = [];
    if (search) {
        query += ` WHERE p.name LIKE ? OR p.description LIKE ?`;
        params.push(`%${search}%`);
        params.push(`%${search}%`);
    }
    query += `
    GROUP BY p.id, p.name, p.price, p.description, p.status, p.created_at, up.nickname, up.location
    ORDER BY p.created_at DESC
  `;
    try {
        const [rows] = yield db_1.default.execute(query, params);
        const products = Array.isArray(rows) ? rows : [];
        // Ensure images is an array, even if JSON_ARRAYAGG returns null for no images
        const formattedProducts = products.map((product) => (Object.assign(Object.assign({}, product), { images: product.images ? JSON.parse(product.images) : [] })));
        res.status(200).json(formattedProducts);
    }
    catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));
// API to get a single product by ID
app.get('/api/products/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const [rows] = yield db_1.default.execute(`
      SELECT
        p.id, p.name, p.price, p.description, p.status, p.created_at,
        up.nickname AS author, up.location,
        JSON_ARRAYAGG(pi.image_url) AS images
      FROM products p
      JOIN user_profiles up ON p.author_id = up.user_id
      LEFT JOIN product_images pi ON p.id = pi.product_id
      WHERE p.id = ?
      GROUP BY p.id, p.name, p.price, p.description, p.status, p.created_at, up.nickname, up.location
    `, [id]);
        const products = Array.isArray(rows) ? rows : [];
        if (products.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        const product = products[0];
        // Ensure images is an array, even if JSON_ARRAYAGG returns null for no images
        const formattedProduct = Object.assign(Object.assign({}, product), { images: product.images ? JSON.parse(product.images) : [] });
        res.status(200).json(formattedProduct);
    }
    catch (error) {
        console.error('Error fetching product by ID:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));
// API for product registration
app.post('/api/products', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, price, description, imageUrl } = req.body;
    if (!name || !price || !description) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    try {
        // For now, using a hardcoded author_id. This should be replaced with actual user authentication.
        const authorId = 1; // Assuming user with ID 1 exists for testing
        // Insert product into products table
        const [productResult] = yield db_1.default.execute('INSERT INTO products (name, price, description, author_id) VALUES (?, ?, ?, ?)', [name, price, description, authorId]);
        const productId = productResult.insertId;
        // Insert image URL into product_images table if provided
        if (imageUrl) {
            yield db_1.default.execute('INSERT INTO product_images (product_id, image_url) VALUES (?, ?)', [productId, imageUrl]);
        }
        res.status(201).json({ message: 'Product registered successfully', product: { id: productId, name, price, description, imageUrl } });
    }
    catch (error) {
        console.error('Error during product registration:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));
// API for image upload
app.post('/api/upload-image', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No image file provided' });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    res.status(200).json({ imageUrl });
});
// API for sending a chat message
app.post('/api/chat/messages', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId, senderId, receiverId, content } = req.body;
    if (!productId || !senderId || !receiverId || !content) {
        return res.status(400).json({ message: 'All fields are required: productId, senderId, receiverId, content' });
    }
    try {
        // Find or create chat
        let [chats] = yield db_1.default.execute('SELECT id FROM chats WHERE product_id = ? AND ((seller_id = ? AND buyer_id = ?) OR (seller_id = ? AND buyer_id = ?)) LIMIT 1', [productId, senderId, receiverId, receiverId, senderId]);
        let chatId;
        if (Array.isArray(chats) && chats.length > 0) {
            chatId = chats[0].id;
        }
        else {
            // Create new chat
            const [result] = yield db_1.default.execute('INSERT INTO chats (product_id, seller_id, buyer_id) VALUES (?, ?, ?)', [productId, senderId, receiverId]);
            chatId = result.insertId;
        }
        // Insert message
        yield db_1.default.execute('INSERT INTO messages (chat_id, sender_id, content) VALUES (?, ?, ?)', [chatId, senderId, content]);
        // Update last_message_at for the chat
        yield db_1.default.execute('UPDATE chats SET last_message_at = CURRENT_TIMESTAMP WHERE id = ?', [chatId]);
        res.status(201).json({ message: 'Message sent successfully', chatId });
    }
    catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));
// API to get chat history
app.get('/api/chat/messages/:productId/:user1Id/:user2Id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId, user1Id, user2Id } = req.params;
    try {
        // Find chat
        const [chats] = yield db_1.default.execute('SELECT id FROM chats WHERE product_id = ? AND ((seller_id = ? AND buyer_id = ?) OR (seller_id = ? AND buyer_id = ?)) LIMIT 1', [productId, user1Id, user2Id, user2Id, user1Id]);
        if (!Array.isArray(chats) || chats.length === 0) {
            return res.status(200).json([]); // No chat found, return empty messages
        }
        const chatId = chats[0].id;
        // Get messages for the chat
        const [messages] = yield db_1.default.execute('SELECT id, sender_id, content, sent_at FROM messages WHERE chat_id = ? ORDER BY sent_at ASC', [chatId]);
        res.status(200).json(messages);
    }
    catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
