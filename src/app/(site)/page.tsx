import { Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/layout/Header';
import CategoryTabs from '@/components/news/CategoryTabs';
import NewsCard from '@/components/news/NewsCard';
import RankingList from '@/components/news/RankingList';
import type { Article } from '@/types';

export const revalidate = 1800;

interface PageProps {
  searchParams: { category?: string; page?: string; sortBy?: string };
}

async function getArticles(category?: string, page = 1, sortBy = 'score') {
  const limit = 20;
  const offset = (page - 1) * limit;
  let query = supabase
    .from('articles').select('*', { count: 'exact' })
    .eq('is_published', true).eq('is_archived', false);
  if (category && category !== 'すべて') query = query.eq('category', category);
  if (sortBy === 'date') query = query.order('original_published_at', { ascending: false });
  else query = query.order('score_total', { ascending: false });
  const { data, count } = await query.range(offset, offset + limit - 1);
  return { articles: (data || []) as Article[], total: count || 0 };
}

async function getRankings() {
  const [top, japan, us, earnings] = await Promise.all([
    supabase.from('articles').select('*').eq('is_published', true).eq('is_archived', false).order('score_total', { ascending: false }).limit(10),
    supabase.from('articles').select('*').eq('is_published', true).eq('is_archived', false).eq('category', '日本株').order('score_total', { ascending: false }).limit(10),
    supabase.from('articles').select('*').eq('is_published', true).eq('is_archived', false).eq('category', '米国株').order('score_total', { ascending: false }).limit(10),
    supabase.from('articles').select('*').eq('is_published', true).eq('is_archived', false).eq('category', '決算・個別株').order('score_total', { ascending: false }).limit(10),
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
    <div className="min-h-screen" style={{background:'#f2f2f2'}}>
      <Header />
      <Suspense>
        <CategoryTabs />
      </Suspense>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
        {isTopPage ? (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            {/* 左: メインフィード */}
            <div className="xl:col-span-2 space-y-3">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-base font-semibold" style={{color:'#202124'}}>
                  最新の投資ニュース
                </h1>
                <SortToggle sortBy={sortBy} />
              </div>

              {articles.length === 0 ? <EmptyState /> : (
                <>
                  <div className="space-y-3">
                    {articles.map((article) => (
                      <div key={article.id} className="fade-in">
                        <NewsCard article={article} />
                      </div>
                    ))}
                  </div>
                  <Pagination page={page} totalPages={totalPages} category={category} sortBy={sortBy} />
                </>
              )}
            </div>

            {/* 右: ランキング */}
            {rankings && (
              <aside className="space-y-4">
                <RankingList title="今注目の投資ニュース" articles={rankings.top} icon="🏆" />
                <RankingList title="日本株ニュース" articles={rankings.japan} icon="🇯🇵" />
                <RankingList title="米国株ニュース" articles={rankings.us} icon="🇺🇸" />
                <RankingList title="決算ニュース" articles={rankings.earnings} icon="📊" />
              </aside>
            )}
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-base font-semibold" style={{color:'#202124'}}>
                {category}
                <span className="text-sm font-normal ml-2" style={{color:'#9aa0a6'}}>({total}件)</span>
              </h1>
              <SortToggle sortBy={sortBy} />
            </div>
            {articles.length === 0 ? <EmptyState /> : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {articles.map((article) => (
                    <div key={article.id} className="fade-in">
                      <NewsCard article={article} />
                    </div>
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
    <div className="flex items-center gap-0.5 rounded-full p-0.5" style={{background:'#f1f3f4'}}>
      <a href="?sortBy=score"
        className="px-3 py-1.5 rounded-full text-xs font-medium transition-all min-h-[30px] flex items-center"
        style={sortBy !== 'date'
          ? {background:'white', color:'#202124', boxShadow:'0 1px 2px rgba(0,0,0,0.1)'}
          : {color:'#5f6368'}}>
        注目順
      </a>
      <a href="?sortBy=date"
        className="px-3 py-1.5 rounded-full text-xs font-medium transition-all min-h-[30px] flex items-center"
        style={sortBy === 'date'
          ? {background:'white', color:'#202124', boxShadow:'0 1px 2px rgba(0,0,0,0.1)'}
          : {color:'#5f6368'}}>
        新着順
      </a>
    </div>
  );
}

function Pagination({ page, totalPages, category, sortBy }: { page: number; totalPages: number; category?: string; sortBy: string; }) {
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
        <a href={buildUrl(page - 1)}
          className="px-5 py-2.5 rounded-full text-sm font-medium transition-colors min-h-[44px] flex items-center"
          style={{background:'white', color:'#1a73e8', border:'1px solid #dadce0'}}>
          ← 前のページ
        </a>
      )}
      <span className="text-sm px-3" style={{color:'#5f6368'}}>{page} / {totalPages}</span>
      {page < totalPages && (
        <a href={buildUrl(page + 1)}
          className="px-5 py-2.5 rounded-full text-sm font-medium transition-colors min-h-[44px] flex items-center"
          style={{background:'white', color:'#1a73e8', border:'1px solid #dadce0'}}>
          次のページ →
        </a>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl" style={{border:'1px solid #e0e0e0'}}>
      <span className="text-5xl mb-4">📭</span>
      <p className="text-sm" style={{color:'#5f6368'}}>現在このカテゴリにニュースはありません</p>
      <p className="text-xs mt-2" style={{color:'#9aa0a6'}}>30分ごとに自動更新されます</p>
    </div>
  );
}

function Footer() {
  return (
    <footer className="mt-10 py-8 px-4 sm:px-6" style={{borderTop:'1px solid #e0e0e0'}}>
      <div className="max-w-7xl mx-auto text-center space-y-2">
        <p className="text-xs" style={{color:'#9aa0a6'}}>
          このサイトは投資ニュースのキュレーションサービスです。記事の転載は行っておらず、元記事への誘導を目的としています。
        </p>
        <p className="text-xs" style={{color:'#bdc1c6'}}>
          ※ 掲載情報は投資助言ではありません。投資は自己責任で行ってください。
        </p>
        <p className="text-xs mt-4" style={{color:'#dadce0'}}>© 2025 投資ニュース | Powered by AI</p>
      </div>
    </footer>
  );
}
