"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserFavoriteProducts = exports.removeFavoriteProduct = exports.addFavoriteProduct = exports.deleteProduct = exports.createProduct = exports.updateProduct = exports.getProductById = exports.getAllProducts = void 0;
const productRepository_1 = require("../repositories/productRepository");
const getAllProducts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { search, authorId, category, minPrice, maxPrice } = req.query;
    try {
        const products = yield (0, productRepository_1.findAllProducts)(search, Number(authorId), category, Number(minPrice), Number(maxPrice));
        res.status(200).json(products);
    }
    catch (error) {
        next(error);
    }
});
exports.getAllProducts = getAllProducts;
const getProductById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const product = yield (0, productRepository_1.findProductById)(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
    }
    catch (error) {
        next(error);
    }
});
exports.getProductById = getProductById;
const updateProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // ... (existing logic)
});
exports.updateProduct = updateProduct;
const createProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, price, description, imageUrl } = req.body;
    const authorId = req.userId; // From authenticateToken middleware
    if (!authorId) {
        return res.status(401).json({ message: 'Unauthorized: User ID not found.' });
    }
    if (!name || !price || !description) {
        return res.status(400).json({ message: 'Product name, price, and description are required.' });
    }
    try {
        // TODO: Implement category selection in frontend or default category handling
        // For now, using a placeholder category_id (e.g., 1)
        const categoryId = 1; // Placeholder: Replace with actual category logic
        const productId = yield (0, productRepository_1.createProductInDb)(authorId, categoryId, name, price, description);
        if (imageUrl) {
            yield (0, productRepository_1.addProductImages)(productId, [imageUrl]);
        }
        res.status(201).json({ message: 'Product registered successfully', productId });
    }
    catch (error) {
        console.error('Error creating product:', error);
        next(error);
    }
});
exports.createProduct = createProduct;
const deleteProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // ... (existing logic)
});
exports.deleteProduct = deleteProduct;
const addFavoriteProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId } = req.params;
    const userId = req.userId; // Get userId from authenticated request
    if (!userId || !productId) {
        return res.status(400).json({ message: 'User ID and Product ID are required' });
    }
    try {
        const existingFavorite = yield (0, productRepository_1.findFavoriteProduct)(userId, productId);
        if (existingFavorite) {
            return res.status(409).json({ message: 'Product already in favorites' });
        }
        yield (0, productRepository_1.addProductToFavorites)(userId, productId);
        res.status(201).json({ message: 'Product added to favorites' });
    }
    catch (error) {
        next(error);
    }
});
exports.addFavoriteProduct = addFavoriteProduct;
const removeFavoriteProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId } = req.params;
    const userId = req.userId; // Get userId from authenticated request
    if (!userId || !productId) {
        return res.status(400).json({ message: 'User ID and Product ID are required' });
    }
    try {
        const affectedRows = yield (0, productRepository_1.removeProductFromFavorites)(userId, productId);
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Favorite not found' });
        }
        res.status(200).json({ message: 'Product removed from favorites' });
    }
    catch (error) {
        next(error);
    }
});
exports.removeFavoriteProduct = removeFavoriteProduct;
const getUserFavoriteProducts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const favoriteProducts = yield (0, productRepository_1.findUserFavoriteProducts)(Number(userId));
        res.status(200).json(favoriteProducts);
    }
    catch (error) {
        next(error);
    }
});
exports.getUserFavoriteProducts = getUserFavoriteProducts;
