-- ============================================
-- 投資ニュース集約サイト — Supabase マイグレーション
-- ============================================

-- ① ニュースソース管理テーブル
CREATE TABLE sources (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,                    -- 例: Yahoo!ファイナンス
  url         TEXT NOT NULL UNIQUE,             -- RSS/API URL
  site_url    TEXT,                             -- サイトのトップURL
  type        TEXT NOT NULL DEFAULT 'rss',      -- 'rss' | 'api' | 'manual'
  category    TEXT,                             -- デフォルトカテゴリ
  fetch_interval_minutes INT DEFAULT 30,
  is_active   BOOLEAN DEFAULT true,
  robots_ok   BOOLEAN DEFAULT true,             -- robots.txt 確認済み
  last_fetched_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ② 記事テーブル（メイン）
CREATE TABLE articles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id       UUID REFERENCES sources(id) ON DELETE SET NULL,
  
  -- 元記事情報
  original_url    TEXT NOT NULL,
  original_title  TEXT NOT NULL,
  original_published_at TIMESTAMPTZ,
  source_name     TEXT NOT NULL,               -- 表示用ソース名

  -- AI生成コンテンツ
  ai_summary      TEXT,                        -- 3〜5行要約
  ai_points       TEXT,                        -- 投資家向けポイント1〜2行
  ai_category     TEXT,                        -- AI分類カテゴリ
  ai_tickers      TEXT[],                      -- 関連銘柄コード配列
  ai_indices      TEXT[],                      -- 関連指数配列
  ai_tags         TEXT[],                      -- タグ配列
  
  -- スコアリング
  score_freshness  FLOAT DEFAULT 0,            -- 新しさ (0-100)
  score_impact     FLOAT DEFAULT 0,            -- 市場影響度 (0-100)
  score_stock      FLOAT DEFAULT 0,            -- 個別株性 (0-100)
  score_sns        FLOAT DEFAULT 0,            -- SNS拡散性 (0-100)
  score_total      FLOAT DEFAULT 0,            -- 総合スコア (0-100)
  
  -- 重複クラスタリング
  article_hash    TEXT UNIQUE,                  -- タイトル正規化ハッシュ（重複排除）
  cluster_id      UUID,                        -- 同一ニュースのクラスターID
  is_cluster_main BOOLEAN DEFAULT true,        -- クラスターの代表記事か

  -- 掲載管理
  category        TEXT DEFAULT '速報',
  is_published    BOOLEAN DEFAULT true,
  is_archived     BOOLEAN DEFAULT false,
  
  -- メタデータ
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ③ 重複記事（クラスター内のサブ記事）
CREATE TABLE article_related (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  main_id     UUID REFERENCES articles(id) ON DELETE CASCADE,
  related_id  UUID REFERENCES articles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ④ NGワードテーブル
CREATE TABLE ng_words (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word        TEXT NOT NULL UNIQUE,
  reason      TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ⑤ 除外ドメインテーブル
CREATE TABLE excluded_domains (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain      TEXT NOT NULL UNIQUE,
  reason      TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ⑥ 管理ログ（操作履歴）
CREATE TABLE admin_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action      TEXT NOT NULL,
  target_id   UUID,
  target_type TEXT,
  detail      JSONB,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- インデックス
-- ============================================
CREATE INDEX idx_articles_score_total     ON articles(score_total DESC);
CREATE INDEX idx_articles_category        ON articles(category);
CREATE INDEX idx_articles_published_at    ON articles(original_published_at DESC);
CREATE INDEX idx_articles_is_published    ON articles(is_published, is_archived);
CREATE INDEX idx_articles_cluster_id      ON articles(cluster_id);
CREATE INDEX idx_articles_created_at      ON articles(created_at DESC);
CREATE INDEX idx_sources_is_active        ON sources(is_active);

-- ============================================
-- RLS (Row Level Security)
-- ============================================
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources  ENABLE ROW LEVEL SECURITY;

-- 公開記事は誰でも読める
CREATE POLICY "公開記事は閲覧可" ON articles
  FOR SELECT USING (is_published = true AND is_archived = false);

-- ソース一覧は誰でも読める（サイト名表示用）
CREATE POLICY "ソース一覧は閲覧可" ON sources
  FOR SELECT USING (is_active = true);

-- ============================================
-- 初期データ：監視対象RSSソース
-- ============================================
INSERT INTO sources (name, url, site_url, type, category, fetch_interval_minutes) VALUES
('Yahoo!ファイナンス 新着', 'https://finance.yahoo.co.jp/rss/news', 'https://finance.yahoo.co.jp', 'rss', '速報', 30),
('Reuters Japan', 'https://feeds.reuters.com/reuters/JPBusinessNews', 'https://jp.reuters.com', 'rss', '経済・政策', 30),
('Bloomberg Japan', 'https://www.bloomberg.co.jp/feeds/news', 'https://www.bloomberg.co.jp', 'rss', '経済・政策', 30),
('日本経済新聞 マーケット', 'https://www.nikkei.com/rss/feed/nikkeiall_1000010', 'https://www.nikkei.com', 'rss', '日本株', 60),
('Investing.com 日本語', 'https://jp.investing.com/rss/news.rss', 'https://jp.investing.com', 'rss', '海外市場', 30),
('みんかぶ 株式ニュース', 'https://minkabu.jp/news/rss', 'https://minkabu.jp', 'rss', '日本株', 30),
('トレーダーズウェブ', 'https://www.traders.co.jp/rss/news.xml', 'https://www.traders.co.jp', 'rss', '速報', 30);

-- ============================================
-- カテゴリ一覧（参照用）
-- ============================================
-- 速報 / 人気ニュース / 日本株 / 米国株 / 為替・金利
-- 決算・個別株 / テーマ株 / 高配当・優待 / 新NISA・投資信託
-- 暗号資産 / 経済・政策 / 海外市場
