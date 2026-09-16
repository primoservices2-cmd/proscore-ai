import db from '../config/database';
import { sanitizePrediction } from '../middleware/tierGate';
import { SubscriptionTier, Sport } from '../types';

export class PredictionService {
  async getDailyFeed(date: string, sport?: Sport, userRole?: string, userTier?: SubscriptionTier | null) {
    let query = `
      SELECT m.id as match_id, m.sport, m.league_name, m.team_home, m.team_away,
        m.match_date, m.status as match_status, m.score_home, m.score_away,
        p.id as prediction_id, p.tier_required, p.final_result, p.exact_score,
        p.total_goals_points, p.total_corners, p.total_fouls, p.goalscorers,
        p.both_teams_score, p.confidence_pct, p.is_winning, p.analyst_note
      FROM matches m LEFT JOIN predictions p ON p.match_id = m.id
      WHERE m.match_date::date = $1::date`;
    const params: any[] = [date];
    if (sport) { query += ` AND m.sport = $2`; params.push(sport); }
    query += ` ORDER BY m.match_date ASC`;
    const result = await db.query(query, params);
    return result.rows.map(row => ({
      match: { id: row.match_id, sport: row.sport, league_name: row.league_name, team_home: row.team_home, team_away: row.team_away, match_date: row.match_date, status: row.match_status, score_home: row.score_home, score_away: row.score_away },
      prediction: row.prediction_id ? sanitizePrediction(row, userRole, userTier) : null
    }));
  }
  async upsertPrediction(data: any) {
    const res = await db.query(
      `INSERT INTO predictions (match_id, tier_required, final_result, exact_score, total_goals_points, total_corners, total_fouls, confidence_pct, analyst_note)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (match_id) DO UPDATE SET
       tier_required=EXCLUDED.tier_required, final_result=EXCLUDED.final_result, exact_score=EXCLUDED.exact_score, updated_at=NOW()
       RETURNING *`,
      [data.match_id, data.tier_required, data.final_result||null, data.exact_score||null, data.total_goals_points||null, data.total_corners||null, data.total_fouls||null, data.confidence_pct||0, data.analyst_note||null]
    );
    return res.rows[0];
  }
}
export default new PredictionService();
