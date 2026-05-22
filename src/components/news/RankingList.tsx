import type { Article } from '@/types';
import { formatDistanceToNow } from '@/lib/utils/date';

interface RankingListProps {
  title: string;
  articles: Article[];
  icon?: string;
}

export default function RankingList({ title, articles, icon = '🏆' }: RankingListProps) {
  if (!articles || articles.length === 0) return null;

  return (
    <section className="bg-white rounded-xl overflow-hidden" style={{border:'1px solid #e0e0e0'}}>
      <div className="flex items-center gap-2 px-4 py-3" style={{borderBottom:'1px solid #f1f3f4'}}>
        <span className="text-base leading-none">{icon}</span>
        <h2 className="text-sm font-semibold" style={{color:'#202124'}}>{title}</h2>
        <span className="ml-auto text-xs" style={{color:'#9aa0a6'}}>TOP{Math.min(articles.length, 10)}</span>
      </div>
      <ol>
        {articles.slice(0, 10).map((article, idx) => (
          <li key={article.id} style={{borderBottom:'1px solid #f1f3f4'}}>
            <a href={article.original_url} target="_blank" rel="noopener noreferrer"
              className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group min-h-[52px]">
              <span className={`flex-none w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5
                ${idx === 0 ? 'rank-1' : idx === 1 ? 'rank-2' : idx === 2 ? 'rank-3' : ''}`}
                style={idx > 2 ? {color:'#9aa0a6'} : {}}>
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors" style={{color:'#202124'}}>
                  {article.original_title}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[11px] truncate max-w-[100px]" style={{color:'#1a73e8'}}>{article.source_name}</span>
                  <span className="text-[11px]" style={{color:'#dadce0'}}>·</span>
                  <span className="text-[11px] flex-none" style={{color:'#9aa0a6'}}>
                    {formatDistanceToNow(article.original_published_at || article.created_at)}
                  </span>
                </div>
              </div>
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}