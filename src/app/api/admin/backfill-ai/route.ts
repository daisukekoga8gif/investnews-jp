import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { analyzeArticle } from '@/lib/ai/claude';
import { recalcTotal } from '@/lib/scoring';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

// fetcher.ts と同一の公開条件
const PUBLISHABLE_CATEGORIES = new Set<string>([
  '速報',
  '日本株',
  '米国株',
  '為替・金利',
  '決算・個別株',
  'テーマ株',
  '高配当・優待',
  '新NISA・投資信託',
  '暗号資産',
  '経済・政策',
  '海外市場',
]);
const MIN_IMPACT_SCORE = 26;

// 1 リクエストで処理する最大件数。Claude 1 件 ~3s と仮定し maxDuration=300s 内で安全に収まる範囲。
const BATCH_SIZE = 30;
// 候補抽出のために最近 N 件をスキャン
const SCAN_SIZE = 300;

/**
 * 旧モデル時代のフォールバック記事を Sonnet 4.6 で再分析するバックフィル
 *
 * 認証: Authorization: Bearer ${CRON_SECRET}
 * 使い方: curl -H "Authorization: Bearer $CRON_SECRET" https://<host>/api/admin/backfill-ai
 * has_more=true が返る間は同じエンドポイントを叩き続ければよい
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startTime = Date.now();

  const { data: candidates, error } = await supabaseAdmin
    .from('articles')
    .select(
      'id, original_title, source_name, ai_summary, ai_points, ai_tickers, original_published_at'
    )
    .eq('is_archived', false)
    .order('original_published_at', { ascending: false })
    .limit(SCAN_SIZE);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // AI フォールバック痕跡:
  // - ai_summary が NULL もしくは original_title と同一（snippet 空時のフォールバック）
  // - ai_points が NULL もしくは空文字（フォールバックは '' を入れる）
  // - ai_tickers が空配列（フォールバックは [] を入れる）
  const suspects = (candidates || [])
    .filter(
      (a) =>
        !a.ai_summary ||
        a.ai_summary === a.original_title ||
        !a.ai_points ||
        a.ai_points === '' ||
        !a.ai_tickers ||
        (Array.isArray(a.ai_tickers) && a.ai_tickers.length === 0)
    )
    .slice(0, BATCH_SIZE);

  let updated = 0;
  let failed = 0;
  let unpublished = 0;

  for (const a of suspects) {
    try {
      const ai = await analyzeArticle(a.original_title, '', a.source_name);

      const isPublishable =
        PUBLISHABLE_CATEGORIES.has(ai.category) &&
        ai.score_impact >= MIN_IMPACT_SCORE;

      const { score_freshness, score_total } = recalcTotal({
        original_published_at: a.original_published_at,
        score_impact: ai.score_impact,
        score_stock: ai.score_stock,
        score_sns: ai.score_sns,
      });

      await supabaseAdmin
        .from('articles')
        .update({
          ai_summary: ai.summary,
          ai_points: ai.points,
          ai_category: ai.category,
          ai_tickers: ai.tickers,
          ai_indices: ai.indices,
          ai_tags: ai.tags,
          category: ai.category,
          score_impact: ai.score_impact,
          score_stock: ai.score_stock,
          score_sns: ai.score_sns,
          score_freshness,
          score_total,
          is_published: isPublishable,
          updated_at: new Date().toISOString(),
        })
        .eq('id', a.id);

      updated++;
      if (!isPublishable) unpublished++;
    } catch (err) {
      console.error(`[Backfill] ${a.id} 失敗:`, err);
      failed++;
    }
  }

  return NextResponse.json({
    scanned: candidates?.length ?? 0,
    suspects_in_batch: suspects.length,
    updated,
    unpublished,
    failed,
    elapsed_ms: Date.now() - startTime,
    has_more: suspects.length === BATCH_SIZE,
  });
}
