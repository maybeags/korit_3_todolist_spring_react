import { Request, Response, NextFunction } from 'express';
import { findUserProfileById, updateUserProfileById } from '../repositories/userRepository';

interface AuthRequest extends Request {
  userId?: number;
}

export const getUserProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { userId } = req.params;

  try {
    const user = await findUserProfileById(Number(userId));

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const updateUserProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { nickname, location, profileImage } = req.body;
  const userId = req.userId; // Get userId from authenticated request

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const user = await findUserProfileById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await updateUserProfileById(userId, nickname, location, profileImage);

    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    next(error);
  }
};
