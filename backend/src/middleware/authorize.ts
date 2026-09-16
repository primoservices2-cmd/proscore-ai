import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types';
export const authorize = (...roles: UserRole[]) => (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user || !roles.includes(req.user.role)) { res.status(403).json({ error: 'Forbidden' }); return; }
  next();
};
