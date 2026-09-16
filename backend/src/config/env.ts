import dotenv from 'dotenv';
dotenv.config();
export const ENV = {
  PORT: parseInt(process.env.PORT || '4000', 10),
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-jwt-secret-key-32-chars',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  STRIPE_PRICE_SILVER: process.env.STRIPE_PRICE_SILVER || '',
  STRIPE_PRICE_GOLD: process.env.STRIPE_PRICE_GOLD || '',
  STRIPE_PRICE_VIP: process.env.STRIPE_PRICE_VIP || '',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
} as const;
