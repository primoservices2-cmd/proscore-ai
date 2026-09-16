import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import { JWTPayload } from '../types';
export const signToken = (payload: JWTPayload) => jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: ENV.JWT_EXPIRES_IN });
export const verifyToken = (token: string) => jwt.verify(token, ENV.JWT_SECRET) as JWTPayload;
