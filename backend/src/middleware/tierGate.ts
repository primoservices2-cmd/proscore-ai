import { Prediction, SubscriptionTier } from '../types';
import { isTierSufficient } from '../utils/tier-comparator';
export const sanitizePrediction = (p: Prediction, role?: string, tier?: SubscriptionTier | null): any => {
  if (role === 'admin') return p;
  if (role === 'subscriber' && tier && isTierSufficient(tier, p.tier_required)) return p;
  return { ...p, exact_score: '🔒', goalscorers: null, total_corners: '🔒', total_fouls: '🔒', asian_handicap: '🔒' };
};
