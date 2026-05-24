import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

async function getStats() {
  const [total, published, today, sources] = await Promise.all([
    supabaseAdmin.from('articles').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('articles').select('id', { count: 'exact', head: true }).eq('is_published', true).eq('is_archived', false),
    supabaseAdmin.from('articles').select('id', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
    supabaseAdmin.from('sources').select('id', { count: 'exact', head: true }).eq('is_active', true),
  ]);

  return {
    total: total.count || 0,
    published: published.count || 0,
    today: today.count || 0,
    sources: sources.count || 0,
  };
}

async function getRecentArticles() {
  const { data } = await supabaseAdmin
    .from('articles')
    .select('id, original_title, source_name, category, score_total, is_published, created_at')
    .order('created_at', { ascending: false })
    .limit(20);
  return data || [];
}

export default async function AdminDashboard() {
  const [stats, recentArticles] = await Promise.all([getStats(), getRecentArticles()]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-white">ダッシュボード</h1>

      {/* 統計カード */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: '総記事数', value: stats.total, icon: '📰', color: 'text-blue-400' },
          { label: '公開中', value: stats.published, icon: '✅', color: 'text-green-400' },
          { label: '24時間以内', value: stats.today, icon: '🕐', color: 'text-yellow-400' },
          { label: '有効ソース', value: stats.sources, icon: '🔗', color: 'text-purple-400' },
        ].map((stat) => (
          <div key={stat.label} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{stat.icon}</span>
              <span className="text-xs text-slate-400">{stat.label}</span>
            </div>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* 手動Cron実行ボタン */}
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <h2 className="text-sm font-semibold text-white mb-3">手動操作</h2>
        <div className="flex flex-wrap gap-3">
          <FetchButton />
          <BackfillButton />
        </div>
        <p className="text-[11px] text-slate-500 mt-3">
          ※ バックフィルは過去記事のうち AI 要約が欠落している分（最大 30 件/回）を Sonnet 4.6 で再分析します。
          完了後に has_more が true なら再度押してください。1 回 60〜90 秒ほどかかります。
        </p>
      </div>

      {/* 最近の記事 */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-700">
          <h2 className="text-sm font-semibold text-white">最新取得記事</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-700">
                <th className="text-left px-4 py-2.5">タイトル</th>
                <th className="text-left px-4 py-2.5 whitespace-nowrap">ソース</th>
                <th className="text-left px-4 py-2.5 whitespace-nowrap">カテゴリ</th>
                <th className="text-right px-4 py-2.5 whitespace-nowrap">スコア</th>
                <th className="text-left px-4 py-2.5 whitespace-nowrap">状態</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {recentArticles.map((a) => (
                <tr key={a.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-4 py-2.5 max-w-xs">
                    <p className="truncate text-slate-200">{a.original_title}</p>
                  </td>
                  <td className="px-4 py-2.5 text-slate-400 whitespace-nowrap">{a.source_name}</td>
                  <td className="px-4 py-2.5 text-slate-400 whitespace-nowrap">{a.category}</td>
                  <td className="px-4 py-2.5 text-right font-medium text-blue-400 whitespace-nowrap">
                    {Math.round(a.score_total)}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium
                      ${a.is_published ? 'bg-green-500/20 text-green-400' : 'bg-slate-600/20 text-slate-400'}`}>
                      {a.is_published ? '公開' : '非公開'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// クライアントコンポーネントでフェッチボタン
function FetchButton() {
  return (
    <form action="/api/admin/fetch" method="POST">
      <button
        type="submit"
        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors min-h-[44px]"
      >
        🔄 今すぐニュース取得
      </button>
    </form>
  );
}

function BackfillButton() {
  return (
    <form action="/api/admin/backfill-ai-trigger" method="POST">
      <button
        type="submit"
        className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors min-h-[44px]"
      >
        🧠 AI要約バックフィル実行
      </button>
    </form>
  );
}
