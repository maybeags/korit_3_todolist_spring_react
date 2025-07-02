import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// In-memory user storage (for demonstration purposes)
interface User {
  id: number;
  email: string;
  passwordHash: string;
}

const users: User[] = [];
let userIdCounter = 1;

// In-memory product storage (for demonstration purposes)
interface Product {
  id: string;
  name: string;
  price: string;
  description: string;
  images: string[];
  author: string;
  location: string;
}

const products: Product[] = [
  {
    id: '1',
    name: '상품명 1',
    price: '10,000원',
    description: '상품 1 설명입니다.',
    images: ['https://via.placeholder.com/300/FF5733/FFFFFF?text=Product+1'],
    author: '판매자1',
    location: '강남구',
  },
  {
    id: '2',
    name: '상품명 2',
    price: '25,000원',
    description: '상품 2 설명입니다.',
    images: ['https://via.placeholder.com/300/33FF57/FFFFFF?text=Product+2'],
    author: '판매자2',
    location: '서초구',
  },
  {
    id: '3',
    name: '상품명 3',
    price: '5,000원',
    description: '상품 3 설명입니다.',
    images: ['https://via.placeholder.com/300/3357FF/FFFFFF?text=Product+3'],
    author: '판매자3',
    location: '송파구',
  },
];

// API for user registration
app.post('/api/signup', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const existingUser = users.find(user => user.email === email);
  if (existingUser) {
    return res.status(409).json({ message: 'User with this email already exists' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser: User = {
      id: userIdCounter++,
      email,
      passwordHash,
    };
    users.push(newUser);

    res.status(201).json({ message: 'User registered successfully', user: { id: newUser.id, email: newUser.email } });
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

  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  try {
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.status(200).json({ message: 'Signed in successfully', user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error('Error during signin:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// API to get all products
app.get('/api/products', (req, res) => {
  res.status(200).json(products);
});

// API to get a single product by ID
app.get('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const product = products.find(p => p.id === id);

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  res.status(200).json(product);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});