import Anthropic from '@anthropic-ai/sdk';
import type { AiAnalysisResult, Category } from '@/types';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const SYSTEM_PROMPT = `あなたは日本人個人投資家向け投資ニュースキュレーターです。
記事タイトルと概要から、以下のJSON形式で分析結果を返してください。
必ずJSONのみ返してください。前置き・後置きは不要です。

{
  "summary": "3〜5行の要約。元記事への送客を前提に、要点のみ。本文の丸写し禁止。",
  "points": "投資家向けポイント1〜2行。どの銘柄/セクター/指数に影響があるか。投資助言にならないよう注意。",
  "category": "カテゴリ（後述）",
  "tickers": ["関連銘柄コード配列。例: 7203, 6758"],
  "indices": ["関連指数配列。例: 日経平均, TOPIX, NYダウ, NASDAQ, S&P500, SOX, ドル円, 原油"],
  "tags": ["関連タグ配列。例: AI, 半導体, 決算, NISA, 高配当"],
  "score_impact": 0〜100の数値（市場影響度）,
  "score_stock": 0〜100の数値（個別株性）,
  "score_sns": 0〜100の数値（SNS拡散性）
}

カテゴリは以下から1つ選択：
速報, 日本株, 米国株, 為替・金利, 決算・個別株, テーマ株, 高配当・優待, 新NISA・投資信託, 暗号資産, 経済・政策, 海外市場

スコア基準：
- score_impact: 日経平均/TOPIXレベル影響=80+, セクター影響=50-79, 個別影響=30-49
- score_stock: 決算/M&A/増配含む=70+, 銘柄言及あり=40-69, なし=0-39
- score_sns: 数字・変動・サプライズあり=70+, テーマ株=50-69, 通常=20-49

注意：
- summary と points は投資助言にならないよう事実ベースで記述
- 「買い」「売り」を直接推奨しない
- 断定的表現を避ける
- 有料記事の場合は情報が限られる旨を summary に含める`;

/**
 * 記事をClaude APIで分析
 */
export async function analyzeArticle(
  title: string,
  snippet: string,
  sourceName: string
): Promise<AiAnalysisResult> {
  const userMessage = `
出典: ${sourceName}
タイトル: ${title}
概要: ${snippet.slice(0, 500)}
`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 800,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  });

  const content = message.content[0];
  if (content.type !== 'text') throw new Error('AI応答が不正');

  const raw = content.text.trim();
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('JSON取得失敗');

  const parsed = JSON.parse(jsonMatch[0]);

  return {
    summary: parsed.summary || '',
    points: parsed.points || '',
    category: (parsed.category as Category) || '速報',
    tickers: Array.isArray(parsed.tickers) ? parsed.tickers.map(String) : [],
    indices: Array.isArray(parsed.indices) ? parsed.indices : [],
    tags: Array.isArray(parsed.tags) ? parsed.tags : [],
    score_impact: Math.min(100, Math.max(0, Number(parsed.score_impact) || 30)),
    score_stock: Math.min(100, Math.max(0, Number(parsed.score_stock) || 20)),
    score_sns: Math.min(100, Math.max(0, Number(parsed.score_sns) || 20)),
  };
}

/**
 * X投稿案を生成（第2段階以降）
 */
export async function generateXPost(article: {
  original_title: string;
  ai_summary: string;
  ai_points: string;
  original_url: string;
  ai_tags: string[];
}): Promise<string> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 400,
    messages: [
      {
        role: 'user',
        content: `以下の投資ニュースのX（旧Twitter）投稿文を生成してください。

タイトル: ${article.original_title}
要約: ${article.ai_summary}
投資家向けポイント: ${article.ai_points}
URL: ${article.original_url}
タグ: ${article.ai_tags?.join(', ')}

形式：
【投資ニュース】
（タイトル）

（要約2〜3行）

▶ 元記事: （URL）

（ハッシュタグ3〜5個）

注意：
- 煽りすぎない
- 断定しない
- 投資助言にならない
- 「買い」「売り」を直接推奨しない
- 280文字以内（URLは23文字換算）`,
      },
    ],
  });

  const content = message.content[0];
  return content.type === 'text' ? content.text : '';
}
