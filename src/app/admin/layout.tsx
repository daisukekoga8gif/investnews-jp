import Link from 'next/link';
import { headers } from 'next/headers';

const NAV_ITEMS = [
  { href: '/admin', label: 'ダッシュボード', icon: '📊' },
  { href: '/admin/articles', label: 'ニュース管理', icon: '📰' },
  { href: '/admin/sources', label: 'ソース管理', icon: '🔗' },
  { href: '/admin/settings', label: '設定', icon: '⚙️' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* 管理ヘッダー */}
      <header className="bg-slate-900 border-b border-slate-700 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm">
              ← サイトへ
            </Link>
            <span className="text-slate-600">|</span>
            <span className="font-bold text-white text-sm">管理画面</span>
          </div>
          <span className="text-xs text-slate-500">投資ニュース Admin</span>
        </div>
      </header>

      <div className="flex max-w-7xl mx-auto">
        {/* サイドバー（PC）/ 横ナビ（スマホ） */}
        <nav className="w-full md:w-52 md:min-h-screen border-b md:border-b-0 md:border-r border-slate-800 md:pt-6">
          <div className="flex md:flex-col overflow-x-auto md:overflow-visible gap-1 p-3 md:p-3 category-tabs">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex-none md:flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors whitespace-nowrap"
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>

        {/* メインコンテンツ */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
