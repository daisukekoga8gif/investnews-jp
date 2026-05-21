'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* ロゴ */}
          <Link href="/" className="flex items-center gap-2 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-blue-400 text-xl">📈</span>
              <span className="font-bold text-base sm:text-lg text-white truncate">
                投資ニュース
              </span>
            </div>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
              AI要約
            </span>
          </Link>

          {/* デスクトップナビ */}
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-300">
            <Link href="/" className="hover:text-white transition-colors">
              トップ
            </Link>
            <Link href="/?category=日本株" className="hover:text-white transition-colors">
              日本株
            </Link>
            <Link href="/?category=米国株" className="hover:text-white transition-colors">
              米国株
            </Link>
            <Link href="/?category=決算・個別株" className="hover:text-white transition-colors">
              決算
            </Link>
            <Link href="/?category=テーマ株" className="hover:text-white transition-colors">
              テーマ株
            </Link>
          </nav>

          {/* 右側 */}
          <div className="flex items-center gap-3">
            {/* 更新時刻 */}
            <UpdateTime />

            {/* 管理リンク（本番では認証必要） */}
            <Link
              href="/admin"
              className="hidden sm:flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              <span>管理</span>
            </Link>

            {/* ハンバーガー（モバイル） */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              aria-label="メニュー"
            >
              {menuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* モバイルメニュー */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-700 bg-slate-900">
          <nav className="flex flex-col py-2">
            {[
              { href: '/', label: '🏠 トップ' },
              { href: '/?category=速報', label: '⚡ 速報' },
              { href: '/?category=日本株', label: '🇯🇵 日本株' },
              { href: '/?category=米国株', label: '🇺🇸 米国株' },
              { href: '/?category=決算・個別株', label: '📊 決算' },
              { href: '/?category=テーマ株', label: '🔥 テーマ株' },
              { href: '/?category=為替・金利', label: '💱 為替・金利' },
              { href: '/?category=高配当・優待', label: '💰 高配当・優待' },
              { href: '/?category=暗号資産', label: '₿ 暗号資産' },
              { href: '/admin', label: '⚙️ 管理画面' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

function UpdateTime() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex items-center gap-1 text-xs text-slate-400">
      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
      <span className="hidden sm:inline">{timeStr} 更新</span>
    </div>
  );
}
