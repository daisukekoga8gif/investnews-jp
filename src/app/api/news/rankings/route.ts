import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 1800; // 30分キャッシュ

const RANKING_CONFIGS = [
  { key: 'top',       title: '今注目の投資ニュース',      category: null },
  { key: 'japan',     title: '日本株ニュース',            category: '日本株' },
  { key: 'us',        title: '米国株ニュース',            category: '米国株' },
  { key: 'earnings',  title: '決算ニュース',              category: '決算・個別株' },
  { key: 'theme',     title: 'テーマ株ニュース',          category: 'テーマ株' },
];

export async function GET() {
  const rankings: Record<string, unknown> = {};

  for (const config of RANKING_CONFIGS) {
    let query = supabase
      .from('articles')
      .select('id, original_title, original_url, source_name, original_published_at, ai_summary, ai_points, ai_tickers, ai_indices, ai_tags, category, score_total, score_freshness')
      .eq('is_published', true)
      .eq('is_archived', false)
      .order('score_total', { ascending: false })
      .limit(10);

    if (config.category) {
      query = query.eq('category', config.category);
    }

    const { data } = await query;
    rankings[config.key] = {
      title: config.title,
      articles: data || [],
    };
  }

  return NextResponse.json(rankings);
}
