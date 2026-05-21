# 投資ニュース — 日本人投資家向け AIキュレーションサービス

日本の主要投資ニュースをAIが自動収集・要約・分類して毎日更新する投資情報キュレーションサイトです。

---

## 機能概要

- 📰 **RSSから自動取得**（30分ごと）
- 🤖 **Claude APIによるAI要約・分類・銘柄抽出**
- 📊 **スコアリング**（新しさ・市場影響度・個別株性・SNS拡散性）
- 🏆 **ランキング表示**（全体・日本株・米国株・決算）
- 📱 **完全レスポンシブ**（モバイルファースト）
- ⚙️ **管理画面**（記事管理・ソース管理）

---

## セットアップ

### 前提条件
- Node.js 18+
- Supabaseアカウント
- Vercelアカウント
- Anthropic APIキー

### 1. リポジトリのクローン

```bash
git clone https://github.com/yourname/investnews-jp.git
cd investnews-jp
npm install
```

### 2. 環境変数の設定

```bash
cp .env.example .env.local
```

`.env.local` を編集して各APIキーを設定してください。

### 3. Supabaseのセットアップ

1. [Supabase](https://supabase.com) でプロジェクト作成
2. SQL Editorで `supabase/migrations/001_initial_schema.sql` を実行
3. ダッシュボードの Settings → API から URL と Keys をコピー

### 4. ローカル起動

```bash
npm run dev
```

http://localhost:3000 でサイト、http://localhost:3000/admin で管理画面。

---

## Vercelデプロイ

```bash
# Vercel CLIでデプロイ
npm install -g vercel
vercel

# 本番デプロイ
vercel --prod
```

**Vercel Dashboard → Settings → Environment Variables** に `.env.local` の内容をすべて登録してください。

Vercel Cronは `vercel.json` で設定済み（30分ごとに自動実行）。

---

## ディレクトリ構造

```
src/
├── app/
│   ├── (site)/page.tsx        # トップページ
│   ├── admin/                 # 管理画面
│   └── api/
│       ├── cron/fetch-news/   # Vercel Cron
│       ├── news/              # ニュースAPI
│       └── admin/             # 管理API
├── components/
│   ├── layout/Header.tsx
│   ├── news/NewsCard.tsx
│   ├── news/CategoryTabs.tsx
│   └── news/RankingList.tsx
└── lib/
    ├── rss/fetcher.ts         # RSS取得
    ├── ai/claude.ts           # Claude API
    ├── scoring/index.ts       # スコアリング
    └── supabase.ts            # Supabaseクライアント
```

---

## スコアリング方式

```
総合スコア = 新しさ(30%) + 市場影響度(30%) + 個別株性(20%) + SNS拡散性(20%)

新しさ: 公開から0時間=100点 → 48時間=0点（線形減少）
市場影響度: 日経/TOPIX級=80+ / セクター影響=50〜79 / 個別=30〜49
個別株性: 決算/M&A/増配含む=70+ / 銘柄言及=40〜69
SNS拡散性: 数字・サプライズ=70+ / テーマ株=50〜69
```

---

## 監視対象ソース（初期設定）

| サイト | RSS URL |
|--------|---------|
| Yahoo!ファイナンス | https://finance.yahoo.co.jp/rss/news |
| Reuters Japan | https://feeds.reuters.com/reuters/JPBusinessNews |
| Bloomberg Japan | https://www.bloomberg.co.jp/feeds/news |
| 日本経済新聞 | https://www.nikkei.com/rss/feed/nikkeiall_1000010 |
| Investing.com JP | https://jp.investing.com/rss/news.rss |
| みんかぶ | https://minkabu.jp/news/rss |
| トレーダーズウェブ | https://www.traders.co.jp/rss/news.xml |

ソースの追加・削除は Supabase Table Editor の `sources` テーブルで行えます。

---

## 著作権ポリシー

詳細は `docs/COPYRIGHT_POLICY.md` を参照。

- 記事本文の転載は行わない
- AI要約は独自生成（元記事の丸写しではない）
- 元記事URLへのリンクを必ず表示
- robots.txt・利用規約を遵守

---

## 開発ロードマップ

### ✅ 第1段階（MVP）
- [x] RSS取得 + AI要約
- [x] カテゴリ分類
- [x] スコアリング
- [x] レスポンシブUI
- [x] 管理画面（基本）

### 🚧 第2段階
- [ ] X投稿案生成
- [ ] 管理画面でX承認投稿
- [ ] 人気度スコア（PV、コメント数）

### 📋 第3段階
- [ ] 関連銘柄自動抽出の精度向上
- [ ] トレンド分析
- [ ] 重複クラスタリング精度向上

### 💡 第4段階
- [ ] 会員登録・マイページ
- [ ] メール通知
- [ ] LINE通知

---

## ライセンス

MIT License — ただし生成AIを使った商用展開については各APIの利用規約に従ってください。
