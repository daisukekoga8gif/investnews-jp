'use client';
import { useState } from 'react';
import type { Article } from '@/types';

const TABS = [
  { key: 'japan',  label: '日本株', icon: '🇯🇵' },
  { key: 'us',     label: '米国株', icon: '🇺🇸' },
  { key: 'forex',  label: '為替・金利', icon: '💱' },
  { key: 'crypto', label: '暗号資産', icon: '₿' },
];

export default function RankingSidebar({ rankings }: { rankings: { japan: Article[], us: Article[], forex: Article[], crypto: Article[] } }) {
  const [active, setActive] = useState('japan');
  const articles = rankings[active as keyof typeof rankings] || [];

  return (
    <aside style={{background:'white', border:'1px solid #e0e0e0', borderRadius:'12px', overflow:'hidden'}}>
      {/* タブ */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', borderBottom:'1px solid #e0e0e0'}}>
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActive(tab.key)} style={{
            padding:'8px 4px', border:'none', cursor:'pointer', fontSize:'11px', fontWeight: active===tab.key ? '700' : '400',
            color: active===tab.key ? '#1a73e8' : '#5f6368',
            background: active===tab.key ? '#e8f0fe' : 'white',
            borderBottom: active===tab.key ? '2px solid #1a73e8' : '2px solid transparent',
            transition:'all 0.15s',
          }}>
            <div>{tab.icon}</div>
            <div style={{marginTop:'2px'}}>{tab.label}</div>
          </button>
        ))}
      </div>
      {/* 記事リスト */}
      <ol style={{margin:0, padding:0, listStyle:'none'}}>
        {articles.length === 0 ? (
          <li style={{padding:'16px', color:'#9aa0a6', fontSize:'13px', textAlign:'center'}}>記事がありません</li>
        ) : articles.slice(0,10).map((article, idx) => (
          <li key={article.id} style={{borderBottom:'1px solid #f8f9fa'}}>
            <a href={article.original_url} target="_blank" rel="noopener noreferrer" style={{display:'flex', gap:'12px', padding:'10px 16px', textDecoration:'none'}}>
              <span style={{color: idx===0?'#fbbc04':idx===1?'#9aa0a6':idx===2?'#e37400':'#bdc1c6', fontWeight:'700', fontSize:'13px', minWidth:'16px'}}>{idx+1}</span>
              <span style={{fontSize:'13px', color:'#202124', lineHeight:'1.4'}}>{article.original_title}</span>
            </a>
          </li>
        ))}
      </ol>
    </aside>
  );
}
