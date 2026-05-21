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
    <section className="bg-slate-800/60 border border-slate-700 rounded-xl overflow-hidden">
      {/* ヘッダー */}
      <div className="flex items-center gap-2 px-4 sm:px-5 py-3.5 bg-slate-800 border-b border-slate-700">
        <span className="text-lg leading-none">{icon}</span>
        <h2 className="text-sm sm:text-base font-bold text-white">{title}</h2>
        <span className="ml-auto text-xs text-slate-500">TOP{Math.min(articles.length, 10)}</span>
      </div>

      {/* リスト */}
      <ol className="divide-y divide-slate-700/50">
        {articles.slice(0, 10).map((article, idx) => (
          <li key={article.id}>
            <a
              href={article.original_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 px-4 sm:px-5 py-3.5 hover:bg-slate-700/40 transition-colors group min-h-[56px]"
            >
              {/* 順位 */}
              <span className={`
                flex-none w-6 h-6 flex items-center justify-center rounded text-xs font-bold mt-0.5
                ${idx === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                  idx === 1 ? 'bg-slate-500/20 text-slate-300' :
                  idx === 2 ? 'bg-orange-500/20 text-orange-400' :
                  'text-slate-500'}
              `}>
                {idx + 1}
              </span>

              {/* コンテンツ */}
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-slate-200 leading-snug line-clamp-2 group-hover:text-blue-300 transition-colors">
                  {article.original_title}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] text-slate-500 truncate max-w-[100px]">
                    {article.source_name}
                  </span>
                  <span className="text-[10px] text-slate-600">·</span>
                  <span className="text-[10px] text-slate-500 flex-none">
                    {formatDistanceToNow(article.original_published_at || article.created_at)}
                  </span>
                  {article.score_total >= 60 && (
                    <>
                      <span className="text-[10px] text-slate-600">·</span>
                      <span className="text-[10px] text-green-400 font-medium flex-none">
                        スコア {Math.round(article.score_total)}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* 矢印 */}
              <span className="flex-none text-slate-600 group-hover:text-blue-400 transition-colors text-xs mt-1">
                →
              </span>
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}
