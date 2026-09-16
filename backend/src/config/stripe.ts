import Stripe from 'stripe';
import { ENV } from './env';
export const stripe = new Stripe(ENV.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16' as any,
  typescript: true,
});
export const STRIPE_PRICES: Record<string, { priceId: string; amount: number; tier: string }> = {
  silver: { priceId: ENV.STRIPE_PRICE_SILVER, amount: 1900, tier: 'silver' },
  gold: { priceId: ENV.STRIPE_PRICE_GOLD, amount: 3900, tier: 'gold' },
  vip: { priceId: ENV.STRIPE_PRICE_VIP, amount: 7900, tier: 'vip' },
};
export default stripe;
