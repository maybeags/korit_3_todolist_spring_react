import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

interface AuthRequest extends Request {
  userId?: number;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  console.log('authenticateToken middleware entered for path:', req.path);
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    console.log('Authentication token not provided.');
    return res.status(401).json({ message: 'Authentication token required' });
  }

  console.log('Token received (first 10 chars):', token.substring(0, 10), '...');

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('JWT_SECRET is not defined in environment variables.');
    return res.status(500).json({ message: 'Server configuration error.' });
  }

  console.log('Attempting to verify token with JWT_SECRET (first 5 chars):', jwtSecret.substring(0, 5));

  jwt.verify(token, jwtSecret, (err: any, user: any) => {
    if (err) {
      console.error('JWT verification error:', err);
      console.error('Full JWT error object:', err); // Log full error object
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    console.log('JWT verification successful for user ID:', user.id);
    req.userId = user.id;
    next();
  });
};
