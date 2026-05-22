'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200" style={{boxShadow:'0 1px 3px rgba(0,0,0,0.08)'}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">

          {/* ロゴ */}
          <Link href="/" className="flex items-center gap-2.5 min-w-0">
            <div className="flex items-center justify-center w-8 h-8 rounded-full" style={{background:'#1a73e8'}}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                <path d="M3 17l4-8 4 4 4-6 4 6" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-bold text-base sm:text-lg truncate" style={{color:'#202124', letterSpacing:'-0.3px'}}>
              投資ニュース
            </span>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium" style={{background:'#e8f0fe', color:'#1a73e8'}}>
              AI要約
            </span>
          </Link>

          {/* デスクトップナビ */}
          <nav className="hidden md:flex items-center gap-1 text-sm">
            {[
              { href: '/', label: 'トップ' },
              { href: '/?category=日本株', label: '日本株' },
              { href: '/?category=米国株', label: '米国株' },
              { href: '/?category=決算・個別株', label: '決算' },
              { href: '/?category=テーマ株', label: 'テーマ株' },
              { href: '/?category=為替・金利', label: '為替' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-1.5 rounded-full text-sm transition-colors"
                style={{color:'#5f6368'}}
                onMouseEnter={e => { (e.target as HTMLElement).style.background='#f1f3f4'; (e.target as HTMLElement).style.color='#202124'; }}
                onMouseLeave={e => { (e.target as HTMLElement).style.background='transparent'; (e.target as HTMLElement).style.color='#5f6368'; }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* 右側 */}
          <div className="flex items-center gap-2">
            <UpdateTime />
            <Link
              href="/admin"
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full text-xs transition-colors"
              style={{color:'#5f6368', border:'1px solid #dadce0'}}
            >
              管理
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-full transition-colors"
              style={{color:'#5f6368'}}
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
        <div className="md:hidden border-t bg-white" style={{borderColor:'#e0e0e0'}}>
          <nav className="flex flex-col py-2">
            {[
              { href: '/', label: 'トップ' },
              { href: '/?category=速報', label: '⚡ 速報' },
              { href: '/?category=日本株', label: '🇯🇵 日本株' },
              { href: '/?category=米国株', label: '🇺🇸 米国株' },
              { href: '/?category=決算・個別株', label: '📊 決算' },
              { href: '/?category=テーマ株', label: '🚀 テーマ株' },
              { href: '/?category=為替・金利', label: '💱 為替・金利' },
              { href: '/?category=高配当・優待', label: '💰 高配当・優待' },
              { href: '/?category=暗号資産', label: '₿ 暗号資産' },
              { href: '/admin', label: '⚙️ 管理画面' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="px-5 py-3 text-sm transition-colors"
                style={{color:'#202124'}}
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
  const timeStr = now.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  return (
    <div className="flex items-center gap-1.5 text-xs" style={{color:'#5f6368'}}>
      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{background:'#34a853'}} />
      <span className="hidden sm:inline">{timeStr} 更新</span>
    </div>
  );
}
