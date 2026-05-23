import { supabase } from '@/lib/supabase';
import type { Article } from '@/types';
import { formatDistanceToNow } from '@/lib/utils/date';
import RankingSidebar from '@/components/news/RankingSidebar';
export const revalidate = 1800;

interface PageProps {
  searchParams: { category?: string; page?: string; sortBy?: string };
}

const CATEGORIES = ['すべて','速報','日本株','米国株','為替・金利','決算・個別株','テーマ株','高配当・優待','新NISA・投資信託','暗号資産','経済・政策','海外市場'];

async function getArticles(category?: string, page = 1, sortBy = 'score') {
  const limit = 20;
  const offset = (page - 1) * limit;
  let query = supabase.from('articles').select('*', { count: 'exact' }).eq('is_published', true).eq('is_archived', false);
  if (category && category !== 'すべて') query = query.eq('category', category);
  if (sortBy === 'date') query = query.order('original_published_at', { ascending: false });
  else query = query.order('score_total', { ascending: false });
  const { data, count } = await query.range(offset, offset + limit - 1);
  return { articles: (data || []) as Article[], total: count || 0 };
}

async function getRankings() {
  const [top, japan, us] = await Promise.all([
    supabase.from('articles').select('*').eq('is_published', true).eq('is_archived', false).order('score_total', { ascending: false }).limit(10),
    supabase.from('articles').select('*').eq('is_published', true).eq('is_archived', false).eq('category', '日本株').order('score_total', { ascending: false }).limit(10),
    supabase.from('articles').select('*').eq('is_published', true).eq('is_archived', false).eq('category', '米国株').order('score_total', { ascending: false }).limit(10),
  ]);
  return { top: (top.data || []) as Article[], japan: (japan.data || []) as Article[], us: (us.data || []) as Article[] };
}

