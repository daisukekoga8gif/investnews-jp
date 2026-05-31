import type { Article } from '@/types';

export default function RankingSidebar({ rankings }: { rankings: { top: Article[], japan: Article[], us: Article[] } }) {
  return (
    <aside style={{display:'flex', flexDirection:'column', gap:'16px'}}>
      {[
        { title:'日本株ニュース', icon:'🇯🇵', articles: rankings.japan },
        { title:'米国株ニュース', icon:'🇺🇸', articles: rankings.us },
      ].map(section => (
        <div key={section.title} style={{background:'white', border:'1px solid #e0e0e0', borderRadius:'12px', overflow:'hidden'}}>
          <div style={{padding:'12px 16px', borderBottom:'1px solid #f1f3f4', display:'flex', alignItems:'center', gap:'8px'}}>
            <span>{section.icon}</span>
            <span style={{fontSize:'14px', fontWeight:'600', color:'#202124'}}>{section.title}</span>
          </div>
          <ol style={{margin:0, padding:0, listStyle:'none'}}>
            {section.articles.slice(0,10).map((article, idx) => (
              <li key={article.id} style={{borderBottom:'1px solid #f8f9fa'}}>
                <a href={article.original_url} target="_blank" rel="noopener noreferrer" style={{display:'flex', gap:'12px', padding:'10px 16px', textDecoration:'none'}}>
                  <span style={{color: idx===0?'#fbbc04':idx===1?'#9aa0a6':idx===2?'#e37400':'#9aa0a6', fontWeight:'700', fontSize:'13px', minWidth:'16px'}}>{idx+1}</span>
                  <span style={{fontSize:'13px', color:'#202124', lineHeight:'1.4'}}>{article.original_title}</span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </aside>
  );
}
