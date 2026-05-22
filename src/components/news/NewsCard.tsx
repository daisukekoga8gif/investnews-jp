import type { Article } from '@/types';
import { formatDistanceToNow } from '@/lib/utils/date';

interface NewsCardProps {
  article: Article;
  rank?: number;
}

const CATEGORY_COLORS: Record<string, {bg: string; text: string}> = {
  '速報':            {bg:'#fce8e6', text:'#c5221f'},
  '人気ニュース':    {bg:'#fef3e2', text:'#b06000'},
  '日本株':          {bg:'#e8f0fe', text:'#1a73e8'},
  '米国株':          {bg:'#e8eaf6', text:'#3949ab'},
  '為替・金利':      {bg:'#fff8e1', text:'#e37400'},
  '決算・個別株':    {bg:'#e6f4ea', text:'#137333'},
  'テーマ株':        {bg:'#f3e8fd', text:'#7b1fa2'},
  '高配当・優待':    {bg:'#fce4ec', text:'#ad1457'},
  '新NISA・投資信託':{bg:'#e0f7fa', text:'#00695c'},
  '暗号資産':        {bg:'#fff3e0', text:'#e65100'},
  '経済・政策':      {bg:'#f1f3f4', text:'#5f6368'},
  '海外市場':        {bg:'#e3f2fd', text:'#1565c0'},
};

export default function NewsCard({ article, rank }: NewsCardProps) {
  const cat = CATEGORY_COLORS[article.category] || {bg:'#f1f3f4', text:'#5f6368'};
  const timeAgo = formatDistanceToNow(article.original_published_at || article.created_at);
  const score = Math.round(article.score_total);

  return (
    <article className="news-card bg-white rounded-xl overflow-hidden" style={{border:'1px solid #e0e0e0'}}>
      <a href={article.original_url} target="_blank" rel="noopener noreferrer" className="block p-4 sm:p-5">

        {/* ヘッダー行 */}
        <div className="flex items-start gap-3 mb-2.5">
          {rank !== undefined && (
            <span className={`flex-none w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold mt-0.5
              ${rank === 1 ? 'rank-1' : rank === 2 ? 'rank-2' : rank === 3 ? 'rank-3' : ''}`}
              style={rank > 3 ? {color:'#9aa0a6', fontWeight:700} : {}}
            >
              {rank}
            </span>
          )}

          <div className="flex-1 min-w-0">
            {/* ソース・時刻 */}
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-xs font-medium truncate max-w-[120px]" style={{color:'#1a73e8'}}>
                {article.source_name}
              </span>
              <span className="text-xs" style={{color:'#dadce0'}}>·</span>
              <span className="text-xs flex-none" style={{color:'#9aa0a6'}}>{timeAgo}</span>
            </div>

            {/* タイトル */}
            <h3 className="text-sm sm:text-[15px] font-semibold leading-snug line-clamp-2" style={{color:'#202124'}}>
              {article.original_title}
            </h3>
          </div>
        </div>

        {/* AI要約 */}
        {article.ai_summary && (
          <p className="text-xs sm:text-sm leading-relaxed mb-3 line-clamp-2" style={{color:'#5f6368'}}>
            {article.ai_summary}
          </p>
        )}

        {/* 投資家向けポイント */}
        {article.ai_points && (
          <div className="rounded-lg px-3 py-2 mb-3" style={{background:'#e8f0fe'}}>
            <p className="text-xs leading-relaxed" style={{color:'#1557b0'}}>
              <span className="font-semibold">💡 </span>
              {article.ai_points}
            </p>
          </div>
        )}

        {/* タグ行 */}
        <div className="flex flex-wrap gap-1.5">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium"
            style={{background: cat.bg, color: cat.text}}>
            {article.category}
          </span>
          {article.ai_tickers?.slice(0, 3).map((ticker) => (
            <span key={ticker} className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium"
              style={{background:'#f1f3f4', color:'#3c4043', border:'1px solid #e0e0e0'}}>
              {ticker}
            </span>
          ))}
          {article.ai_indices?.slice(0, 2).map((index) => (
            <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px]"
              style={{background:'#f8f9fa', color:'#80868b', border:'1px solid #ebebeb'}}>
              {index}
            </span>
          ))}
          {score >= 50 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ml-auto"
              style={{background:'#e6f4ea', color:'#137333'}}>
              注目度 {score}
            </span>
          )}
        </div>
      </a>

      {/* フッター */}
      <div className="px-4 sm:px-5 py-2.5 flex items-center justify-between" style={{borderTop:'1px solid #f1f3f4'}}>
        <a href={article.original_url} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs font-medium transition-colors"
          style={{color:'#1a73e8'}}>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          元記事を読む
        </a>
        <span className="text-[11px]" style={{color:'#9aa0a6'}}>{article.source_name}</span>
      </div>
    </article>
  );
}
