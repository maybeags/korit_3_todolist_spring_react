import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  getAllProducts,
  getProductById,
  updateProduct,
  createProduct,
  deleteProduct,
  addFavoriteProduct,
  removeFavoriteProduct,
  getUserFavoriteProducts,
} from '../controllers/productController';

const router = Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

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

router.get('/products', getAllProducts);
router.get('/products/:id', getProductById);
router.put('/products/:id', updateProduct);
router.post('/products', createProduct);
router.delete('/products/:id', deleteProduct);

router.post('/products/:productId/favorite', addFavoriteProduct);
router.delete('/products/:productId/favorite', removeFavoriteProduct);
router.get('/users/:userId/favorites', getUserFavoriteProducts);

router.post('/upload-image', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    res.status(200).json({ imageUrl: `/uploads/${req.file.filename}` });
});

export default router;
