export type UserRole = 'free' | 'subscriber' | 'admin';
export type SubscriptionTier = 'silver' | 'gold' | 'vip';
export type Sport = 'football' | 'basketball' | 'tennis' | 'hockey' | 'american_football';
export type MatchStatus = 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled';
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'pending';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  display_name: string | null;
  role: UserRole;
  stripe_customer_id: string | null;
  is_active: boolean;
  created_at: Date;
}

export interface Prediction {
  id: string;
  match_id: string;
  tier_required: SubscriptionTier;
  final_result: string | null;
  exact_score: string | null;
  total_goals_points: string | null;
  total_corners: string | null;
  total_fouls: string | null;
  goalscorers: string[] | null;
  both_teams_score: string | null;
  confidence_pct: number;
  is_winning: boolean | null;
  analyst_note: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export const TIER_HIERARCHY: Record<SubscriptionTier, number> = { silver: 1, gold: 2, vip: 3 };
