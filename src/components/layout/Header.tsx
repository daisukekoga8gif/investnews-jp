'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200" style={{boxShadow:'0 1px 3px rgba(0,0,0,0.08)'}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Link href="/" className="flex items-center gap-2.5 min-w-0">
            <span className="font-bold text-base sm:text-lg truncate" style={{color:'#202124'}}>📈 投資ニュース</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1 text-sm">
            <Link href="/" className="px-3 py-1.5 rounded-full text-sm hover:bg-gray-100" style={{color:'#5f6368'}}>トップ</Link>
            <Link href="/?category=日本株" className="px-3 py-1.5 rounded-full text-sm hover:bg-gray-100" style={{color:'#5f6368'}}>日本株</Link>
            <Link href="/?category=米国株" className="px-3 py-1.5 rounded-full text-sm hover:bg-gray-100" style={{color:'#5f6368'}}>米国株</Link>
            <Link href="/?category=決算・個別株" className="px-3 py-1.5 rounded-full text-sm hover:bg-gray-100" style={{color:'#5f6368'}}>決算</Link>
            <Link href="/?category=テーマ株" className="px-3 py-1.5 rounded-full text-sm hover:bg-gray-100" style={{color:'#5f6368'}}>テーマ株</Link>
          </nav>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{background:'#34a853'}} />
            <Link href="/admin" className="hidden sm:flex items-center px-3 py-1.5 rounded-full text-xs hover:bg-gray-100" style={{color:'#5f6368', border:'1px solid #dadce0'}}>管理</Link>
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-full hover:bg-gray-100" style={{color:'#5f6368'}} aria-label="メニュー">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {menuOpen && (
        <div className="md:hidden border-t bg-white" style={{borderColor:'#e0e0e0'}}>
          <nav className="flex flex-col py-2">
            <Link href="/" onClick={() => setMenuOpen(false)} className="px-5 py-3 text-sm hover:bg-gray-50" style={{color:'#202124'}}>トップ</Link>
            <Link href="/?category=日本株" onClick={() => setMenuOpen(false)} className="px-5 py-3 text-sm hover:bg-gray-50" style={{color:'#202124'}}>🇯🇵 日本株</Link>
            <Link href="/?category=米国株" onClick={() => setMenuOpen(false)} className="px-5 py-3 text-sm hover:bg-gray-50" style={{color:'#202124'}}>🇺🇸 米国株</Link>
            <Link href="/?category=決算・個別株" onClick={() => setMenuOpen(false)} className="px-5 py-3 text-sm hover:bg-gray-50" style={{color:'#202124'}}>📊 決算</Link>
            <Link href="/?category=テーマ株" onClick={() => setMenuOpen(false)} className="px-5 py-3 text-sm hover:bg-gray-50" style={{color:'#202124'}}>🚀 テーマ株</Link>
            <Link href="/admin" onClick={() => setMenuOpen(false)} className="px-5 py-3 text-sm hover:bg-gray-50" style={{color:'#202124'}}>⚙️ 管理画面</Link>
          </nav>
        </div>
      )}
    </header>
  );
}