/**
 * ニューススコアリングロジック
 *
 * 総合スコア = 新しさ(30%) + 市場影響度(30%) + 個別株性(20%) + SNS拡散性(20%)
 */

interface ScoreInput {
  publishedAt: string;
  impactScore: number;  // 0-100 (AI算出)
  stockScore: number;   // 0-100 (AI算出)
  snsScore: number;     // 0-100 (AI算出)
}

interface ScoreResult {
  freshness: number;    // 0-100
  total: number;        // 0-100
}

/**
 * 新しさスコア計算
 * 0時間=100点, 3時間=80点, 6時間=60点, 12時間=40点, 24時間=20点, 48時間=0点
 */
function calcFreshness(publishedAt: string): number {
  const now = Date.now();
  const published = new Date(publishedAt).getTime();
  const hoursAgo = (now - published) / (1000 * 60 * 60);

  if (hoursAgo <= 0) return 100;
  if (hoursAgo <= 1) return 100 - hoursAgo * 10;
  if (hoursAgo <= 6) return 90 - (hoursAgo - 1) * 10;
  if (hoursAgo <= 24) return 40 - (hoursAgo - 6) * 1.1;
  if (hoursAgo <= 48) return Math.max(0, 20 - (hoursAgo - 24) * 0.8);
  return 0;
}

/**
 * 総合スコアを計算して返す
 */
export function calculateScores(input: ScoreInput): ScoreResult {
  const freshness = calcFreshness(input.publishedAt);

  const total =
    freshness * 0.3 +
    input.impactScore * 0.3 +
    input.stockScore * 0.2 +
    input.snsScore * 0.2;

  return {
    freshness: Math.round(freshness),
    total: Math.round(total),
  };
}

/**
 * 既存記事のスコアを再計算（Cron実行用）
 * 時間経過でfreshnessが下がるので定期更新が必要
 */
export function recalcTotal(article: {
  original_published_at: string;
  score_impact: number;
  score_stock: number;
  score_sns: number;
}): { score_freshness: number; score_total: number } {
  const freshness = calcFreshness(article.original_published_at);
  const total =
    freshness * 0.3 +
    article.score_impact * 0.3 +
    article.score_stock * 0.2 +
    article.score_sns * 0.2;

  return {
    score_freshness: Math.round(freshness),
    score_total: Math.round(total),
  };
}
