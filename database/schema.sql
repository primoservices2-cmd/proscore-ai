-- ============================================================
-- PROSCORE AI — SCHEMA COMPLET POUR SUPABASE
-- ============================================================

DO $$ BEGIN CREATE TYPE enum_role AS ENUM ('free', 'subscriber', 'admin'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE enum_tier AS ENUM ('silver', 'gold', 'vip'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE enum_sport AS ENUM ('football', 'basketball', 'tennis', 'hockey', 'american_football'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE enum_match_status AS ENUM ('scheduled', 'live', 'finished', 'postponed', 'cancelled'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE enum_subscription_status AS ENUM ('active', 'expired', 'cancelled', 'pending'); EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    role enum_role NOT NULL DEFAULT 'free',
    stripe_customer_id VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tier enum_tier NOT NULL,
    status enum_subscription_status NOT NULL DEFAULT 'pending',
    price_paid DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    stripe_session_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    payment_ref VARCHAR(255),
    starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leagues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sport enum_sport NOT NULL,
    name VARCHAR(255) NOT NULL,
    country VARCHAR(100),
    confederation VARCHAR(100),
    tier_level SMALLINT NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(sport, name)
);

CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sport enum_sport NOT NULL,
    league_id UUID REFERENCES leagues(id) ON DELETE SET NULL,
    league_name VARCHAR(255) NOT NULL,
    team_home VARCHAR(255) NOT NULL,
    team_away VARCHAR(255) NOT NULL,
    match_date TIMESTAMPTZ NOT NULL,
    status enum_match_status NOT NULL DEFAULT 'scheduled',
    score_home SMALLINT,
    score_away SMALLINT,
    external_ref VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE UNIQUE,
    tier_required enum_tier NOT NULL DEFAULT 'silver',
    final_result VARCHAR(10),
    exact_score VARCHAR(10),
    total_goals_points VARCHAR(50),
    total_corners VARCHAR(50),
    total_fouls VARCHAR(50),
    goalscorers JSONB,
    both_teams_score VARCHAR(5),
    half_time_result VARCHAR(10),
    double_chance VARCHAR(10),
    asian_handicap VARCHAR(50),
    confidence_pct SMALLINT DEFAULT 0 CHECK (confidence_pct BETWEEN 0 AND 100),
    is_winning BOOLEAN,
    settled_at TIMESTAMPTZ,
    analyst_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    target_table VARCHAR(50),
    target_id UUID,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SEED DES LIGUES (Échantillon représentatif)
INSERT INTO leagues (sport, name, country, confederation, tier_level) VALUES
('football','UEFA Champions League',NULL,'UEFA',1),
('football','English Premier League','England','UEFA',1),
('football','La Liga','Spain','UEFA',1),
('football','Bundesliga','Germany','UEFA',1),
('football','Serie A','Italy','UEFA',1),
('football','Ligue 1','France','UEFA',1),
('football','CAF Champions League',NULL,'CAF',1),
('football','Copa Libertadores',NULL,'CONMEBOL',1),
('basketball','NBA','USA',NULL,1),
('basketball','EuroLeague',NULL,'FIBA Europe',1),
('tennis','Wimbledon','England','Grand Slam',1),
('tennis','French Open','France','Grand Slam',1),
('hockey','NHL','USA/Canada',NULL,1),
('american_football','NFL','USA',NULL,1)
ON CONFLICT (sport, name) DO NOTHING;
