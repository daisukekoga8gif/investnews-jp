import { supabaseAdmin } from '@/lib/supabase';
import { formatDateTime } from '@/lib/utils/date';
import type { Source } from '@/types';

export const dynamic = 'force-dynamic';

async function getSources() {
  const { data } = await supabaseAdmin
    .from('sources')
    .select('*')
    .order('created_at', { ascending: false });
  return (data || []) as Source[];
}

export default async function SourcesPage() {
  const sources = await getSources();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-white">ソース管理</h1>
        <p className="text-xs text-slate-400">
          ※ 追加・削除はSupabaseのTable Editorで直接操作してください
        </p>
      </div>

      {/* ソース一覧 */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-700 bg-slate-800/80">
                <th className="text-left px-4 py-3 whitespace-nowrap">サイト名</th>
                <th className="text-left px-4 py-3 whitespace-nowrap">URL</th>
                <th className="text-left px-4 py-3 whitespace-nowrap">カテゴリ</th>
                <th className="text-right px-4 py-3 whitespace-nowrap">更新間隔</th>
                <th className="text-left px-4 py-3 whitespace-nowrap">最終取得</th>
                <th className="text-left px-4 py-3 whitespace-nowrap">状態</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {sources.map((source) => (
                <tr key={source.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-200 whitespace-nowrap">
                    {source.name}
                  </td>
                  <td className="px-4 py-3 max-w-[200px]">
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 truncate block"
                    >
                      {source.url}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                    {source.category || '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-400 whitespace-nowrap">
                    {source.fetch_interval_minutes}分
                  </td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                    {source.last_fetched_at
                      ? formatDateTime(source.last_fetched_at)
                      : '未取得'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium
                      ${source.is_active
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-slate-600/20 text-slate-400'}`}>
                      {source.is_active ? '有効' : '無効'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 追加方法の説明 */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-sm text-blue-300">
        <h3 className="font-semibold mb-2">📌 ソース追加方法</h3>
        <ol className="list-decimal list-inside space-y-1 text-xs text-blue-200">
          <li>Supabaseダッシュボード → Table Editor → sources テーブル</li>
          <li>「Insert row」から新規ソースを追加</li>
          <li>name, url (RSSのURL), type (rss), category, is_active (true) を入力</li>
          <li>robots_ok: robots.txtで許可されているか確認してから true に設定</li>
        </ol>
      </div>
    </div>
  );
}
