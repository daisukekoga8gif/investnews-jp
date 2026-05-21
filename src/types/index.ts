// ============================================
// 型定義
// ============================================

export type Category =
  | '速報'
  | '人気ニュース'
  | '日本株'
  | '米国株'
  | '為替・金利'
  | '決算・個別株'
  | 'テーマ株'
  | '高配当・優待'
  | '新NISA・投資信託'
  | '暗号資産'
  | '経済・政策'
  | '海外市場';

export const CATEGORIES: Category[] = [
  '速報',
  '人気ニュース',
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
];

export interface Source {
  id: string;
  name: string;
  url: string;
  site_url: string | null;
  type: 'rss' | 'api' | 'manual';
  category: string | null;
  fetch_interval_minutes: number;
  is_active: boolean;
  robots_ok: boolean;
  last_fetched_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: string;
  source_id: string | null;
  original_url: string;
  original_title: string;
  original_published_at: string | null;
  source_name: string;

  // AI生成
  ai_summary: string | null;
  ai_points: string | null;
  ai_category: string | null;
  ai_tickers: string[] | null;
  ai_indices: string[] | null;
  ai_tags: string[] | null;

  // スコア
  score_freshness: number;
  score_impact: number;
  score_stock: number;
  score_sns: number;
  score_total: number;

  // クラスター
  article_hash: string | null;
  cluster_id: string | null;
  is_cluster_main: boolean;

  // 掲載
  category: string;
  is_published: boolean;
  is_archived: boolean;

  created_at: string;
  updated_at: string;

  // JOIN
  related_articles?: ArticleRelated[];
}

export interface ArticleRelated {
  id: string;
  main_id: string;
  related_id: string;
  article: Pick<Article, 'id' | 'original_title' | 'original_url' | 'source_name'>;
}

export interface RssItem {
  title: string;
  link: string;
  pubDate?: string;
  isoDate?: string;
  contentSnippet?: string;
  content?: string;
  guid?: string;
}

export interface AiAnalysisResult {
  summary: string;
  points: string;
  category: Category;
  tickers: string[];
  indices: string[];
  tags: string[];
  score_impact: number;
  score_stock: number;
  score_sns: number;
}

export interface NewsFilters {
  category?: string;
  page?: number;
  limit?: number;
  sortBy?: 'score' | 'date';
}

export interface PaginatedArticles {
  articles: Article[];
  total: number;
  page: number;
  totalPages: number;
}

export interface RankingSection {
  title: string;
  category?: string;
  articles: Article[];
}
