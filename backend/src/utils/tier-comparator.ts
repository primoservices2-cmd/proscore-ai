import { SubscriptionTier, TIER_HIERARCHY } from '../types';
export const isTierSufficient = (userTier: SubscriptionTier, requiredTier: SubscriptionTier) =>
  TIER_HIERARCHY[userTier] >= TIER_HIERARCHY[requiredTier];
