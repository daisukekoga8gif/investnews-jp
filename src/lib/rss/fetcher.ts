import Parser from 'rss-parser';
import { createHash } from 'crypto';
import { supabaseAdmin } from '../supabase';
import { analyzeArticle } from '../ai/claude';
import { calculateScores } from '../scoring';
import type { Source, RssItem } from '@/types';

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'InvestNews-JP/1.0 RSS Reader (contact: your@email.com)',
  },
  customFields: {
    item: ['description', 'content:encoded'],
  },
});

/**
 * 全アクティブソースからニュースを取得
 */
export async function fetchAllSources(): Promise<void> {
  const { data: sources, error } = await supabaseAdmin
    .from('sources')
    .select('*')
    .eq('is_active', true)
    .eq('type', 'rss');

  if (error || !sources) {
    console.error('ソース取得エラー:', error);
    return;
  }

  console.log(`[RSS] ${sources.length}件のソースを取得開始`);

  for (const source of sources as Source[]) {
    try {
      await fetchSource(source);
    } catch (err) {
      console.error(`[RSS] ${source.name} 取得失敗:`, err);
    }
  }
}

/**
 * 単一ソースからRSSを取得・処理
 */
async function fetchSource(source: Source): Promise<void> {
  const feed = await parser.parseURL(source.url);
  const items = (feed.items || []).slice(0, 20) as RssItem[];

  console.log(`[RSS] ${source.name}: ${items.length}件取得`);

  // 除外ドメイン取得
  const { data: excludedDomains } = await supabaseAdmin
    .from('excluded_domains')
    .select('domain');
  const excluded = (excludedDomains || []).map((d: { domain: string }) => d.domain);

  // NGワード取得
  const { data: ngWords } = await supabaseAdmin
    .from('ng_words')
    .select('word');
  const ng = (ngWords || []).map((w: { word: string }) => w.word.toLowerCase());

  for (const item of items) {
    await processItem(item, source, excluded, ng);
  }

  // last_fetched_at を更新
  await supabaseAdmin
    .from('sources')
    .update({ last_fetched_at: new Date().toISOString() })
    .eq('id', source.id);
}

/**
 * 記事1件を処理（重複チェック→AI分析→保存）
 */
async function processItem(
  item: RssItem,
  source: Source,
  excludedDomains: string[],
  ngWords: string[]
): Promise<void> {
  if (!item.title || !item.link) return;

  // 除外ドメインチェック
  try {
    const domain = new URL(item.link).hostname;
    if (excludedDomains.some((d) => domain.includes(d))) return;
  } catch {
    return;
  }

  // NGワードチェック（タイトル）
  const titleLower = item.title.toLowerCase();
  if (ngWords.some((w) => titleLower.includes(w))) return;

  // 重複チェック（URLハッシュ）
  const articleHash = createHash('md5').update(item.link).digest('hex');
  const { data: existing } = await supabaseAdmin
    .from('articles')
    .select('id')
    .eq('article_hash', articleHash)
    .single();

  if (existing) return; // 既存記事はスキップ

  const publishedAt = item.isoDate || item.pubDate
    ? new Date(item.isoDate || item.pubDate!).toISOString()
    : new Date().toISOString();

  const snippet = item.contentSnippet || item.content || '';

  // AI分析（要約・分類・スコア）
  let aiResult;
  try {
    aiResult = await analyzeArticle(item.title, snippet, source.name);
  } catch (err) {
    console.error(`[AI] 分析失敗 (${item.title.slice(0, 30)}):`, err);
    // AI失敗時はデフォルト値でも保存
    aiResult = {
      summary: snippet.slice(0, 200) || item.title,
      points: '',
      category: source.category || '速報',
      tickers: [],
      indices: [],
      tags: [],
      score_impact: 30,
      score_stock: 20,
      score_sns: 20,
    };
  }

  // スコア計算
  const scores = calculateScores({
    publishedAt,
    impactScore: aiResult.score_impact,
    stockScore: aiResult.score_stock,
    snsScore: aiResult.score_sns,
  });

  await supabaseAdmin.from('articles').insert({
    source_id: source.id,
    original_url: item.link,
    original_title: item.title,
    original_published_at: publishedAt,
    source_name: source.name,
    ai_summary: aiResult.summary,
    ai_points: aiResult.points,
    ai_category: aiResult.category,
    ai_tickers: aiResult.tickers,
    ai_indices: aiResult.indices,
    ai_tags: aiResult.tags,
    score_freshness: scores.freshness,
    score_impact: aiResult.score_impact,
    score_stock: aiResult.score_stock,
    score_sns: aiResult.score_sns,
    score_total: scores.total,
    article_hash: articleHash,
    category: aiResult.category,
    is_published: true,
    is_archived: false,
  });

  console.log(`[保存] ${item.title.slice(0, 40)}`);
}
