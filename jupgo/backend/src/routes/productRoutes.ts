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

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management and listing
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for product name or description
 *       - in: query
 *         name: authorId
 *         schema:
 *           type: integer
 *         description: Filter by author ID
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category name
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price
 *     responses:
 *       200:
 *         description: A list of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   price:
 *                     type: string
 *                   description:
 *                     type: string
 *                   status:
 *                     type: string
 *                   created_at:
 *                     type: string
 *                   author:
 *                     type: string
 *                   location:
 *                     type: string
 *                   images:
 *                     type: array
 *                     items:
 *                       type: string
 *       500:
 *         description: Server error
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - description
 *               - categoryId
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *                 description: URL of the product image (optional)
 *               categoryId:
 *                 type: number
 *     responses:
 *       201:
 *         description: Product registered successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *
 * /products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the product to retrieve
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 price:
 *                   type: string
 *                 description:
 *                   type: string
 *                 status:
 *                   type: string
 *                 created_at:
 *                   type: string
 *                 author:
 *                   type: string
 *                 location:
 *                   type: string
 *                 images:
 *                   type: array
 *                   items:
 *                     type: string
 *                 category_id:
 *                   type: number
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update a product by ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the product to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *                 description: URL of the product image (optional)
 *               categoryId:
 *                 type: number
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found or you are not the author
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete a product by ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the product to delete
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found or you are not the author
 *       500:
 *         description: Server error
 *
 * /upload-image:
 *   post:
 *     summary: Upload a product image
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file to upload
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 imageUrl:
 *                   type: string
 *                   description: URL of the uploaded image
 *       400:
 *         description: No file uploaded
 *       500:
 *         description: Server error
 *
 * /products/{productId}/favorite:
 *   post:
 *     summary: Add a product to user's favorites
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the product to add to favorites
 *     responses:
 *       201:
 *         description: Product added to favorites
 *       400:
 *         description: User ID and Product ID are required
 *       409:
 *         description: Product already in favorites
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Remove a product from user's favorites
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the product to remove from favorites
 *     responses:
 *       200:
 *         description: Product removed from favorites
 *       400:
 *         description: User ID and Product ID are required
 *       404:
 *         description: Favorite not found
 *       500:
 *         description: Server error
 *
 * /users/{userId}/favorites:
 *   get:
 *     summary: Get user's favorite products
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the user to retrieve favorite products for
 *     responses:
 *       200:
 *         description: A list of user's favorite products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   price:
 *                     type: string
 *                   description:
 *                     type: string
 *                   status:
 *                     type: string
 *                   created_at:
 *                     type: string
 *                   author:
 *                     type: string
 *                   location:
 *                     type: string
 *                   images:
 *                     type: array
 *                     items:
 *                       type: string
 *       500:
 *         description: Server error
 */
router.get('/products', getAllProducts);
router.get('/products/:id', getProductById);
router.put('/products/:id', updateProduct);
router.post('/products', createProduct);
router.delete('/products/:id', deleteProduct);

router.post('/products/:productId/favorite', addFavoriteProduct);
router.delete('/products/:productId/favorite', removeFavoriteProduct);
router.get('/users/:userId/favorites', getUserFavoriteProducts);

router.post('/upload-image', upload.array('images'), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
    }
    const imageUrls = (req.files as Express.Multer.File[]).map(file => `/uploads/${file.filename}`);
    res.status(200).json({ imageUrls });
});

export default router;
