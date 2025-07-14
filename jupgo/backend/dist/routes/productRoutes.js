"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const productController_1 = require("../controllers/productController");
const router = (0, express_1.Router)();
// Create uploads directory if it doesn't exist
const uploadsDir = path_1.default.resolve(__dirname, '../../uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
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
router.get('/products', productController_1.getAllProducts);
router.get('/products/:id', productController_1.getProductById);
router.put('/products/:id', productController_1.updateProduct);
router.post('/products', productController_1.createProduct);
router.delete('/products/:id', productController_1.deleteProduct);
router.post('/products/:productId/favorite', productController_1.addFavoriteProduct);
router.delete('/products/:productId/favorite', productController_1.removeFavoriteProduct);
router.get('/users/:userId/favorites', productController_1.getUserFavoriteProducts);
router.post('/upload-image', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    res.status(200).json({ imageUrl: `/uploads/${req.file.filename}` });
});
exports.default = router;
