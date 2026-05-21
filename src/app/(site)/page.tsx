import { Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/layout/Header';
import CategoryTabs from '@/components/news/CategoryTabs';
import NewsCard from '@/components/news/NewsCard';
import RankingList from '@/components/news/RankingList';
import type { Article } from '@/types';

export const revalidate = 1800; // 30分キャッシュ

interface PageProps {
  searchParams: { category?: string; page?: string; sortBy?: string };
}

async function getArticles(category?: string, page = 1, sortBy = 'score') {
  const limit = 20;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('articles')
    .select('*', { count: 'exact' })
    .eq('is_published', true)
    .eq('is_archived', false);

  if (category && category !== 'すべて') {
    query = query.eq('category', category);
  }

  if (sortBy === 'date') {
    query = query.order('original_published_at', { ascending: false });
  } else {
    query = query.order('score_total', { ascending: false });
  }

  const { data, count } = await query.range(offset, offset + limit - 1);
  return { articles: (data || []) as Article[], total: count || 0 };
}

async function getRankings() {
  const [top, japan, us, earnings] = await Promise.all([
    supabase
      .from('articles')
      .select('*')
      .eq('is_published', true)
      .eq('is_archived', false)
      .order('score_total', { ascending: false })
      .limit(10),
    supabase
      .from('articles')
      .select('*')
      .eq('is_published', true)
      .eq('is_archived', false)
      .eq('category', '日本株')
      .order('score_total', { ascending: false })
      .limit(10),
    supabase
      .from('articles')
      .select('*')
      .eq('is_published', true)
      .eq('is_archived', false)
      .eq('category', '米国株')
      .order('score_total', { ascending: false })
      .limit(10),
    supabase
      .from('articles')
      .select('*')
      .eq('is_published', true)
      .eq('is_archived', false)
      .eq('category', '決算・個別株')
      .order('score_total', { ascending: false })
      .limit(10),
  ]);

  return {
    top: (top.data || []) as Article[],
    japan: (japan.data || []) as Article[],
    us: (us.data || []) as Article[],
    earnings: (earnings.data || []) as Article[],
  };
}

export default async function HomePage({ searchParams }: PageProps) {
  const category = searchParams.category;
  const page = parseInt(searchParams.page || '1', 10);
  const sortBy = searchParams.sortBy || 'score';
  const isTopPage = !category;

  const [{ articles, total }, rankings] = await Promise.all([
    getArticles(category, page, sortBy),
    isTopPage ? getRankings() : Promise.resolve(null),
  ]);

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      <Suspense>
        <CategoryTabs />
      </Suspense>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-7">
        {/* トップページ: ランキング + 記事 */}
        {isTopPage ? (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* 左: メインニュースフィード */}
            <div className="xl:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="text-base sm:text-lg font-bold text-white">
                  最新の投資ニュース
                </h1>
                <SortToggle sortBy={sortBy} />
              </div>

              {articles.length === 0 ? (
                <EmptyState />
              ) : (
                <>
                  <div className="space-y-3 sm:space-y-4">
                    {articles.map((article) => (
                      <NewsCard key={article.id} article={article} />
                    ))}
                  </div>
                  <Pagination page={page} totalPages={totalPages} category={category} sortBy={sortBy} />
                </>
              )}
            </div>

            {/* 右: ランキングパネル */}
            {rankings && (
              <aside className="space-y-5">
                <RankingList
                  title="今注目の投資ニュース"
                  articles={rankings.top}
                  icon="🏆"
                />
                <RankingList
                  title="日本株ニュース"
                  articles={rankings.japan}
                  icon="🇯🇵"
                />
                <RankingList
                  title="米国株ニュース"
                  articles={rankings.us}
                  icon="🇺🇸"
                />
                <RankingList
                  title="決算ニュース"
                  articles={rankings.earnings}
                  icon="📊"
                />
              </aside>
            )}
          </div>
        ) : (
          /* カテゴリページ: フル幅 */
          <div>
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-base sm:text-lg font-bold text-white">
                {category} <span className="text-sm font-normal text-slate-400">({total}件)</span>
              </h1>
              <SortToggle sortBy={sortBy} />
            </div>

            {articles.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {articles.map((article) => (
                    <NewsCard key={article.id} article={article} />
                  ))}
                </div>
                <Pagination page={page} totalPages={totalPages} category={category} sortBy={sortBy} />
              </>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

function SortToggle({ sortBy }: { sortBy: string }) {
  return (
    <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
      <a
        href={`?sortBy=score`}
        className={`px-3 py-1.5 rounded text-xs font-medium transition-colors min-h-[32px] flex items-center
          ${sortBy !== 'date' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
      >
        注目順
      </a>
      <a
        href={`?sortBy=date`}
        className={`px-3 py-1.5 rounded text-xs font-medium transition-colors min-h-[32px] flex items-center
          ${sortBy === 'date' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
      >
        新着順
      </a>
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  category,
  sortBy,
}: {
  page: number;
  totalPages: number;
  category?: string;
  sortBy: string;
}) {
  if (totalPages <= 1) return null;

  const buildUrl = (p: number) => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (sortBy !== 'score') params.set('sortBy', sortBy);
    params.set('page', String(p));
    return `?${params.toString()}`;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-8 pb-4">
      {page > 1 && (
        <a
          href={buildUrl(page - 1)}
          className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors text-sm min-h-[44px] flex items-center"
        >
          ← 前のページ
        </a>
      )}
      <span className="text-sm text-slate-400 px-3">
        {page} / {totalPages}
      </span>
      {page < totalPages && (
        <a
          href={buildUrl(page + 1)}
          className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors text-sm min-h-[44px] flex items-center"
        >
          次のページ →
        </a>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <span className="text-5xl mb-4">📭</span>
      <p className="text-slate-400 text-sm">現在このカテゴリにニュースはありません</p>
      <p className="text-slate-500 text-xs mt-2">30分ごとに自動更新されます</p>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-800 mt-10 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-2">
          <p className="text-xs text-slate-500">
            このサイトは投資ニュースのキュレーションサービスです。記事の転載は行っておらず、
            元記事への誘導を目的としています。
          </p>
          <p className="text-xs text-slate-600">
            ※ 掲載情報は投資助言ではありません。投資は自己責任で行ってください。
          </p>
          <p className="text-xs text-slate-700 mt-4">
            © 2025 投資ニュース | Powered by AI
          </p>
        </div>
      </div>
    </footer>
  );
}
