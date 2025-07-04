import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import pool from './db'; // Import the MariaDB connection pool
import multer from 'multer';
import path from 'path';
import fs from 'fs';

dotenv.config();

interface ChatRow {
  id: number;
}

interface UserProfileRow {
  nickname: string;
  location: string;
}

interface UserDataFromDb {
  email: string;
  nickname: string;
  location: string;
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Create uploads directory if it doesn't exist
console.log('__dirname:', __dirname);
const uploadsDir = path.resolve(__dirname, '../uploads');
console.log('uploadsDir:', uploadsDir);
if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir);
    console.log(`Uploads directory created at: ${uploadsDir}`);
  } catch (error) {
    console.error(`Failed to create uploads directory at ${uploadsDir}:`, error);
    // Re-throw the error to stop the server from starting with a critical issue
    throw error;
  }
}

// Serve static files from the uploads directory
app.use('/uploads', express.static(uploadsDir));

// Multer configuration for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

// API for user registration
app.post('/api/signup', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Check if user already exists
    const [existingUsers] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user into users table
    const [result] = await pool.execute(
      'INSERT INTO users (email, password_hash) VALUES (?, ?)',
      [email, passwordHash]
    );

    const insertId = (result as any).insertId;

    // Insert a default user profile
    await pool.execute(
      'INSERT INTO user_profiles (user_id, nickname, location) VALUES (?, ?, ?)',
      [insertId, `User${insertId}`, 'Unknown'] // Default nickname and location
    );

    console.log(`New user registered: ${email}`);
    res.status(201).json({ message: 'User registered successfully', user: { id: insertId, email: email } });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// API for user sign-in
app.post('/api/signin', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const [rows] = await pool.execute('SELECT id, password_hash FROM users WHERE email = ?', [email]);
    const users = Array.isArray(rows) ? rows : [];

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0] as { id: number; password_hash: string };
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Fetch user profile information
    const [profileRows] = await pool.execute('SELECT nickname, location, profile_image_url FROM user_profiles WHERE user_id = ?', [user.id]);
    
    interface UserProfileRow {
      nickname: string;
      location: string;
      profile_image_url: string | null;
    }

    let userProfile: UserProfileRow = { nickname: 'Unknown', location: 'Unknown', profile_image_url: null };
    if (Array.isArray(profileRows) && profileRows.length > 0) {
      userProfile = (profileRows as UserProfileRow[])[0];
    }

    res.status(200).json({ message: 'Signed in successfully', user: { id: user.id, email: email, nickname: userProfile.nickname, location: userProfile.location, profileImage: userProfile.profile_image_url } });
  } catch (error) {
    console.error('Error during signin:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// API to get user profile by user ID
app.get('/api/user/profile/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const [rows] = await pool.execute('SELECT u.email, up.nickname, up.location, up.profile_image_url FROM users u JOIN user_profiles up ON u.id = up.user_id WHERE u.id = ?', [userId]);
    
    interface UserProfileDetailRow {
      email: string;
      nickname: string;
      location: string;
      profile_image_url: string | null;
    }

    let user: UserProfileDetailRow | null = null;
    if (Array.isArray(rows) && rows.length > 0) {
      user = rows[0] as UserProfileDetailRow;
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// API to update user profile
app.put('/api/user/profile', async (req, res) => {
  const { userId, nickname, location, profileImage } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    // Check if user exists
    const [userRows] = await pool.execute('SELECT id FROM users WHERE id = ?', [userId]);
    if (!Array.isArray(userRows) || userRows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user profile
    await pool.execute(
      'UPDATE user_profiles SET nickname = ?, location = ?, profile_image_url = ? WHERE user_id = ?',
      [nickname, location, profileImage, userId]
    );

    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// API to get all products with optional search
  

// API to get all products with optional search
app.get('/api/products', async (req, res) => {
  const { search, authorId } = req.query;
  let query = `
    SELECT
      p.id, p.name, p.price, p.description, p.status, p.created_at,
      up.nickname AS author, up.location,
      JSON_ARRAYAGG(pi.image_url) AS images
    FROM products p
    JOIN user_profiles up ON p.author_id = up.user_id
    LEFT JOIN product_images pi ON p.id = pi.product_id
  `;
  const params: (string | number)[] = [];
  const conditions: string[] = [];

  if (search) {
    conditions.push(`(p.name LIKE ? OR p.description LIKE ?)`);
    params.push(`%${search}%`);
    params.push(`%${search}%`);
  }

  if (authorId) {
    conditions.push(`p.author_id = ?`);
    params.push(Number(authorId));
  }

  if (conditions.length > 0) {
    query += ` WHERE ` + conditions.join(` AND `);
  }

  query += `
    GROUP BY p.id, p.name, p.price, p.description, p.status, p.created_at, up.nickname, up.location
    ORDER BY p.created_at DESC
  `;

  try {
    const [rows] = await pool.execute(query, params);
    const products = Array.isArray(rows) ? rows : [];

    // Ensure images is an array, even if JSON_ARRAYAGG returns null for no images
    const formattedProducts = products.map((product: any) => ({
      ...product,
      images: product.images ? JSON.parse(product.images) : [],
    }));

    res.status(200).json(formattedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// API to get a single product by ID
app.get('/api/products/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.execute(`
      SELECT
        p.id, p.name, p.price, p.description, p.status, p.created_at, p.author_id,
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

    const product: any = products[0];
    // Ensure images is an array, even if JSON_ARRAYAGG returns null for no images
    const formattedProduct = {
      ...product,
      images: product.images ? JSON.parse(product.images) : [],
    };

    res.status(200).json(formattedProduct);
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// API to update a product
app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const { name, price, description, imageUrl, authorId } = req.body;

  if (!name || !price || !description || !authorId) {
    return res.status(400).json({ message: 'All fields (name, price, description, authorId) are required' });
  }

  try {
    // Check if product exists and get its author_id
    const [productRows]: [any[], any] = await pool.execute('SELECT author_id FROM products WHERE id = ?', [id]);
    if (!Array.isArray(productRows) || productRows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    const existingAuthorId = productRows[0].author_id;

    // Authorization check: ensure the requesting user is the author of the product
    if (existingAuthorId !== authorId) {
      return res.status(403).json({ message: 'You are not authorized to update this product' });
    }

    // Clean price string (remove non-numeric characters)
    const cleanedPrice = String(price).replace(/[^0-9.-]+/g,"");

    // Update product in products table
    await pool.execute(
      'UPDATE products SET name = ?, price = ?, description = ? WHERE id = ?',
      [name, cleanedPrice, description, id]
    );

    // Update product images: For simplicity, delete existing and insert new if provided
    await pool.execute('DELETE FROM product_images WHERE product_id = ?', [id]);
    if (imageUrl) {
      await pool.execute(
        'INSERT INTO product_images (product_id, image_url) VALUES (?, ?)',
        [id, imageUrl]
      );
    }

    res.status(200).json({ message: 'Product updated successfully', product: { id, name, price: cleanedPrice, description, imageUrl } });
  } catch (error) {
    console.error('Error during product update:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// API for product registration
app.post('/api/products', async (req, res) => {
  const { name, price, description, imageUrl, authorId } = req.body;

  if (!name || !price || !description || !authorId) {
    return res.status(400).json({ message: 'All fields (name, price, description, authorId) are required' });
  }

  try {
    // Insert product into products table
    const [productResult] = await pool.execute(
      'INSERT INTO products (name, price, description, author_id) VALUES (?, ?, ?, ?)',
      [name, price, description, authorId]
    );

    const productId = (productResult as any).insertId;

    // Insert image URL into product_images table if provided
    if (imageUrl) {
      await pool.execute(
        'INSERT INTO product_images (product_id, image_url) VALUES (?, ?)',
        [productId, imageUrl]
      );
    }

    res.status(201).json({ message: 'Product registered successfully', product: { id: productId, name, price, description, imageUrl } });
  } catch (error) {
    console.error('Error during product registration:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// API for image upload
app.post('/api/upload-image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image file provided' });
  }
  const imageUrl = `/uploads/${req.file.filename}`;
  res.status(200).json({ imageUrl });
});

// Helper function to find or create a chat
async function findOrCreateChat(productId: number, user1Id: number, user2Id: number): Promise<number> {
  // Find the actual seller (author) of the product
  const [productRows]: [any[], any] = await pool.execute('SELECT author_id FROM products WHERE id = ?', [productId]);
  if (!productRows || productRows.length === 0) {
    throw new Error('Product not found');
  }
  const actualSellerId = productRows[0].author_id;

  const sellerId = actualSellerId;
  const buyerId = user1Id === actualSellerId ? user2Id : user1Id;

  // Check if a chat already exists
  const [chats]: [any[], any] = await pool.execute(
    'SELECT id FROM chats WHERE product_id = ? AND seller_id = ? AND buyer_id = ?',
    [productId, sellerId, buyerId]
  );

  if (chats && chats.length > 0) {
    return chats[0].id;
  }

  // Create a new chat if it doesn't exist
  const [result] = await pool.execute(
    'INSERT INTO chats (product_id, seller_id, buyer_id) VALUES (?, ?, ?)',
    [productId, sellerId, buyerId]
  );
  return (result as any).insertId;
}

// API for sending a chat message
app.post('/api/chat/messages', async (req, res) => {
  const { productId, senderId, receiverId, content } = req.body;
  console.log('Received request to /api/chat/messages with body:', req.body);

  if (!productId || !senderId || !receiverId || !content) {
    console.error('Validation failed: Missing required fields.');
    return res.status(400).json({ message: 'All fields are required: productId, senderId, receiverId, content' });
  }

  try {
    // Find or create chat
    console.log(`Searching for chat with productId: ${productId}, users: ${senderId}, ${receiverId}`);
    let [chats] = await pool.execute(
      'SELECT id FROM chats WHERE product_id = ? AND ((seller_id = ? AND buyer_id = ?) OR (seller_id = ? AND buyer_id = ?)) LIMIT 1',
      [productId, senderId, receiverId, receiverId, senderId]
    );
    let chatId;

    if (Array.isArray(chats) && chats.length > 0) {
      chatId = (chats[0] as ChatRow).id;
      console.log(`Found existing chat with id: ${chatId}`);
    } else {
      console.log('No existing chat found. Creating a new one.');
      // Find the actual seller (author) of the product
      const [productRows]: [any[], any] = await pool.execute('SELECT author_id FROM products WHERE id = ?', [productId]);
      if (!Array.isArray(productRows) || productRows.length === 0) {
        console.error(`Product with id ${productId} not found.`);
        return res.status(404).json({ message: 'Product not found' });
      }
      const actualSellerId = productRows[0].author_id;
      console.log(`Product author (seller) is: ${actualSellerId}`);

      // Determine who is the seller and who is the buyer
      const sellerIdForChat = actualSellerId;
      const buyerIdForChat = Number(senderId) === Number(actualSellerId) ? receiverId : senderId;
      console.log(`Assigning seller: ${sellerIdForChat}, buyer: ${buyerIdForChat}`);

      // Create new chat with correct seller and buyer
      const [result]: [any, any] = await pool.execute(
        'INSERT INTO chats (product_id, seller_id, buyer_id) VALUES (?, ?, ?)',
        [productId, sellerIdForChat, buyerIdForChat]
      );
      chatId = result.insertId;
      console.log(`Created new chat with id: ${chatId}`);
    }

    // Insert message
    console.log(`Inserting message into chat ${chatId} from sender ${senderId}`);
    await pool.execute(
      'INSERT INTO messages (chat_id, sender_id, content) VALUES (?, ?, ?)',
      [chatId, senderId, content]
    );

    // Update last_message_at for the chat
    console.log(`Updating timestamp for chat ${chatId}`);
    await pool.execute(
      'UPDATE chats SET last_message_at = CURRENT_TIMESTAMP WHERE id = ?',
      [chatId]
    );

    console.log('Message sent successfully.');
    res.status(201).json({ message: 'Message sent successfully', chatId });
  } catch (error: any) {
    console.error('!!! Critical error in /api/chat/messages !!!');
    console.error('Error object:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// API to get chat history
app.get('/api/chat/messages/:productId/:user1Id/:user2Id', async (req, res) => {
  const { productId, user1Id, user2Id } = req.params;

  try {
    // Find chat
    const [chats] = await pool.execute(
      'SELECT id FROM chats WHERE product_id = ? AND ((seller_id = ? AND buyer_id = ?) OR (seller_id = ? AND buyer_id = ?)) LIMIT 1',
      [productId, user1Id, user2Id, user2Id, user1Id]
    );

    if (!Array.isArray(chats) || chats.length === 0) {
      return res.status(200).json([]); // No chat found, return empty messages
    }

    const chatId = (chats[0] as ChatRow).id;

    // Get messages for the chat
    const [messages] = await pool.execute(
      'SELECT id, sender_id, content, sent_at FROM messages WHERE chat_id = ? ORDER BY sent_at ASC',
      [chatId]
    );

    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// API to delete a product
app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const authHeader = req.headers.authorization; // Get Authorization header
  const authorId = authHeader ? parseInt(authHeader.split(' ')[1], 10) : null; // Extract userId

  if (!authorId) {
    return res.status(401).json({ message: 'Authorization token is missing or invalid' });
  }

  try {
    // Check if product exists and get its author_id and image URLs
    const [productRows]: [any[], any] = await pool.execute('SELECT p.author_id, pi.image_url FROM products p LEFT JOIN product_images pi ON p.id = pi.product_id WHERE p.id = ?', [id]);

    if (!Array.isArray(productRows) || productRows.length === 0 || !productRows[0].author_id) {
      return res.status(404).json({ message: 'Product not found' });
    }
    const existingAuthorId = productRows[0].author_id;

    // Authorization check: ensure the requesting user is the author of the product
    if (existingAuthorId !== authorId) {
      return res.status(403).json({ message: 'You are not authorized to delete this product' });
    }

    // Delete associated image files from the uploads directory
    for (const row of productRows) {
      if (row.image_url) {
        const imagePath = path.join(uploadsDir, path.basename(row.image_url));
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          console.log(`Deleted image file: ${imagePath}`);
        }
      }
    }

    // Delete product from products table (this will cascade delete product_images due to FK)
    await pool.execute('DELETE FROM products WHERE id = ?', [id]);

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error during product deletion:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});