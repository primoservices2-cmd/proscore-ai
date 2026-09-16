import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ENV } from './config/env';
import authService from './services/auth.service';
import predictionService from './services/prediction.service';
import { authenticate, optionalAuth } from './middleware/authenticate';
import { authorize } from './middleware/authorize';

const app = express();
app.use(helmet());
app.use(cors({ origin: ENV.CORS_ORIGIN, credentials: true }));
app.use(express.json());

// Routes Auth
app.post('/api/auth/register', async (req, res) => {
  try { res.status(201).json({ success: true, data: await authService.register(req.body.email, req.body.password, req.body.displayName) }); }
  catch (e: any) { res.status(400).json({ error: e.message }); }
});
app.post('/api/auth/login', async (req, res) => {
  try { res.json({ success: true, data: await authService.login(req.body.email, req.body.password) }); }
  catch (e: any) { res.status(401).json({ error: e.message }); }
});
app.get('/api/auth/profile', authenticate, async (req, res) => {
  res.json({ success: true, data: await authService.getProfile(req.user!.userId) });
});

// Routes Predictions Feed
app.get('/api/predictions/feed', optionalAuth, async (req, res) => {
  const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
  const feed = await predictionService.getDailyFeed(date, req.query.sport as any, req.user?.role, req.subscription?.tier);
  res.json({ success: true, data: { matches: feed, total: feed.length } });
});

app.get('/api/health', (_, res) => res.json({ status: 'healthy', app: 'ProScore AI' }));

app.listen(ENV.PORT, () => console.log(`🚀 ProScore AI Backend running on port ${ENV.PORT}`));
export default app;
