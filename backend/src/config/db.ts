import { Pool } from "pg";
import * as dotenv from 'dotenv';
dotenv.config();

// Configure a shared Postgres pool for repository access.
export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});