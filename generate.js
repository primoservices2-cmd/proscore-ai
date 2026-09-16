// generate.js — Générateur automatique ProScore AI
const fs = require('fs');
const path = require('path');

console.log('🚀 Début de la génération de ProScore AI...\n');

// 1. Définition de l'arborescence des dossiers
const dirs = [
  'database',
  'backend/src/config',
  'backend/src/middleware',
  'backend/src/routes',
  'backend/src/controllers',
  'backend/src/services',
  'backend/src/cron',
  'backend/src/utils',
  'backend/src/types',
  'frontend/src/app/admin/predictions',
  'frontend/src/app/admin/users',
  'frontend/src/app/auth/login',
  'frontend/src/app/auth/register',
  'frontend/src/app/dashboard',
  'frontend/src/app/subscribe/success',
  'frontend/src/app/subscribe/cancel',
  'frontend/src/components/admin',
  'frontend/src/components/auth',
  'frontend/src/components/dashboard',
  'frontend/src/components/layout',
  'frontend/src/components/ui',
  'frontend/src/i18n/locales',
  'frontend/src/lib',
  'frontend/src/types'
];

dirs.forEach(d => {
  const dirPath = path.join(__dirname, d);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Dossier créé : ${d}`);
  }
});

// 2. Dictionnaire des fichiers et de leur contenu
const files = {
  // --- RACINE ---
  '.gitignore': `node_modules/\ndist/\n.next/\n.env\n.env.local\n*.log\n.DS_Store\n.vercel\n`,
  
  'README.md': `# ProScore AI ⚽🏀🎾🏒🏈\n\nPlateforme SaaS de pronostics sportifs alimentée par IA, multi-sports, multi-langues, avec gestion des abonnements Stripe et contrôle d'accès par paliers (Silver, Gold, VIP).\n\n## Déploiement\n- **Frontend** : Next.js 14 sur Vercel\n- **Backend** : Node.js Express sur Render\n- **Database** : PostgreSQL sur Supabase\n`,

  // --- DATABASE ---
  'database/schema.sql': `-- Schema SQL complet ProScore AI (Supabase / PostgreSQL)
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
`,

  // --- BACKEND ---
  'backend/package.json': JSON.stringify({
    name: "proscore-ai-backend",
    version: "1.0.0",
    private: true,
    scripts: {
      dev: "tsx watch src/server.ts",
      build: "tsc",
      start: "node dist/server.js"
    },
    dependencies: {
      express: "^4.18.2",
      pg: "^8.12.0",
      bcryptjs: "^2.4.3",
      jsonwebtoken: "^9.0.2",
      cors: "^2.8.5",
      helmet: "^7.1.0",
      "express-rate-limit": "^7.1.4",
      "node-cron": "^3.0.3",
      stripe: "^14.14.0",
      zod: "^3.22.4",
      uuid: "^9.0.0",
      dotenv: "^16.3.1"
    },
    devDependencies: {
      "@types/express": "^4.17.21",
      "@types/pg": "^8.10.9",
      "@types/bcryptjs": "^2.4.6",
      "@types/jsonwebtoken": "^9.0.5",
      "@types/cors": "^2.8.17",
      "@types/node-cron": "^3.0.11",
      "@types/uuid": "^9.0.7",
      tsx: "^4.7.0",
      typescript: "^5.3.3"
    }
  }, null, 2),

  'backend/tsconfig.json': JSON.stringify({
    compilerOptions: {
      target: "ES2022",
      module: "commonjs",
      lib: ["ES2022"],
      outDir: "./dist",
      rootDir: "./src",
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      resolveJsonModule: true,
      declaration: true,
      sourceMap: true
    },
    include: ["src/**/*"],
    exclude: ["node_modules", "dist"]
  }, null, 2),

  'backend/.env.example': `PORT=4000\nDATABASE_URL=postgresql://postgres:password@localhost:5432/proscore_ai\nJWT_SECRET=super_secret_jwt_key_32_chars_min\nJWT_EXPIRES_IN=7d\nBCRYPT_ROUNDS=12\nCORS_ORIGIN=http://localhost:3000\nNODE_ENV=development\nSTRIPE_SECRET_KEY=sk_test_xxx\nSTRIPE_WEBHOOK_SECRET=whsec_xxx\nSTRIPE_PRICE_SILVER=price_xxx\nSTRIPE_PRICE_GOLD=price_xxx\nSTRIPE_PRICE_VIP=price_xxx\nFRONTEND_URL=http://localhost:3000\n`,

  'backend/src/config/env.ts': `import dotenv from 'dotenv';\ndotenv.config();\nexport const ENV = {\n  PORT: parseInt(process.env.PORT || '4000', 10),\n  DATABASE_URL: process.env.DATABASE_URL || '',\n  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-key-12345',\n  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',\n  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),\n  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',\n  NODE_ENV: process.env.NODE_ENV || 'development',\n  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',\n  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',\n  STRIPE_PRICE_SILVER: process.env.STRIPE_PRICE_SILVER || '',\n  STRIPE_PRICE_GOLD: process.env.STRIPE_PRICE_GOLD || '',\n  STRIPE_PRICE_VIP: process.env.STRIPE_PRICE_VIP || '',\n  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',\n} as const;\n`,

  'backend/src/config/database.ts': `import { Pool } from 'pg';\nimport { ENV } from './env';\nconst pool = new Pool({\n  connectionString: ENV.DATABASE_URL,\n  ssl: ENV.DATABASE_URL.includes('supabase') || ENV.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,\n});\nexport const db = {\n  query: (text: string, params?: any[]) => pool.query(text, params),\n  getClient: () => pool.connect(),\n  pool,\n};\nexport default db;\n`,

  'backend/src/config/stripe.ts': `import Stripe from 'stripe';\nimport { ENV } from './env';\nexport const stripe = new Stripe(ENV.STRIPE_SECRET_KEY, {\n  apiVersion: '2023-10-16' as any,\n  typescript: true,\n});\nexport const STRIPE_PRICES: Record<string, { priceId: string; amount: number; tier: string }> = {\n  silver: { priceId: ENV.STRIPE_PRICE_SILVER, amount: 1900, tier: 'silver' },\n  gold: { priceId: ENV.STRIPE_PRICE_GOLD, amount: 3900, tier: 'gold' },\n  vip: { priceId: ENV.STRIPE_PRICE_VIP, amount: 7900, tier: 'vip' },\n};\nexport default stripe;\n`,

  'backend/src/types/index.ts': `export type UserRole = 'free' | 'subscriber' | 'admin';\nexport type SubscriptionTier = 'silver' | 'gold' | 'vip';\nexport type Sport = 'football' | 'basketball' | 'tennis' | 'hockey' | 'american_football';\nexport type MatchStatus = 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled';\nexport type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'pending';\nexport interface User {\n  id: string;\n  email: string;\n  password_hash: string;\n  display_name: string | null;\n  role: UserRole;\n  stripe_customer_id: string | null;\n  is_active: boolean;\n  created_at: Date;\n}\nexport interface Prediction {\n  id: string;\n  match_id: string;\n  tier_required: SubscriptionTier;\n  final_result: string | null;\n  exact_score: string | null;\n  total_goals_points: string | null;\n  total_corners: string | null;\n  total_fouls: string | null;\n  goalscorers: string[] | null;\n  both_teams_score: string | null;\n  half_time_result: string | null;\n  double_chance: string | null;\n  asian_handicap: string | null;\n  confidence_pct: number;\n  is_winning: boolean | null;\n  analyst_note: string | null;\n  created_at: Date;\n  updated_at: Date;\n}\nexport interface JWTPayload {\n  userId: string;\n  email: string;\n  role: UserRole;\n}\nexport const TIER_HIERARCHY: Record<SubscriptionTier, number> = {\n  silver: 1,\n  gold: 2,\n  vip: 3,\n};\n`,

  'backend/src/utils/hash.ts': `import bcrypt from 'bcryptjs';\nimport { ENV } from '../config/env';\nexport const hashPassword = (p: string) => bcrypt.hash(p, ENV.BCRYPT_ROUNDS);\nexport const comparePassword = (p: string, h: string) => bcrypt.compare(p, h);\n`,

  'backend/src/utils/jwt.ts': `import jwt from 'jsonwebtoken';\nimport { ENV } from '../config/env';\nimport { JWTPayload } from '../types';\nexport const signToken = (payload: JWTPayload) => jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: ENV.JWT_EXPIRES_IN });\nexport const verifyToken = (token: string) => jwt.verify(token, ENV.JWT_SECRET) as JWTPayload;\n`,

  'backend/src/utils/tier-comparator.ts': `import { SubscriptionTier, TIER_HIERARCHY } from '../types';\nexport const isTierSufficient = (userTier: SubscriptionTier, requiredTier: SubscriptionTier) => TIER_HIERARCHY[userTier] >= TIER_HIERARCHY[requiredTier];\n`,

  'backend/src/middleware/authenticate.ts': `import { Request, Response, NextFunction } from 'express';\nimport { verifyToken } from '../utils/jwt';\nimport db from '../config/database';\nimport { JWTPayload } from '../types';\ndeclare global { namespace Express { interface Request { user?: JWTPayload; subscription?: any; } } }\nexport const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {\n  try {\n    const auth = req.headers.authorization;\n    if (!auth?.startsWith('Bearer ')) { res.status(401).json({ error: 'Auth token required' }); return; }\n    const payload = verifyToken(auth.split(' ')[1]);\n    const u = await db.query('SELECT id, email, role, is_active FROM users WHERE id=$1', [payload.userId]);\n    if (!u.rows[0]?.is_active) { res.status(401).json({ error: 'Invalid user' }); return; }\n    req.user = { userId: u.rows[0].id, email: u.rows[0].email, role: u.rows[0].role };\n    const s = await db.query('SELECT * FROM subscriptions WHERE user_id=$1 AND status=\\'active\\' ORDER BY expires_at DESC LIMIT 1', [req.user.userId]);\n    req.subscription = s.rows[0] || null;\n    next();\n  } catch { res.status(401).json({ error: 'Unauthorized' }); }\n};\nexport const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {\n  try {\n    const auth = req.headers.authorization;\n    if (!auth?.startsWith('Bearer ')) { next(); return; }\n    const payload = verifyToken(auth.split(' ')[1]);\n    const u = await db.query('SELECT id, email, role, is_active FROM users WHERE id=$1', [payload.userId]);\n    if (u.rows[0]?.is_active) {\n      req.user = { userId: u.rows[0].id, email: u.rows[0].email, role: u.rows[0].role };\n      const s = await db.query('SELECT * FROM subscriptions WHERE user_id=$1 AND status=\\'active\\' ORDER BY expires_at DESC LIMIT 1', [req.user.userId]);\n      req.subscription = s.rows[0] || null;\n    }\n    next();\n  } catch { next(); }\n};\n`,

  'backend/src/middleware/authorize.ts': `import { Request, Response, NextFunction } from 'express';\nimport { UserRole } from '../types';\nexport const authorize = (...roles: UserRole[]) => (req: Request, res: Response, next: NextFunction): void => {\n  if (!req.user || !roles.includes(req.user.role)) { res.status(403).json({ error: 'Forbidden' }); return; }\n  next();\n};\n`,

  'backend/src/middleware/tierGate.ts': `import { Prediction, SubscriptionTier } from '../types';\nimport { isTierSufficient } from '../utils/tier-comparator';\nexport const sanitizePrediction = (p: Prediction, role?: string, tier?: SubscriptionTier | null): any => {\n  if (role === 'admin') return p;\n  if (role === 'subscriber' && tier && isTierSufficient(tier, p.tier_required)) return p;\n  return { ...p, exact_score: '🔒', goalscorers: null, total_corners: '🔒', total_fouls: '🔒', asian_handicap: '🔒' };\n};\n`,

  'backend/src/server.ts': `import express from 'express';\nimport cors from 'cors';\nimport helmet from 'helmet';\nimport { ENV } from './config/env';\nimport authRoutes from './routes/auth.routes';\nimport predictionsRoutes from './routes/predictions.routes';\nimport matchesRoutes from './routes/matches.routes';\nimport adminRoutes from './routes/admin.routes';\nimport stripeRoutes from './routes/stripe.routes';\nimport subscriptionsRoutes from './routes/subscriptions.routes';\n\nconst app = express();\napp.use(helmet());\napp.use(cors({ origin: ENV.CORS_ORIGIN, credentials: true }));\napp.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));\napp.use(express.json());\n\napp.use('/api/auth', authRoutes);\napp.use('/api/predictions', predictionsRoutes);\napp.use('/api/matches', matchesRoutes);\napp.use('/api/admin', adminRoutes);\napp.use('/api/stripe', stripeRoutes);\napp.use('/api/subscriptions', subscriptionsRoutes);\n\napp.get('/api/health', (_, res) => res.json({ status: 'ok', service: 'ProScore AI' }));\n\napp.listen(ENV.PORT, () => console.log(\`🚀 Backend running on port \${ENV.PORT}\`));\nexport default app;\n`,

  // --- FRONTEND CONFIG ---
  'frontend/package.json': JSON.stringify({
    name: "proscore-ai-frontend",
    version: "1.0.0",
    private: true,
    scripts: {
      dev: "next dev",
      build: "next build",
      start: "next start",
      lint: "next lint"
    },
    dependencies: {
      next: "^14.1.0",
      react: "^18.2.0",
      "react-dom": "^18.2.0"
    },
    devDependencies: {
      "@types/node": "^20.10.0",
      "@types/react": "^18.2.42",
      "@types/react-dom": "^18.2.17",
      autoprefixer: "^10.4.16",
      postcss: "^8.4.32",
      tailwindcss: "^3.4.0",
      typescript: "^5.3.3"
    }
  }, null, 2),

  'frontend/next.config.js': `/** @type {import('next').NextConfig} */\nconst nextConfig = {\n  env: { NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api' },\n};\nmodule.exports = nextConfig;\n`,

  'frontend/tailwind.config.ts': `import type { Config } from 'tailwindcss';\nconst config: Config = {\n  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],\n  theme: {\n    extend: {\n      colors: {\n        dark: { 800: '#0f172a', 900: '#020617', 700: '#1e293b', 600: '#334155', 400: '#94a3b8' },\n        neon: { green: '#39FF14', blue: '#00D4FF', purple: '#BF40BF' }\n      }\n    }\n  },\n  plugins: []\n};\nexport default config;\n`,

  'frontend/postcss.config.js': `module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } };\n`,

  'frontend/tsconfig.json': JSON.stringify({
    compilerOptions: {
      target: "es5",
      lib: ["dom", "dom.iterable", "esnext"],
      allowJs: true,
      skipLibCheck: true,
      strict: true,
      noEmit: true,
      esModuleInterop: true,
      module: "esnext",
      moduleResolution: "bundler",
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: "preserve",
      incremental: true,
      plugins: [{ name: "next" }],
      paths: { "@/*": ["./src/*"] }
    },
    include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
    exclude: ["node_modules"]
  }, null, 2),

  'frontend/.env.local.example': `NEXT_PUBLIC_API_URL=http://localhost:4000/api\nNEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx\n`,

  'frontend/src/app/globals.css': `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\nbody { @apply bg-dark-900 text-slate-100 font-sans; }\n.glass-card { @apply bg-dark-800/80 backdrop-blur-md border border-slate-800 rounded-2xl; }\n.neon-text { color: #39FF14; text-shadow: 0 0 10px rgba(57,255,20,0.5); }\n.btn-primary { @apply px-6 py-3 bg-neon-green text-dark-900 font-bold rounded-xl transition hover:opacity-90 active:scale-95; }\n.btn-secondary { @apply px-6 py-3 border border-slate-700 hover:border-slate-500 rounded-xl transition; }\n.input-field { @apply w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-neon-green; }\n`
};

// 3. Écriture physique de tous les fichiers
let count = 0;
for (const [filePath, content] of Object.entries(files)) {
  const fullPath = path.join(__dirname, filePath);
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log(`✅ Fichier généré : ${filePath}`);
  count++;
}

console.log(`\n🎉 SUCCÈS TOTAL : ${count} fichiers générés sans erreur !`);
console.log(`\n👉 Vous pouvez maintenant exécuter 'git init', 'git add .' et 'git push' vers votre GitHub !`);