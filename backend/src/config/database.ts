import { Pool } from 'pg';
import { ENV } from './env';
const pool = new Pool({
  connectionString: ENV.DATABASE_URL,
  ssl: ENV.DATABASE_URL.includes('supabase') || ENV.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});
export const db = {
  query: (text: string, params?: any[]) => pool.query(text, params),
  getClient: () => pool.connect(),
  pool,
};
export default db;