export default async function HomePage({ searchParams }: PageProps) {
  const category = searchParams.category;
  const page = parseInt(searchParams.page || '1', 10);
  const sortBy = searchParams.sortBy || 'score';
  const isTopPage = !category;
  const [{ articles, total }, rankings] = await Promise.all([getArticles(category, page, sortBy), isTopPage ? getRankings() : Promise.resolve(null)]);

  return (
    <div style={{minHeight:'100vh', background:'#f2f2f2', fontFamily:'Noto Sans JP, sans-serif'}}>
      {/* ヘッダー */}
      <header style={{background:'white', borderBottom:'1px solid #e0e0e0', position:'sticky', top:0, zIndex:50, boxShadow:'0 1px 3px rgba(0,0,0,0.08)'}}>
        <div style={{maxWidth:'1200px', margin:'0 auto', padding:'0 16px', display:'flex', alignItems:'center', justifyContent:'space-between', height:'56px'}}>
          <a href="/" style={{display:'flex', alignItems:'center', gap:'8px', textDecoration:'none'}}>
            <div style={{width:'32px', height:'32px', background:'#1a73e8', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center'}}>
              <span style={{color:'white', fontSize:'16px'}}>📈</span>
            </div>
            <span style={{fontWeight:'700', fontSize:'18px', color:'#202124'}}>投資ニュース</span>
            <span style={{background:'#e8f0fe', color:'#1a73e8', fontSize:'11px', padding:'2px 8px', borderRadius:'100px', fontWeight:'600'}}>AI要約</span>
          </a>
          <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
            <span style={{width:'8px', height:'8px', background:'#34a853', borderRadius:'50%', display:'inline-block'}}></span>
            <a href="/admin" style={{color:'#5f6368', fontSize:'12px', textDecoration:'none', border:'1px solid #dadce0', padding:'4px 12px', borderRadius:'100px'}}>管理</a>
          </div>
        </div>
      </header>

      {/* カテゴリタブ */}
      <div style={{background:'white', borderBottom:'1px solid #e0e0e0', position:'sticky', top:'56px', zIndex:40, overflowX:'auto', whiteSpace:'nowrap'}}>
        <div style={{maxWidth:'1200px', margin:'0 auto', padding:'8px 16px', display:'flex', gap:'4px'}}>
          {CATEGORIES.map(cat => (
            <a key={cat} href={cat === 'すべて' ? '/' : `/?category=${cat}`}
              style={{display:'inline-flex', alignItems:'center', padding:'6px 14px', borderRadius:'100px', fontSize:'13px', textDecoration:'none', whiteSpace:'nowrap', background: (category || 'すべて') === cat ? '#e8f0fe' : 'transparent', color: (category || 'すべて') === cat ? '#1a73e8' : '#5f6368', fontWeight: (category || 'すべて') === cat ? '600' : '400'}}>
              {cat}
            </a>
          ))}
        </div>
      </div>

      {/* メインコンテンツ */}
      <main style={{maxWidth:'1200px', margin:'0 auto', padding:'20px 16px'}}>
        <div className={isTopPage ? 'grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6' : 'grid grid-cols-1'}>
          {/* 左：ニュースフィード */}
          <div>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px'}}>
              <h1 style={{fontSize:'18px', fontWeight:'700', color:'#202124', margin:0}}>{category || '最新の投資ニュース'}</h1>
              <div style={{display:'flex', gap:'4px', background:'#f1f3f4', borderRadius:'100px', padding:'2px'}}>
                <a href={`${category ? `/?category=${category}` : '/'}`} style={{padding:'4px 12px', borderRadius:'100px', fontSize:'12px', textDecoration:'none', background: sortBy !== 'date' ? 'white' : 'transparent', color: sortBy !== 'date' ? '#202124' : '#5f6368', fontWeight: sortBy !== 'date' ? '600' : '400', boxShadow: sortBy !== 'date' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'}}>注目順</a>
                <a href={`${category ? `/?category=${category}&` : '/?'}sortBy=date`} style={{padding:'4px 12px', borderRadius:'100px', fontSize:'12px', textDecoration:'none', background: sortBy === 'date' ? 'white' : 'transparent', color: sortBy === 'date' ? '#202124' : '#5f6368', fontWeight: sortBy === 'date' ? '600' : '400', boxShadow: sortBy === 'date' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'}}>新着順</a>
              </div>
            </div>

            {articles.length === 0 ? (
              <div style={{background:'white', border:'1px solid #e0e0e0', borderRadius:'12px', padding:'48px', textAlign:'center'}}>
                <p style={{color:'#5f6368', fontSize:'14px'}}>現在ニュースはありません</p>
                <p style={{color:'#9aa0a6', fontSize:'12px', marginTop:'8px'}}>30分ごとに自動更新されます</p>
              </div>
            ) : (
              <div>
                {articles.map((article) => (
                  <div key={article.id} style={{background:'white', border:'1px solid #e0e0e0', borderRadius:'12px', marginBottom:'12px', overflow:'hidden'}}>
                    <a href={article.original_url} target="_blank" rel="noopener noreferrer" style={{display:'block', padding:'16px', textDecoration:'none'}}>
                      <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px'}}>
                        <span style={{fontSize:'12px', color:'#1a73e8', fontWeight:'500'}}>{article.source_name}</span>
                        <span style={{fontSize:'12px', color:'#9aa0a6'}}>· {formatDistanceToNow(article.original_published_at || article.created_at)}</span>
                      </div>
                      <h3 style={{fontSize:'15px', fontWeight:'600', color:'#202124', lineHeight:'1.5', margin:'0 0 8px 0'}}>{article.original_title}</h3>
                      {article.ai_summary && <p style={{fontSize:'13px', color:'#5f6368', lineHeight:'1.6', margin:'0 0 10px 0'}}>{article.ai_summary}</p>}
                      {article.ai_points && (
                        <div style={{background:'#e8f0fe', borderRadius:'8px', padding:'8px 12px', marginBottom:'10px'}}>
                          <p style={{fontSize:'12px', color:'#1557b0', margin:0}}>💡 {article.ai_points}</p>
                        </div>
                      )}
                      <div style={{display:'flex', flexWrap:'wrap', gap:'6px'}}>
                        <span style={{background:'#f1f3f4', color:'#3c4043', fontSize:'11px', padding:'2px 8px', borderRadius:'100px'}}>{article.category}</span>
                        {article.ai_tickers?.slice(0,3).map(t => <span key={t} style={{background:'#e8f0fe', color:'#1a73e8', fontSize:'11px', padding:'2px 8px', borderRadius:'100px'}}>{t}</span>)}
                      </div>
                    </a>
                    <div style={{padding:'8px 16px', borderTop:'1px solid #f1f3f4'}}>
                      <a href={article.original_url} target="_blank" rel="noopener noreferrer" style={{fontSize:'12px', color:'#1a73e8', textDecoration:'none'}}>元記事を読む →</a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 右：ランキング */}
          {isTopPage && rankings && (
            <aside style={{display:'none'}} className="md-sidebar">
              {[
                { title:'今注目のニュース', icon:'🏆', articles: rankings.top },
                { title:'日本株ニュース', icon:'🇯🇵', articles: rankings.japan },
                { title:'米国株ニュース', icon:'🇺🇸', articles: rankings.us },
              ].map(section => (
                <div key={section.title} style={{background:'white', border:'1px solid #e0e0e0', borderRadius:'12px', overflow:'hidden'}}>
                  <div style={{padding:'12px 16px', borderBottom:'1px solid #f1f3f4', display:'flex', alignItems:'center', gap:'8px'}}>
                    <span>{section.icon}</span>
                    <span style={{fontSize:'14px', fontWeight:'600', color:'#202124'}}>{section.title}</span>
                  </div>
                  <ol style={{margin:0, padding:0, listStyle:'none'}}>
                    {section.articles.slice(0,10).map((article, idx) => (
                      <li key={article.id} style={{borderBottom:'1px solid #f8f9fa'}}>
                        <a href={article.original_url} target="_blank" rel="noopener noreferrer" style={{display:'flex', gap:'12px', padding:'10px 16px', textDecoration:'none'}}>
                          <span style={{color: idx===0?'#fbbc04':idx===1?'#9aa0a6':idx===2?'#e37400':'#9aa0a6', fontWeight:'700', fontSize:'13px', minWidth:'16px'}}>{idx+1}</span>
                          <span style={{fontSize:'13px', color:'#202124', lineHeight:'1.4'}}>{article.original_title}</span>
                        </a>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </aside>
          )}
        </div>
      </main>

      <footer style={{borderTop:'1px solid #e0e0e0', padding:'24px 16px', textAlign:'center', marginTop:'24px'}}>
        <p style={{fontSize:'12px', color:'#9aa0a6', margin:'0 0 8px 0'}}>このサイトは投資ニュースのキュレーションサービスです。記事の転載は行っておらず、元記事への誘導を目的としています。</p>
        <p style={{fontSize:'11px', color:'#bdc1c6', margin:0}}>※掲載情報は投資助言ではありません。投資は自己責任で行ってください。</p>
      </footer>
    </div>
  );
}
