import { pool } from "../config/db";

export interface User {
    id: number;
    email: string;
}

export class UserRepository {
    async upsertUser(email: string): Promise<User> {
        const query = `
            INSERT INTO users (email) 
            VALUES ($1) 
            ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
            RETURNING id, email;
        `;
        
        const result = await pool.query(query, [email]);
        return result.rows[0];
    }

    async getUserByEmail(email: string): Promise<User | null> {
        const query = `SELECT id, email FROM users WHERE email = $1`;
        const result = await pool.query(query, [email]);
        return result.rows[0] || null;
    }

    async getUserById(id: number): Promise<User | null> {
        const query = `SELECT id, email FROM users WHERE id = $1`;
        const result = await pool.query(query, [id]);
        return result.rows[0] || null;
    }
}

export const userRepository = new UserRepository();
