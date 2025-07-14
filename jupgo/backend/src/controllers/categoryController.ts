import { Request, Response, NextFunction } from 'express';
import { findAllCategories } from '../repositories/categoryRepository';

export const getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await findAllCategories();
    res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
};
