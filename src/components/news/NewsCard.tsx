import type { Article } from '@/types';
import { formatDistanceToNow } from '@/lib/utils/date';

interface NewsCardProps {
  article: Article;
  rank?: number;
}

export default function NewsCard({ article, rank }: NewsCardProps) {
  const timeAgo = formatDistanceToNow(article.original_published_at || article.created_at);

  return (
    <article style={{background:'white', border:'1px solid #e0e0e0', borderRadius:'12px', overflow:'hidden', marginBottom:'12px'}}>
      <a href={article.original_url} target="_blank" rel="noopener noreferrer" style={{display:'block', padding:'16px', textDecoration:'none'}}>
        <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px'}}>
          <span style={{fontSize:'12px', color:'#1a73e8', fontWeight:'500'}}>{article.source_name}</span>
          <span style={{fontSize:'12px', color:'#9aa0a6'}}>· {timeAgo}</span>
          {rank && <span style={{marginLeft:'auto', fontSize:'12px', fontWeight:'700', color:'#1a73e8'}}>#{rank}</span>}
        </div>
        <h3 style={{fontSize:'15px', fontWeight:'600', color:'#202124', lineHeight:'1.4', marginBottom:'8px'}}>{article.original_title}</h3>
        {article.ai_summary && (
          <p style={{fontSize:'13px', color:'#5f6368', lineHeight:'1.6', marginBottom:'10px'}}>{article.ai_summary}</p>
        )}
        {article.ai_points && (
          <div style={{background:'#e8f0fe', borderRadius:'8px', padding:'8px 12px', marginBottom:'10px'}}>
            <p style={{fontSize:'12px', color:'#1557b0'}}>💡 {article.ai_points}</p>
          </div>
        )}
        <div style={{display:'flex', flexWrap:'wrap', gap:'6px'}}>
          <span style={{background:'#f1f3f4', color:'#3c4043', fontSize:'11px', padding:'2px 8px', borderRadius:'100px'}}>{article.category}</span>
          {article.ai_tickers?.slice(0,3).map(t => (
            <span key={t} style={{background:'#e8f0fe', color:'#1a73e8', fontSize:'11px', padding:'2px 8px', borderRadius:'100px'}}>{t}</span>
          ))}
        </div>
      </a>
      <div style={{padding:'8px 16px', borderTop:'1px solid #f1f3f4'}}>
        <a href={article.original_url} target="_blank" rel="noopener noreferrer" style={{fontSize:'12px', color:'#1a73e8', textDecoration:'none'}}>
          元記事を読む →
        </a>
      </div>
    </article>
  );
}
