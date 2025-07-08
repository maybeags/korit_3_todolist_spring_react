import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { findUserByEmail, createUser, createUserProfile, findUserProfileById } from '../repositories/userRepository';

dotenv.config();

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const userId = await createUser(email, passwordHash);

    await createUserProfile(userId, `User${userId}`, 'Unknown');

    res.status(201).json({ message: 'User registered successfully', user: { id: userId, email: email } });
  } catch (error) {
    next(error);
  }
};

export const signin = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const userProfile = await findUserProfileById(user.id);
    
    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    const token = jwt.sign({ id: user.id }, jwtSecret, { expiresIn: '1h' });

    res.status(200).json({ message: 'Signed in successfully', user: { id: user.id, email: email, nickname: userProfile?.nickname || null, location: userProfile?.location || null, profileImage: userProfile?.profile_image_url || null }, token });
  } catch (error) {
    next(error);
  }
};
