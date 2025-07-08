import pool from '../db';
import { RowDataPacket } from 'mysql2/promise';

interface User extends RowDataPacket {
  id: number;
  password_hash: string;
}

interface UserProfile extends RowDataPacket {
  email: string;
  nickname: string;
  location: string;
  profile_image_url: string | null;
}

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const [rows] = await pool.execute<User[]>('SELECT id, password_hash FROM users WHERE email = ?', [email]);
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
};

export const createUser = async (email: string, passwordHash: string) => {
  const [result] = await pool.execute(
    'INSERT INTO users (email, password_hash) VALUES (?, ?)',
    [email, passwordHash]
  );
  return (result as any).insertId;
};

export const createUserProfile = async (userId: number, nickname: string, location: string) => {
  await pool.execute(
    'INSERT INTO user_profiles (user_id, nickname, location) VALUES (?, ?, ?)',
    [userId, nickname, location]
  );
};

export const findUserProfileById = async (userId: number): Promise<UserProfile | null> => {
  const [rows] = await pool.execute<UserProfile[]>('SELECT u.email, up.nickname, up.location, up.profile_image_url FROM users u JOIN user_profiles up ON u.id = up.user_id WHERE u.id = ?', [userId]);
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
};

export const updateUserProfileById = async (userId: number, nickname: string, location: string, profileImage: string | null) => {
  await pool.execute(
    'UPDATE user_profiles SET nickname = ?, location = ?, profile_image_url = ? WHERE user_id = ?',
    [nickname, location, profileImage, userId]
  );
};
