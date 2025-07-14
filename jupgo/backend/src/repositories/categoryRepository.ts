import pool from '../db';

export const findAllCategories = async () => {
  try {
    const [rows] = await pool.execute('SELECT id, name FROM categories ORDER BY id ASC');
    return rows;
  } catch (error) {
    console.error('Error in findAllCategories:', error);
    throw error;
  }
};
