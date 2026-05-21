import type { Article } from '@/types';
import { formatDistanceToNow } from '@/lib/utils/date';

interface NewsCardProps {
  article: Article;
  rank?: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  '速報':            'bg-red-500/20 text-red-300 border-red-500/30',
  '人気ニュース':    'bg-orange-500/20 text-orange-300 border-orange-500/30',
  '日本株':          'bg-blue-500/20 text-blue-300 border-blue-500/30',
  '米国株':          'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  '為替・金利':      'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  '決算・個別株':    'bg-green-500/20 text-green-300 border-green-500/30',
  'テーマ株':        'bg-purple-500/20 text-purple-300 border-purple-500/30',
  '高配当・優待':    'bg-pink-500/20 text-pink-300 border-pink-500/30',
  '新NISA・投資信託':'bg-teal-500/20 text-teal-300 border-teal-500/30',
  '暗号資産':        'bg-amber-500/20 text-amber-300 border-amber-500/30',
  '経済・政策':      'bg-slate-500/20 text-slate-300 border-slate-500/30',
  '海外市場':        'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
};

function ScoreBadge({ score, label }: { score: number; label: string }) {
  const color = score >= 70 ? 'text-green-400' : score >= 40 ? 'text-yellow-400' : 'text-slate-400';
  return (
    <div className="flex flex-col items-center">
      <span className={`text-xs font-bold ${color}`}>{Math.round(score)}</span>
      <span className="text-[10px] text-slate-500">{label}</span>
    </div>
  );
}

export default function NewsCard({ article, rank }: NewsCardProps) {
  const categoryColor = CATEGORY_COLORS[article.category] || 'bg-slate-500/20 text-slate-300 border-slate-500/30';
  const timeAgo = formatDistanceToNow(article.original_published_at || article.created_at);

  return (
    <article className="news-card bg-slate-800/80 border border-slate-700 rounded-xl overflow-hidden">
      <a
        href={article.original_url}
        target="_blank"
        rel="noopener noreferrer"
        className="block p-4 sm:p-5 hover:bg-slate-800 transition-colors"
      >
        {/* ヘッダー行 */}
        <div className="flex items-start gap-3 mb-3">
          {/* ランク番号 */}
          {rank !== undefined && (
            <span className={`
              flex-none w-7 h-7 flex items-center justify-center
              rounded-full text-sm font-bold
              ${rank === 1 ? 'bg-yellow-500/20 text-yellow-400 rank-1' :
                rank === 2 ? 'bg-slate-500/20 text-slate-300 rank-2' :
                rank === 3 ? 'bg-orange-500/20 text-orange-400 rank-3' :
                'bg-slate-700 text-slate-400'}
            `}>
              {rank}
            </span>
          )}

          {/* タイトル */}
          <h3 className="flex-1 text-sm sm:text-base font-semibold text-slate-100 leading-snug hover:text-blue-300 transition-colors line-clamp-3">
            {article.original_title}
          </h3>
        </div>

        {/* AI要約 */}
        {article.ai_summary && (
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-3 line-clamp-3">
            {article.ai_summary}
          </p>
        )}

        {/* 投資家向けポイント */}
        {article.ai_points && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2 mb-3">
            <p className="text-xs text-blue-300 leading-relaxed">
              <span className="font-medium">💡 投資家向けポイント: </span>
              {article.ai_points}
            </p>
          </div>
        )}

        {/* タグ行 */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {/* カテゴリ */}
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${categoryColor}`}>
            {article.category}
          </span>

          {/* 関連銘柄 */}
          {article.ai_tickers?.slice(0, 3).map((ticker) => (
            <span key={ticker} className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-700 text-slate-300 border border-slate-600">
              {ticker}
            </span>
          ))}

          {/* 関連指数 */}
          {article.ai_indices?.slice(0, 2).map((index) => (
            <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-700/50 text-slate-400 border border-slate-600/50">
              {index}
            </span>
          ))}
        </div>

        {/* フッター行 */}
        <div className="flex items-center justify-between gap-2">
          {/* ソース・時刻 */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-medium text-slate-400 truncate max-w-[120px]">
              {article.source_name}
            </span>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs text-slate-500 flex-none">{timeAgo}</span>
          </div>

          {/* スコア */}
          <div className="flex items-center gap-3 flex-none">
            <ScoreBadge score={article.score_total} label="総合" />
            <ScoreBadge score={article.score_impact} label="影響" />
          </div>
        </div>
      </a>

      {/* 元記事リンクボタン（スマホでタップしやすいサイズ） */}
      <div className="border-t border-slate-700 px-4 sm:px-5 py-2.5">
        <a
          href={article.original_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between w-full text-xs text-blue-400 hover:text-blue-300 transition-colors group"
        >
          <span className="flex items-center gap-1.5">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            元記事を読む
          </span>
          <span className="text-slate-500 group-hover:text-blue-400 transition-colors">→</span>
        </a>
      </div>
    </article>
  );
}
