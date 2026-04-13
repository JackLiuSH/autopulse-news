import { fetchAllNews } from '@/lib/fetch-news';
import { CATEGORIES } from '@/lib/rss-sources';

// ISR: æ¯ 30 åééæ°çæé¡µé¢
export const revalidate = 1800;

// åç±»é¢è²æ å°
const categoryColors = {
  parts: '#e94560',
  oem: '#3b82f6',
  nev: '#10b981',
  policy: '#f59e0b',
  supply: '#8b5cf6',
  tech: '#14b8a6',
};

const categoryLabels = {
  parts: 'é¶é¨ä»¶',
  oem: 'æ´è½¦',
  nev: 'æ°è½æº',
  policy: 'æ¿ç­æ³è§',
  supply: 'ä¾åºé¾',
  tech: 'ææ¯è¶å¿',
};

function formatDate(dateStr) {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'ä»å¤©';
    const now = new Date();
    const diff = now - d;
    if (diff < 3600000) return `${Math.max(1, Math.floor(diff / 60000))}åéå`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}å°æ¶å`;
    return `${d.getMonth() + 1}æ${d.getDate()}æ¥`;
  } catch {
    return 'ä»å¤©';
  }
}

function getTodayString() {
  const d = new Date();
  const days = ['æææ¥', 'ææä¸', 'ææäº', 'ææä¸', 'ææå', 'ææäº', 'ææå­'];
  return `${d.getFullYear()}å¹´${d.getMonth() + 1}æ${d.getDate()}æ¥ ${days[d.getDay()]}`;
}

export default async function HomePage() {
  const news = await fetchAllNews();
  const todayStr = getTodayString();

  // åç±»ç»è®¡
  const counts = {};
  news.forEach(item => {
    counts[item.category] = (counts[item.category] || 0) + 1;
  });

  // å¤´æ¡æ°é» (ç¬¬ä¸æ¡)
  const headline = news[0];
  const restNews = news.slice(1);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: globalStyles }} />

      {/* Header */}
      <header className="header">
        <div className="header-top">
          <div className="logo">
            <div className="logo-icon">AP</div>
            <div className="logo-text">
              <h1>AutoPulse</h1>
              <span>æ±½è½¦è¡ä¸æ°é»è¿½è¸ªå¹³å°</span>
            </div>
          </div>
          <div className="header-right">
            <div className="date-display">{todayStr}</div>
            <div className="live-badge">LIVE</div>
          </div>
        </div>

        {/* æ»å¨å¿«è®¯ */}
        <div className="ticker">
          <div className="ticker-content">
            {news.slice(0, 8).map((item, i) => (
              <a key={i} href={item.link} target="_blank" rel="noopener noreferrer" className="ticker-item">
                <span className="ticker-tag" style={{ background: categoryColors[item.category] || '#e94560' }}>
                  {categoryLabels[item.category] || 'å¿«è®¯'}
                </span>
                <span>{item.title.length > 35 ? item.title.slice(0, 35) + '...' : item.title}</span>
              </a>
            ))}
            {/* éå¤ä¸éå®ç°æ ç¼æ»å¨ */}
            {news.slice(0, 8).map((item, i) => (
              <a key={`dup-${i}`} href={item.link} target="_blank" rel="noopener noreferrer" className="ticker-item">
                <span className="ticker-tag" style={{ background: categoryColors[item.category] || '#e94560' }}>
                  {categoryLabels[item.category] || 'å¿«è®¯'}
                </span>
                <span>{item.title.length > 35 ? item.title.slice(0, 35) + '...' : item.title}</span>
              </a>
            ))}
          </div>
        </div>
      </header>

      <main className="main">
        {/* ç»è®¡æ  */}
        <div className="stats-bar">
          <div className="stat-card" style={{ borderLeftColor: '#e94560' }}>
            <div className="stat-label">ä»æ¥æ°é»æ»æ°</div>
            <div className="stat-value">{news.length}</div>
            <div className="stat-change">å®æ¶RSSèå</div>
          </div>
          {CATEGORIES.filter(c => c.key !== 'all').map(cat => (
            <div key={cat.key} className="stat-card" style={{ borderLeftColor: cat.color }}>
              <div className="stat-label">{cat.label}</div>
              <div className="stat-value">{counts[cat.key] || 0}</div>
              <div className="stat-change">æ¡æ°é»</div>
            </div>
          ))}
        </div>

        <div className="content-layout">
          {/* ä¸»åå®¹åº */}
          <div className="main-col">
            {/* å¤´æ¡ */}
            {headline && (
              <a href={headline.link} target="_blank" rel="noopener noreferrer" className="featured-card">
                <div className="featured-badge">ä»æ¥ç©å¯¹</div>
                <h2 className="featured-title">{headline.title}</h2>
                <p className="featured-summary">{headline.description}</p>
                <div className="featured-meta">
                  <span>{headline.source}</span>
                  <span>{formatDate(headline.pubDate)}</span>
                </div>
              </a>
            )}

            {/* åç±»è¿æ»¤ - ä½¿ç¨éç¹å®ç°æ JSè¿æ»¤ */}
            <div className="section-header">
              <h2 className="section-title">ææ°èµè®¯</h2>
              <div className="filter-pills">
                {CATEGORIES.map(cat => (
                  <a
                    key={cat.key}
                    href={cat.key === 'all' ? '#all' : `#cat-${cat.key}`}
                    className="pill"
                    style={cat.key === 'all' ? { background: '#e94560', color: 'white', borderColor: '#e94560' } : {}}
                  >
                    {cat.label}
                  </a>
                ))}
              </div>
            </div>

            {/* æ°é»åè¡¨ */}
            <div className="news-list">
              {restNews.map((item, i) => (
                <a
                  key={i}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="news-card"
                  id={`news-${i}`}
                >
                  <div className="news-card-top">
                    <span
                      className="news-tag"
                      style={{ background: categoryColors[item.category] || '#3b82f6' }}
                    >
                      {categoryLabels[item.category] || 'èµè®¯'}
                    </span>
                    <span className="news-time">{formatDate(item.pubDate)}</span>
                    <span className="news-source">{item.source}</span>
                  </div>
                  <h3 className="news-title">{item.title}</h3>
                  {item.description && (
                    <p className="news-summary">{item.description}</p>
                  )}
                </a>
              ))}
            </div>
          </div>

          {/* ä¾§è¾¹æ  */}
          <aside className="sidebar">
            {/* ç­æ¦ */}
            <div className="sidebar-card">
              <h3 className="sidebar-title">ð¥ ä»æ¥ç­æ¦</h3>
              {news.slice(0, 8).map((item, i) => (
                <a key={i} href={item.link} target="_blank" rel="noopener noreferrer" className="hot-item">
                  <div className="hot-rank" style={{
                    background: i === 0 ? '#e94560' : i === 1 ? '#f59e0b' : i === 2 ? '#3b82f6' : '#6b7280'
                  }}>
                    {i + 1}
                  </div>
                  <div className="hot-text">
                    {item.title.length > 28 ? item.title.slice(0, 28) + '...' : item.title}
                  </div>
                </a>
              ))}
            </div>

            {/* åç±»å¯¼èª */}
            <div className="sidebar-card">
              <h3 className="sidebar-title">ð åç±»å¯¼èª</h3>
              {CATEGORIES.filter(c => c.key !== 'all').map(cat => (
                <div key={cat.key} className="category-nav-item">
                  <span className="category-dot" style={{ background: cat.color }}></span>
                  <span className="category-name">{cat.label}</span>
                  <span className="category-count">{counts[cat.key] || 0}</span>
                </div>
              ))}
            </div>

            {/* æ°æ®æ¥æº */}
            <div className="sidebar-card">
              <h3 className="sidebar-title">ð¡ æ°æ®æ¥æº</h3>
              <div className="source-list">
                {[
                  'çä¸æ±½è½¦', 'OFweekæ°è½æº', 'æ±½è½¦ä¹å®¶',
                  'æ°æµªæ±½è½¦', 'ç¬¬ä¸çµå¨', 'ä¸­å½æ±½è½¦æ¥',
                  'æ°åç½', '21ç»æµç½', 'J.D. Power',
                ].map((s, i) => (
                  <span key={i} className="source-tag">{s}</span>
                ))}
              </div>
            </div>

            {/* æ´æ°ä¿¡æ¯ */}
            <div className="sidebar-card">
              <h3 className="sidebar-title">â±ï¸ æ´æ°æºå¶</h3>
              <p className="update-info">
                æ¬ç«éè¿RSSèåå¤ä¸ªæ±½è½¦è¡ä¸æ°é»æºï¼æ¯30åéèªå¨å·æ°ä¸æ¬¡åå®¹ã
                é¡µé¢éç¨ISRï¼å¢ééæåçæï¼ææ¯ï¼å¼é¡¾æ§è½ä¸å®æ¶æ§ã
              </p>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>AutoPulse æ±½è½¦è¡ä¸æ°é»è¿½è¸ªå¹³å° &copy; 2026</p>
        <p>æ°é»æ¥æºäºåå¤§æ±½è½¦åªä½RSSè®¢éï¼æ¯30åéèªå¨æ´æ° | ä¿¡æ¯ä»ä¾åèï¼ä¸æææèµå»ºè®®</p>
      </footer>
    </>
  );
}

