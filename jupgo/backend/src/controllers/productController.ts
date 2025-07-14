import { Request, Response, NextFunction } from 'express';
import { 
  findAllProducts, 
  findProductById, 
  updateProductById, 
  createProductInDb, 
  addProductImages, 
  deleteProductById, 
  findFavoriteProduct, 
  addProductToFavorites, 
  removeProductFromFavorites, 
  findUserFavoriteProducts 
} from '../repositories/productRepository';

interface AuthRequest extends Request {
  userId?: number;
}

export const getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
  const { search, authorId, category, minPrice, maxPrice } = req.query;

  try {
    const products = await findAllProducts(search as string, Number(authorId), category as string, Number(minPrice), Number(maxPrice));
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  try {
    const product = await findProductById(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { name, price, description, imageUrls, categoryId } = req.body; // Add imageUrls
  const userId = req.userId; // From authenticateToken middleware

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized: User ID not found.' });
  }

  if (!name || !price || !description || !categoryId) {
    return res.status(400).json({ message: 'Product name, price, description, and category are required.' });
  }

  try {
    const affectedRows = await updateProductById(id, userId, name, price, description, categoryId);

    if (affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found or you are not the author.' });
    }

    // Handle image updates: For simplicity, we'll just add new images.
    // A more robust solution would involve deleting existing images first.
    if (imageUrls && imageUrls.length > 0) {
        await addProductImages(Number(id), imageUrls); // Assuming id can be converted to number for addProductImages
    }

    res.status(200).json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating product:', error);
    next(error);
  }
};

export const createProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { name, price, description, imageUrls, categoryId } = req.body; // Add categoryId
    const authorId = req.userId; // From authenticateToken middleware

    if (!authorId) {
        return res.status(401).json({ message: 'Unauthorized: User ID not found.' });
    }

    // Add categoryId to the validation
    if (!name || !price || !description || !categoryId) {
        return res.status(400).json({ message: 'Product name, price, description, and category are required.' });
    }

    try {
        // The categoryId is now received from the request body
        const productId = await createProductInDb(authorId, categoryId, name, price, description);
        console.log('Product created in DB with ID:', productId); // Add this log

        if (imageUrls && imageUrls.length > 0) {
            await addProductImages(productId, imageUrls);
        }

        res.status(201).json({ message: 'Product registered successfully', productId });
    } catch (error) {
        console.error('Error creating product:', error);
        next(error);
    }
};

export const deleteProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = req.userId; // From authenticateToken middleware

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized: User ID not found.' });
  }

  try {
    const affectedRows = await deleteProductById(id, userId);

    if (affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found or you are not the author.' });
    }

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    next(error);
  }
};

export const addFavoriteProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { productId } = req.params;
  const userId = req.userId; // Get userId from authenticated request

  if (!userId || !productId) {
    return res.status(400).json({ message: 'User ID and Product ID are required' });
  }

  try {
    const existingFavorite = await findFavoriteProduct(userId, productId);

    if (existingFavorite) {
      return res.status(409).json({ message: 'Product already in favorites' });
    }

    await addProductToFavorites(userId, productId);
    res.status(201).json({ message: 'Product added to favorites' });
  } catch (error) {
    next(error);
  }
};

export const removeFavoriteProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { productId } = req.params;
  const userId = req.userId; // Get userId from authenticated request

  if (!userId || !productId) {
    return res.status(400).json({ message: 'User ID and Product ID are required' });
  }

  try {
    const affectedRows = await removeProductFromFavorites(userId, productId);

    if (affectedRows === 0) {
      return res.status(404).json({ message: 'Favorite not found' });
    }

    res.status(200).json({ message: 'Product removed from favorites' });
  } catch (error) {
    next(error);
  }
};

export const getUserFavoriteProducts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { userId } = req.params;

  try {
    const favoriteProducts = await findUserFavoriteProducts(Number(userId));

    res.status(200).json(favoriteProducts);
  } catch (error) {
    next(error);
  }
};

