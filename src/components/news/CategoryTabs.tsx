'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { CATEGORIES } from '@/types';

const ALL_TABS = ['すべて', ...CATEGORIES];

const CATEGORY_ICONS: Record<string, string> = {
  'すべて':          '📰',
  '速報':            '⚡',
  '人気ニュース':    '🔥',
  '日本株':          '🇯🇵',
  '米国株':          '🇺🇸',
  '為替・金利':      '💱',
  '決算・個別株':    '📊',
  'テーマ株':        '🚀',
  '高配当・優待':    '💰',
  '新NISA・投資信託': '🏦',
  '暗号資産':        '₿',
  '経済・政策':      '🏛️',
  '海外市場':        '🌍',
};

export default function CategoryTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get('category') || 'すべて';

  const handleSelect = (cat: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (cat === 'すべて') {
      params.delete('category');
    } else {
      params.set('category', cat);
    }
    params.delete('page');
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="sticky top-14 sm:top-16 z-40 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700">
      <div className="max-w-7xl mx-auto">
        <div className="category-tabs flex overflow-x-auto px-4 sm:px-6 gap-1 py-2">
          {ALL_TABS.map((cat) => {
            const isActive = cat === current;
            return (
              <button
                key={cat}
                onClick={() => handleSelect(cat)}
                className={`
                  flex-none flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium
                  whitespace-nowrap transition-all duration-150 min-h-[40px]
                  ${isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }
                `}
              >
                <span className="text-base leading-none">
                  {CATEGORY_ICONS[cat] || '📌'}
                </span>
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
