import bcrypt from 'bcryptjs';
import { ENV } from '../config/env';
export const hashPassword = (p: string) => bcrypt.hash(p, ENV.BCRYPT_ROUNDS);
export const comparePassword = (p: string, h: string) => bcrypt.compare(p, h);
