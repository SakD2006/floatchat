import { db } from "../server";
import bcrypt from "bcrypt";

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  password_hash: string;
  created_at: Date;
}

export async function createUser(
  name: string,
  username: string,
  email: string,
  password: string
): Promise<User | null> {
  const password_hash = await bcrypt.hash(password, 10);
  const result = await db.query(
    `INSERT INTO users (name, username, email, password_hash, created_at)
     VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
    [name, username, email, password_hash]
  );
  return result.rows[0] || null;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await db.query(`SELECT * FROM users WHERE email = $1`, [
    email,
  ]);
  return result.rows[0] || null;
}

export async function findUserByUsername(
  username: string
): Promise<User | null> {
  const result = await db.query(`SELECT * FROM users WHERE username = $1`, [
    username,
  ]);
  return result.rows[0] || null;
}

export async function validatePassword(
  user: User,
  password: string
): Promise<boolean> {
  return bcrypt.compare(password, user.password_hash);
}
