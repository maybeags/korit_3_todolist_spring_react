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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUserFavoriteProducts = exports.removeProductFromFavorites = exports.addProductToFavorites = exports.findFavoriteProduct = exports.deleteProductById = exports.addProductImages = exports.createProductInDb = exports.updateProductById = exports.findProductById = exports.findAllProducts = void 0;
const db_1 = __importDefault(require("../db"));
const findAllProducts = (search, authorId, category, minPrice, maxPrice) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('findAllProducts called');
    let query = `
    SELECT
      p.id, p.name, p.price, p.description, p.status, p.created_at,
      up.nickname AS author, up.location,
      COALESCE(JSON_ARRAYAGG(pi.image_url), '[]') AS images
    FROM products p
    JOIN user_profiles up ON p.author_id = up.user_id
    LEFT JOIN product_images pi ON p.id = pi.product_id
  `;
    const params = [];
    const conditions = [];
    if (search) {
        conditions.push(`(p.name LIKE ? OR p.description LIKE ?)`);
        params.push(`%${search}%`);
        params.push(`%${search}%`);
    }
    if (authorId) {
        conditions.push(`p.author_id = ?`);
        params.push(Number(authorId));
    }
    if (category) {
        conditions.push(`p.category_id = (SELECT id FROM categories WHERE name = ?)`);
        params.push(String(category));
    }
    if (minPrice) {
        conditions.push(`p.price >= ?`);
        params.push(Number(minPrice));
    }
    if (maxPrice) {
        conditions.push(`p.price <= ?`);
        params.push(Number(maxPrice));
    }
    if (conditions.length > 0) {
        query += ` WHERE ` + conditions.join(` AND `);
    }
    query += `
    GROUP BY p.id, p.name, p.price, p.description, p.status, p.created_at, up.nickname, up.location
    ORDER BY p.created_at DESC
  `;
    try {
        console.log('Executing query:', query, 'with params:', params);
        const [rows] = yield db_1.default.execute(query, params);
        console.log('Query executed, rows:', rows);
        return (Array.isArray(rows) ? rows : []).map((product) => (Object.assign(Object.assign({}, product), { images: JSON.parse(product.images) })));
    }
    catch (error) {
        console.error('Error in findAllProducts:', error);
        throw error; // Re-throw the error so the controller can catch it
    }
});
exports.findAllProducts = findAllProducts;
const findProductById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const [rows] = yield db_1.default.execute(`
    SELECT
      p.id, p.name, p.price, p.description, p.status, p.created_at, p.author_id,
      up.nickname AS author, up.location,
      COALESCE(JSON_ARRAYAGG(pi.image_url), '[]') AS images
    FROM products p
    JOIN user_profiles up ON p.author_id = up.user_id
    LEFT JOIN product_images pi ON p.id = pi.product_id
    WHERE p.id = ?
    GROUP BY p.id
  `, [id]);
    const products = Array.isArray(rows) ? rows : [];
    if (products.length === 0) {
        return null;
    }
    const product = Object.assign(Object.assign({}, products[0]), { images: JSON.parse(products[0].images) });
    return product;
});
exports.findProductById = findProductById;
const updateProductById = (id, name, price, description, category_id) => __awaiter(void 0, void 0, void 0, function* () {
    // ... (existing logic)
});
exports.updateProductById = updateProductById;
const createProductInDb = (author_id, category_id, name, price, description) => __awaiter(void 0, void 0, void 0, function* () {
    const [result] = yield db_1.default.execute('INSERT INTO products (author_id, category_id, name, price, description) VALUES (?, ?, ?, ?, ?)', [author_id, category_id, name, price, description]);
    return result.insertId;
});
exports.createProductInDb = createProductInDb;
const addProductImages = (productId, imageUrls) => __awaiter(void 0, void 0, void 0, function* () {
    // ... (existing logic)
});
exports.addProductImages = addProductImages;
const deleteProductById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    // ... (existing logic)
});
exports.deleteProductById = deleteProductById;
const findFavoriteProduct = (userId, productId) => __awaiter(void 0, void 0, void 0, function* () {
    const [rows] = yield db_1.default.execute('SELECT * FROM user_favorites WHERE user_id = ? AND product_id = ?', [userId, productId]);
    return Array.isArray(rows) ? rows[0] : null;
});
exports.findFavoriteProduct = findFavoriteProduct;
const addProductToFavorites = (userId, productId) => __awaiter(void 0, void 0, void 0, function* () {
    yield db_1.default.execute('INSERT INTO user_favorites (user_id, product_id) VALUES (?, ?)', [userId, productId]);
});
exports.addProductToFavorites = addProductToFavorites;
const removeProductFromFavorites = (userId, productId) => __awaiter(void 0, void 0, void 0, function* () {
    const [result] = yield db_1.default.execute('DELETE FROM user_favorites WHERE user_id = ? AND product_id = ?', [userId, productId]);
    return result.affectedRows;
});
exports.removeProductFromFavorites = removeProductFromFavorites;
const findUserFavoriteProducts = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const [rows] = yield db_1.default.execute(`
    SELECT
      p.id, p.name, p.price, p.description, p.status, p.created_at,
      up.nickname AS author, up.location,
      JSON_ARRAYAGG(pi.image_url) AS images
    FROM user_favorites uf
    JOIN products p ON uf.product_id = p.id
    JOIN user_profiles up ON p.author_id = up.user_id
    LEFT JOIN product_images pi ON p.id = pi.product_id
    WHERE uf.user_id = ?
    GROUP BY p.id, p.name, p.price, p.description, p.status, p.created_at, up.nickname, up.location
    ORDER BY uf.created_at DESC
  `, [userId]);
    return (Array.isArray(rows) ? rows : []).map((product) => (Object.assign(Object.assign({}, product), { images: product.images ? JSON.parse(product.images) : [] })));
});
exports.findUserFavoriteProducts = findUserFavoriteProducts;
