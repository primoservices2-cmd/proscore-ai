import db from '../config/database';
import { hashPassword, comparePassword } from '../utils/hash';
import { signToken } from '../utils/jwt';

export class AuthService {
  async register(email: string, password: string, displayName?: string) {
    const exists = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (exists.rows.length > 0) throw new Error('EMAIL_EXISTS');
    const passwordHash = await hashPassword(password);
    const result = await db.query(
      "INSERT INTO users (email, password_hash, display_name, role) VALUES ($1, $2, $3, 'free') RETURNING id, email, role, display_name",
      [email.toLowerCase(), passwordHash, displayName || null]
    );
    const user = result.rows[0];
    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    return { user, token };
  }
  async login(email: string, password: string) {
    const result = await db.query('SELECT * FROM users WHERE email = $1 AND is_active = true', [email.toLowerCase()]);
    if (!result.rows[0]) throw new Error('INVALID_CREDENTIALS');
    const user = result.rows[0];
    if (!(await comparePassword(password, user.password_hash))) throw new Error('INVALID_CREDENTIALS');
    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    return { user: { id: user.id, email: user.email, role: user.role, display_name: user.display_name }, token };
  }
  async getProfile(userId: string) {
    const result = await db.query(
      "SELECT u.id, u.email, u.display_name, u.role, s.tier, s.status as sub_status, s.expires_at FROM users u LEFT JOIN subscriptions s ON s.user_id = u.id AND s.status = 'active' WHERE u.id = $1",
      [userId]
    );
    return result.rows[0] || null;
  }
}
export default new AuthService();
