# 投資ニュース集約サイト — アーキテクチャ設計書

## 1. 全体アーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│                        Vercel                               │
│  ┌──────────────┐   ┌──────────────┐   ┌────────────────┐  │
│  │  Next.js 14  │   │  Vercel Cron │   │  API Routes    │  │
│  │  (App Router)│   │  /30min      │   │  /api/*        │  │
│  └──────────────┘   └──────┬───────┘   └───────┬────────┘  │
└────────────────────────────│───────────────────│────────────┘
                             │                   │
         ┌───────────────────▼───────────────────▼──────────┐
         │                 Supabase                          │
         │  PostgreSQL + Storage + Auth + Realtime           │
         └───────────────────────────────────────────────────┘
                             │
         ┌───────────────────▼──────────────────────────────┐
         │              外部サービス                          │
         │  Claude API  │  RSS Feeds  │  Public APIs        │
         └──────────────────────────────────────────────────┘
```

## 2. データフロー

```
[Vercel Cron 30分ごと]
      │
      ▼
[RSS/API取得] ← sources テーブルから取得対象URL一覧
      │
      ▼
[重複チェック] ← article_hash でDedup
      │
      ▼
[Claude API] → AI要約 / カテゴリ分類 / 銘柄抽出 / 投資家向けポイント
      │
      ▼
[スコアリング] → 新しさ + 影響度 + 個別株性 + SNS推定スコア
      │
      ▼
[Supabase保存] → articles テーブル
      │
      ▼
[Next.js SSR/ISR] → ユーザー表示
```

## 3. 技術スタック

| 役割 | 技術 |
|------|------|
| フレームワーク | Next.js 14 (App Router) |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS |
| DB | Supabase (PostgreSQL) |
| ホスティング | Vercel |
| スケジューラ | Vercel Cron |
| AI要約 | Claude API (claude-sonnet-4-20250514) |
| RSS取得 | rss-parser |
| 状態管理 | React Server Components + SWR |

## 4. ディレクトリ構造

```
investnews-jp/
├── src/
│   ├── app/
│   │   ├── (site)/              # 公開サイト
│   │   │   ├── page.tsx         # トップページ
│   │   │   ├── category/[slug]/ # カテゴリページ
│   │   │   └── article/[id]/    # 記事詳細
│   │   ├── admin/               # 管理画面
│   │   │   ├── page.tsx
│   │   │   ├── articles/
│   │   │   ├── sources/
│   │   │   └── settings/
│   │   └── api/
│   │       ├── cron/
│   │       │   └── fetch-news/  # Vercel Cron エンドポイント
│   │       ├── news/            # ニュースAPI
│   │       └── admin/           # 管理API
│   ├── components/
│   │   ├── layout/              # Header, Footer, Navigation
│   │   ├── news/                # NewsCard, NewsList, Ranking
│   │   └── ui/                  # Button, Badge, Skeleton等
│   ├── lib/
│   │   ├── rss/                 # RSS取得・パース
│   │   ├── ai/                  # Claude API連携
│   │   └── scoring/             # スコアリングロジック
│   ├── types/                   # 型定義
│   └── hooks/                   # カスタムフック
├── supabase/
│   └── migrations/              # DB マイグレーション
├── .env.example
└── README.md
```

## 5. セキュリティ方針

- 管理画面は `/admin/*` にまとめ、Supabase Auth でBasic認証
- API Routes に `CRON_SECRET` で認証（Vercel Cron からのみ呼び出し可）
- APIキーはすべて `.env` で管理、クライアントには露出しない
- RLSをSupabaseに設定し、公開データのみ SELECT 可能
