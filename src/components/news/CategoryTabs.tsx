'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { CATEGORIES } from '@/types';

const ALL_TABS = ['すべて', ...CATEGORIES];

const CATEGORY_ICONS: Record<string, string> = {
  'すべて': '📰', '速報': '⚡', '人気ニュース': '🔥',
  '日本株': '🇯🇵', '米国株': '🇺🇸', '為替・金利': '💱',
  '決算・個別株': '📊', 'テーマ株': '🚀', '高配当・優待': '💰',
  '新NISA・投資信託': '🏦', '暗号資産': '₿', '経済・政策': '🏛️', '海外市場': '🌍',
};

export default function CategoryTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get('category') || 'すべて';

  const handleSelect = (cat: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (cat === 'すべて') { params.delete('category'); } else { params.set('category', cat); }
    params.delete('page');
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="sticky z-40 bg-white border-b" style={{top:'56px', borderColor:'#e0e0e0'}}>
      <div className="max-w-7xl mx-auto">
        <div className="category-tabs flex overflow-x-auto px-4 sm:px-6 gap-0.5 py-1.5">
          {ALL_TABS.map((cat) => {
            const isActive = cat === current;
            return (
              <button
                key={cat}
                onClick={() => handleSelect(cat)}
                className="flex-none flex items-center gap-1.5 px-3 py-2 rounded-full text-sm whitespace-nowrap transition-all duration-150 min-h-[36px]"
                style={{
                  background: isActive ? '#e8f0fe' : 'transparent',
                  color: isActive ? '#1a73e8' : '#5f6368',
                  fontWeight: isActive ? '600' : '400',
                }}
              >
                <span className="text-sm leading-none">{CATEGORY_ICONS[cat] || '📌'}</span>
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