// ============ å¨å±æ ·å¼ ============
const globalStyles = `
  :root {
    --primary: #1a1a2e;
    --accent: #e94560;
    --accent2: #0f3460;
    --bg: #f0f2f5;
    --card: #ffffff;
    --text: #1a1a2e;
    --text-secondary: #6b7280;
    --border: #e5e7eb;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
    background: var(--bg); color: var(--text); line-height: 1.6;
  }
  a { text-decoration: none; color: inherit; }

  .header {
    background: linear-gradient(135deg, var(--primary) 0%, var(--accent2) 100%);
    color: white; position: sticky; top: 0; z-index: 100;
    box-shadow: 0 2px 20px rgba(0,0,0,0.15);
  }
  .header-top {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 40px; max-width: 1400px; margin: 0 auto;
  }
  .logo { display: flex; align-items: center; gap: 12px; }
  .logo-icon {
    width: 42px; height: 42px; background: var(--accent); border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; font-weight: 800; color: white;
  }
  .logo-text h1 { font-size: 22px; font-weight: 700; letter-spacing: 1px; }
  .logo-text span { font-size: 12px; opacity: 0.7; }
  .header-right { display: flex; align-items: center; gap: 16px; }
  .date-display {
    background: rgba(255,255,255,0.1); padding: 8px 16px;
    border-radius: 8px; font-size: 13px;
  }
  .live-badge {
    background: var(--accent); padding: 4px 12px; border-radius: 4px;
    font-size: 12px; font-weight: 700; animation: pulse 2s infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; } 50% { opacity: 0.6; }
  }

  .ticker {
    background: rgba(0,0,0,0.2); padding: 8px 0; overflow: hidden;
  }
  .ticker-content {
    display: flex; animation: ticker 60s linear infinite; white-space: nowrap;
  }
  .ticker-item {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 0 28px; font-size: 13px; color: rgba(255,255,255,0.9);
  }
  .ticker-item:hover { color: white; }
  .ticker-tag {
    padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; color: white;
  }
  @keyframes ticker {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }

  .main { max-width: 1400px; margin: 0 auto; padding: 24px 40px; }

  .stats-bar {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 14px; margin-bottom: 28px;
  }
  .stat-card {
    background: var(--card); border-radius: 12px; padding: 16px 18px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    border-left: 4px solid var(--accent); transition: transform 0.2s;
  }
  .stat-card:hover { transform: translateY(-2px); }
  .stat-label { font-size: 12px; color: var(--text-secondary); margin-bottom: 2px; }
  .stat-value { font-size: 26px; font-weight: 700; }
  .stat-change { font-size: 12px; color: var(--text-secondary); }

  .content-layout {
    display: grid; grid-template-columns: 1fr 340px; gap: 24px;
  }

  .featured-card {
    display: block;
    background: linear-gradient(135deg, var(--primary) 0%, var(--accent2) 100%);
    color: white; border-radius: 16px; padding: 28px 32px;
    margin-bottom: 24px; position: relative; overflow: hidden;
    transition: transform 0.2s;
  }
  .featured-card:hover { transform: translateY(-2px); }
  .featured-card::after {
    content: ''; position: absolute; right: -40px; top: -40px;
    width: 200px; height: 200px; background: rgba(233,69,96,0.15); border-radius: 50%;
  }
  .featured-badge {
    background: var(--accent); display: inline-block; padding: 4px 12px;
    border-radius: 4px; font-size: 12px; font-weight: 700; margin-bottom: 14px;
  }
  .featured-title { font-size: 20px; font-weight: 700; margin-bottom: 12px; line-height: 1.5; position: relative; z-index: 1; }
  .featured-summary { font-size: 14px; opacity: 0.85; line-height: 1.8; position: relative; z-index: 1; }
  .featured-meta {
    display: flex; gap: 16px; margin-top: 14px; font-size: 12px; opacity: 0.6;
    position: relative; z-index: 1;
  }

  .section-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 18px; flex-wrap: wrap; gap: 12px;
  }
  .section-title { font-size: 18px; font-weight: 700; }
  .filter-pills { display: flex; gap: 8px; flex-wrap: wrap; }
  .pill {
    padding: 5px 14px; border-radius: 20px; font-size: 13px; font-weight: 500;
    background: var(--card); border: 1px solid var(--border); transition: all 0.2s;
  }
  .pill:hover { border-color: var(--accent); color: var(--accent); }

  .news-card {
    display: block; background: var(--card); border-radius: 12px;
    padding: 20px 24px; margin-bottom: 12px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05); transition: all 0.25s;
    border: 1px solid transparent;
  }
  .news-card:hover {
    box-shadow: 0 4px 16px rgba(0,0,0,0.1); border-color: var(--accent);
    transform: translateY(-1px);
  }
  .news-card-top { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
  .news-tag {
    padding: 3px 10px; border-radius: 4px; font-size: 11px;
    font-weight: 600; color: white;
  }
  .news-time { font-size: 12px; color: var(--text-secondary); }
  .news-source { font-size: 12px; color: var(--text-secondary); margin-left: auto; }
  .news-title { font-size: 16px; font-weight: 600; margin-bottom: 6px; line-height: 1.5; }
  .news-summary {
    font-size: 14px; color: var(--text-secondary); line-height: 1.7;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  }

  .sidebar {}
  .sidebar-card {
    background: var(--card); border-radius: 12px; padding: 20px;
    margin-bottom: 18px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  }
  .sidebar-title { font-size: 15px; font-weight: 700; margin-bottom: 14px; }

  .hot-item {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 9px 0; border-bottom: 1px solid var(--border);
  }
  .hot-item:last-child { border-bottom: none; }
  .hot-rank {
    width: 22px; height: 22px; border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 700; color: white; flex-shrink: 0; margin-top: 2px;
  }
  .hot-text { font-size: 13px; line-height: 1.5; font-weight: 500; }
  .hot-item:hover .hot-text { color: var(--accent); }

  .category-nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 0; border-bottom: 1px solid var(--border);
  }
  .category-nav-item:last-child { border-bottom: none; }
  .category-dot { width: 10px; height: 10px; border-radius: 50%; }
  .category-name { font-size: 14px; flex: 1; }
  .category-count {
    font-size: 13px; font-weight: 600; color: var(--text-secondary);
    background: var(--bg); padding: 2px 8px; border-radius: 10px;
  }

  .source-list { display: flex; flex-wrap: wrap; gap: 6px; }
  .source-tag {
    font-size: 12px; padding: 4px 10px; background: var(--bg);
    border-radius: 4px; color: var(--text-secondary);
  }

  .update-info { font-size: 13px; color: var(--text-secondary); line-height: 1.8; }

  .footer {
    text-align: center; padding: 32px 40px; color: var(--text-secondary);
    font-size: 13px; border-top: 1px solid var(--border); margin-top: 40px;
  }
  .footer p + p { margin-top: 4px; }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .news-card, .stat-card, .sidebar-card { animation: fadeIn 0.4s ease forwards; }

  @media (max-width: 1024px) {
    .content-layout { grid-template-columns: 1fr; }
    .header-top, .main { padding-left: 20px; padding-right: 20px; }
  }
  @media (max-width: 768px) {
    .stats-bar { grid-template-columns: repeat(2, 1fr); }
    .header-right { display: none; }
    .section-header { flex-direction: column; align-items: flex-start; }
  }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }
`;
