import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import db from '../config/database';
import { JWTPayload } from '../types';

declare global { namespace Express { interface Request { user?: JWTPayload; subscription?: any; } } }

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) { res.status(401).json({ error: 'Auth token required' }); return; }
    const payload = verifyToken(auth.split(' ')[1]);
    const u = await db.query('SELECT id, email, role, is_active FROM users WHERE id=$1', [payload.userId]);
    if (!u.rows[0]?.is_active) { res.status(401).json({ error: 'Invalid user' }); return; }
    req.user = { userId: u.rows[0].id, email: u.rows[0].email, role: u.rows[0].role };
    const s = await db.query("SELECT * FROM subscriptions WHERE user_id=$1 AND status='active' ORDER BY expires_at DESC LIMIT 1", [req.user.userId]);
    req.subscription = s.rows[0] || null;
    next();
  } catch { res.status(401).json({ error: 'Unauthorized' }); }
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) { next(); return; }
    const payload = verifyToken(auth.split(' ')[1]);
    const u = await db.query('SELECT id, email, role, is_active FROM users WHERE id=$1', [payload.userId]);
    if (u.rows[0]?.is_active) {
      req.user = { userId: u.rows[0].id, email: u.rows[0].email, role: u.rows[0].role };
      const s = await db.query("SELECT * FROM subscriptions WHERE user_id=$1 AND status='active' ORDER BY expires_at DESC LIMIT 1", [req.user.userId]);
      req.subscription = s.rows[0] || null;
    }
    next();
  } catch { next(); }
};
