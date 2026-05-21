import { NextRequest, NextResponse } from 'next/server';
import { fetchAllSources } from '@/lib/rss/fetcher';
import { supabaseAdmin } from '@/lib/supabase';
import { recalcTotal } from '@/lib/scoring';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5分タイムアウト

/**
 * Vercel Cron: 30分ごとにニュース取得・スコア更新
 * vercel.json で設定: "0,30 * * * *"
 */
export async function GET(request: NextRequest) {
  // Cronシークレット認証
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startTime = Date.now();
  console.log('[Cron] ニュース取得開始:', new Date().toISOString());

  try {
    // 1. 新規ニュース取得
    await fetchAllSources();

    // 2. 既存記事のスコア再計算（freshnessが時間で下がるため）
    await recalculateScores();

    // 3. 古い記事をアーカイブ（48時間以上）
    await archiveOldArticles();

    const elapsed = Date.now() - startTime;
    console.log(`[Cron] 完了: ${elapsed}ms`);

    return NextResponse.json({
      success: true,
      elapsed_ms: elapsed,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Cron] エラー:', error);
    return NextResponse.json(
      { error: 'Cron job failed', detail: String(error) },
      { status: 500 }
    );
  }
}

/**
 * 全公開記事のスコアを再計算
 */
async function recalculateScores() {
  const { data: articles } = await supabaseAdmin
    .from('articles')
    .select('id, original_published_at, score_impact, score_stock, score_sns')
    .eq('is_archived', false)
    .eq('is_published', true);

  if (!articles) return;

  const updates = articles.map((a) => {
    const { score_freshness, score_total } = recalcTotal(a);
    return supabaseAdmin
      .from('articles')
      .update({ score_freshness, score_total, updated_at: new Date().toISOString() })
      .eq('id', a.id);
  });

  await Promise.allSettled(updates);
  console.log(`[Cron] ${articles.length}件のスコアを再計算`);
}

/**
 * 48時間以上経過した記事をアーカイブ
 */
async function archiveOldArticles() {
  const threshold = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

  const { count } = await supabaseAdmin
    .from('articles')
    .update({ is_archived: true })
    .lt('original_published_at', threshold)
    .eq('is_archived', false)
    .select('id', { count: 'exact' });

  console.log(`[Cron] ${count}件をアーカイブ`);
}
