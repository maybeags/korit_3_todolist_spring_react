import pool from '../db';
import { RowDataPacket } from 'mysql2/promise';

interface Product extends RowDataPacket {
  id: string;
  name: string;
  price: string;
  description: string;
  status: string;
  created_at: string;
  author: string;
  location: string;
  images: string; // This will be a JSON string from JSON_ARRAYAGG
}

export const findAllProducts = async (search?: string, authorId?: number, category?: string, minPrice?: number, maxPrice?: number): Promise<Product[]> => {
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
  const params: (string | number)[] = [];
  const conditions: string[] = [];

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
    const [rows] = await pool.execute<Product[]>(query, params);
    console.log('Query executed, rows:', rows);
    return (Array.isArray(rows) ? rows : []).map((product) => ({
      ...product,
      images: JSON.parse(product.images),
    }));
  } catch (error) {
    console.error('Error in findAllProducts:', error);
    throw error; // Re-throw the error so the controller can catch it
  }
};

export const findProductById = async (id: string): Promise<Product | null> => {
  const [rows] = await pool.execute<Product[]>(`
    SELECT
      p.id, p.name, p.price, p.description, p.status, p.created_at, p.author_id, p.category_id,
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

  const product: Product = {
      ...products[0],
      images: JSON.parse(products[0].images),
  };
  return product;
};

export const updateProductById = async (id: string, authorId: number, name: string, price: string, description: string, category_id: number) => {
  const [result]: [any, any] = await pool.execute(
    'UPDATE products SET name = ?, price = ?, description = ?, category_id = ? WHERE id = ? AND author_id = ?',
    [name, price, description, category_id, id, authorId]
  );
  return result.affectedRows;
};

export const createProductInDb = async (author_id: number, category_id: number, name: string, price: string, description: string): Promise<number> => {
  const [result] = await pool.execute(
    'INSERT INTO products (author_id, category_id, name, price, description) VALUES (?, ?, ?, ?, ?)',
    [author_id, category_id, name, price, description]
  );
  return (result as any).insertId;
};

export const addProductImages = async (productId: number, imageUrls: string[]) => {
  if (imageUrls.length === 0) {
    return; // No images to add
  }

  const values = imageUrls.map((url, index) => `(?, ?, ?)`).join(', ');
  const params: (string | number)[] = [];
  imageUrls.forEach((url, index) => {
    params.push(productId);
    params.push(url);
    params.push(index); // order_index
  });

  const query = `INSERT INTO product_images (product_id, image_url, order_index) VALUES ${values}`;

  try {
    await pool.execute(query, params);
  } catch (error) {
    console.error('Error in addProductImages:', error);
    throw error;
  }
};

export const deleteProductById = async (id: string, authorId: number) => {
  const [result]: [any, any] = await pool.execute(
    'DELETE FROM products WHERE id = ? AND author_id = ?',
    [id, authorId]
  );
  return result.affectedRows;
};

export const findFavoriteProduct = async (userId: number, productId: string) => {
  const [rows] = await pool.execute(
    'SELECT * FROM user_favorites WHERE user_id = ? AND product_id = ?',
    [userId, productId]
  );
  return Array.isArray(rows) ? rows[0] : null;
};

export const addProductToFavorites = async (userId: number, productId: string) => {
  await pool.execute(
    'INSERT INTO user_favorites (user_id, product_id) VALUES (?, ?)',
    [userId, productId]
  );
};

export const removeProductFromFavorites = async (userId: number, productId: string) => {
  const [result]: [any, any] = await pool.execute(
    'DELETE FROM user_favorites WHERE user_id = ? AND product_id = ?',
    [userId, productId]
  );
  return result.affectedRows;
};

export const findUserFavoriteProducts = async (userId: number) => {
  const [rows] = await pool.execute(`
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

  return (Array.isArray(rows) ? rows : []).map((product: any) => ({
    ...product,
    images: product.images ? JSON.parse(product.images) : [],
  }));
};
