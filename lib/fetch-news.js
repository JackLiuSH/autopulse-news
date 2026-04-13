import { RSS_SOURCES, classifyArticle } from './rss-sources';

// è§£æ RSS XMLï¼ä¸ä¾èµå¤é¨åºçè½»éæ¹æ¡ï¼
function parseRSSXml(xmlText, sourceName, defaultCategory) {
  const items = [];
  // å¹é <item>...</item> å
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xmlText)) !== null) {
    const block = match[1];
    const title = extractTag(block, 'title');
    const link = extractTag(block, 'link');
    const description = extractTag(block, 'description');
    const pubDate = extractTag(block, 'pubDate');

    if (title) {
      const category = classifyArticle(title, description || '');
      items.push({
        title: cleanHtml(title),
        link: link || '#',
        description: cleanHtml(description || '').slice(0, 200),
        pubDate: pubDate || new Date().toISOString(),
        source: sourceName,
        category: category || defaultCategory,
      });
    }
  }

  return items;
}

function extractTag(xml, tag) {
  // Handle CDATA sections
  const cdataRegex = new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`, 'i');
  const cdataMatch = xml.match(cdataRegex);
  if (cdataMatch) return cdataMatch[1].trim();

  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const m = xml.match(regex);
  return m ? m[1].trim() : '';
}

function cleanHtml(text) {
  return text
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

// ä»åä¸ª RSS æºè·åæ°é»
async function fetchFromSource(source) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(source.url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'AutoPulse/1.0 RSS Reader',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      },
    });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const xml = await res.text();
    return parseRSSXml(xml, source.name, source.category);
  } catch (err) {
    console.warn(`[RSS] Failed to fetch ${source.name}: ${err.message}`);
    return [];
  }
}

// è·åææ RSS æºæ°é»
export async function fetchAllNews() {
  const results = await Promise.allSettled(
    RSS_SOURCES.map(source => fetchFromSource(source))
  );

  let allItems = [];
  for (const result of results) {
    if (result.status === 'fulfilled' && result.value.length > 0) {
      allItems = allItems.concat(result.value);
    }
  }

  // å¦æ RSS å¨é¨å¤±è´¥ï¼ä½¿ç¨å¤ç¨æ°æ®
  if (allItems.length === 0) {
    allItems = getFallbackNews();
  }

  // ææ¶é´æåºï¼ææ°å¨åï¼
  allItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  // å»éï¼åºäºæ é¢ç¸ä¼¼åº¦ï¼
  const seen = new Set();
  const unique = allItems.filter(item => {
    const key = item.title.slice(0, 20);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return unique.slice(0, 60); // æå¤è¿å60æ¡
}

// å¤ç¨æ°é»æ°æ®ï¼å½ææ RSS æºä¸å¯ç¨æ¶ï¼
function getFallbackNews() {
  const now = new Date();
  const today = now.toISOString();

  return [
    {
      title: 'ä¸å­£åº¦ä¹ç¨è½¦å¸åºé¶å®423.6ä¸è¾ï¼åæ¯ä¸æ»17.4%',
      link: 'https://nev.ofweek.com/2026-04/ART-71011-8420-30684471.html',
      description: '2026å¹´ä¸å­£åº¦ä¸­å½ä¹ç¨è½¦å¸åºé¢ä¸´è¾å¤§ååï¼é¶å®éåæ¯ä¸æ»17.4%ã3ææ°æ®æ¾ç¤ºåæè¿¹è±¡ï¼æ¯äºè¿ªéå30ä¸è¾å¤§å³ï¼é¶è·é¦æ¬¡æéçªç ´5ä¸è¾ãè¡ä¸å©æ¶¦çè·è³2.9%ï¼è¿ä½äºä¸æ¸¸å·¥ä¸ä¼ä¸å¹³åæ°´å¹³ã',
      pubDate: today,
      source: 'OFweekæ°è½æº',
      category: 'oem',
    },
    {
      title: '2026åèµè½¦ä¼å¤§éæï¼è°å¨ç¦»å¼ï¼è°å¨åå®ï¼',
      link: 'https://nev.ofweek.com/2026-04/ART-71000-8110-30684536.html',
      description: 'åèµåçè¿å¥å¨é¢è°æ´æï¼é¨ååçéæ©æ¶ç¼©äº§è½çè³éåºä¸­å½å¸åºï¼å¦ä¸äºéè¿æ·±åº¦æ¬åååææ¯åä½å¯»æ±çªå´ãå¸åºä»½é¢æç»­èç¼©ï¼çå­ç©ºé´è¢«èªä¸»åçåæ°å¿åä¸æ­æ¤åã',
      pubDate: today,
      source: 'OFweekæ°è½æº',
      category: 'oem',
    },
    {
      title: 'é£é¾è¡ä»½ä¸å­£åº¦åå©æ¶¦é¢éè¶40%ï¼æ±çæ³¢å¨ä¸å³ç¨åéæ¿å',
      link: 'https://finance.sina.com.cn/wm/2026-04-12/doc-inhuhfps6206923.shtml',
      description: 'é¶é¨ä»¶ä¼ä¸é£é¾è¡ä»½é¢è®¡ä¸å­£åº¦å½æ¯åå©æ¶¦åæ¯ä¸é42.92%è³59.23%ï¼åäººæ°å¸æ±çæ³¢å¨äº§çæ±åæå¤±çº¦2500ä¸åï¼ç¾å½å³ç¨æ¿ç­è°æ´å½±åå©æ¶¦çº¦1000ä¸åã',
      pubDate: today,
      source: 'æ°æµªè´¢ç»',
      category: 'parts',
    },
    {
      title: 'æ°å¿å3æééåæï¼é¶è·çªç ´5ä¸è¾ï¼æ¯äºè¿ªéå30ä¸å¤§å³',
      link: 'https://m.qctt.cn/news/1876962',
      description: '3æåå¤§æ°è½æºè½¦ä¼éééä½åæãé¶è·æ±½è½¦ä»å¹´é¦æ¬¡æéçªç ´5ä¸è¾ï¼æ¯äºè¿ªéå30ä¸è¾å¤§å³ãèæ¥ES9äº§åææ¯åå¸ä¼å°äº4æ9æ¥ä¸¾åã',
      pubDate: today,
      source: 'æ±½è½¦å¤´æ¡',
      category: 'nev',
    },
    {
      title: 'ä»¥æ§æ¢æ°æ¿ç­å¯éåºå°ï¼å¤å°ç»åè¡¥è´´æ¹æ¡åºæ¿è½¦å¸',
      link: 'https://nev.ofweek.com/2026-04/ART-71011-8420-30684451.html',
      description: '2026å¹´æ°è½æºæ±½è½¦è´­ç½®ç¨ç±åå¾æ¹ä¸ºååå¾æ¶ï¼è®¾ç½®1.5ä¸åååä¸éãæ±èçåäº¬ãèå·ç­å°åºå°ç»åï¼å¯¹è´­è½¦èç»äº3000-7000åä¸ç­çè¡¥è´´ã',
      pubDate: today,
      source: 'æ°åç½',
      category: 'policy',
    },
    {
      title: 'å¨åçµæ± å®å¨æ°å½æ 7æå®æ½ï¼"ä¸èµ·ç«ä¸çç¸"åä¸ºå¼ºå¶æ§è¦æ±',
      link: 'https://www.news.cn/fortune/20251217/5ada5ede44b049839967ac6a4206016b/c.html',
      description: 'ãçµå¨æ±½è½¦ç¨å¨åèçµæ± å®å¨è¦æ±ãï¼GB38031-2025ï¼å°äº2026å¹´7æ1æ¥èµ·å®æ½ï¼"ä¸èµ·ç«ãä¸çç¸"æ­£å¼åä¸ºå¼ºå¶æ§è¦æ±ã',
      pubDate: today,
      source: 'å·¥ä¿¡é¨',
      category: 'policy',
    },
    {
      title: 'å¤å®¶è½¦ä¼å¯å¨"å¤çµ"å¤§æï¼éå®çµæ± ä¾åºåºå¯¹æ¿ç­åå',
      link: 'https://i.gasgoo.com/news/70439712.html',
      description: 'é¢å¯¹è´­ç½®ç¨æ¿ç­è°æ´åå¸åºç«äºå å§ï¼å¤å®¶è½¦ä¼å¯å¨çµæ± ä¾åºéå®æç¥ãéè¿é¿æéè´­åè®®åæç¥åä½æ¹å¼ï¼ä¼åéè´­ææ¬å¹¶ç¡®ä¿ä¾åºç¨³å®ã',
      pubDate: today,
      source: 'çä¸æ±½è½¦',
      category: 'supply',
    },
    {
      title: 'ä¸­å½æ±½è½¦ä¾åºé¾åºæµ·åçº§ï¼ä»åä¸å·¥åå°å¨äº§ä¸é¾çææå»º',
      link: 'https://www.21jingji.com/article/20260105/herald/95f64388d93393311bde0588440fe1f5.html',
      description: 'ä¸­å½æ±½è½¦ä¾åºé¾åºæµ·æ¬ååå¸å±å éï¼å·²ä»æ©æçåä¸å·¥åå»ºè®¾åçº§ä¸ºå¨äº§ä¸é¾çææå»ºãæ ¸å¿é¶é¨ä»¶ä¼ä¸å¨ä¸åäºãä¸­ä¸ãæ¬§æ´²ç­å°å éå¸å±ã',
      pubDate: today,
      source: '21ç»æµç½',
      category: 'supply',
    },
    {
      title: '"æ²¹çµåæº"æä¸»æµï¼åä¸ºä¸å¥¥è¿ªè½å°çæ²¹è½¦é«é¶æºé©¾',
      link: 'http://www.eeo.com.cn/2026/0115/779376.shtml',
      description: 'åä¸ºä¸å¥¥è¿ªæ·±åº¦åä½ï¼æåè½å°çæ²¹è½¦éä¸­å¼åæ§å¶å¨ï¼å®ç°L2+çº§é«é¶æºè½é©¾é©¶åè½ãå¤´é¨è½¦ä¼å·²å¨ä¸»è¦åå¸å®ç°åå¸NOAåè½å¨è¦çã',
      pubDate: today,
      source: 'ç»æµè§å¯ç½',
      category: 'tech',
    },
    {
      title: 'å¨åºæçµæ± è¿åéäº§éªè¯ï¼ä¸­å½ä¼ä¸å±ç°è§æ¨¡åä¸ææ¯åéä¼å¿',
      link: 'https://www.news.cn/fortune/20251217/5ada5ede44b049839967ac6a4206016b/c.html',
      description: 'å¨åºæçµæ± æ­£ä»ææ¯ç ååéäº§éªè¯é¶æ®µè¿æ¸¡ãä¸­å½ä¼ä¸å¨äº§çº¿å¸å±ä¸ææ¯åæ°ä¸å±ç°åºæ¾èä¼å¿ï¼é¢è®¡2027å¹´ååææå®ç°å°æ¹éè£è½¦ã',
      pubDate: today,
      source: 'æ°åç½',
      category: 'tech',
    },
    {
      title: 'è¡ä¸å©æ¶¦çè·è³2.9%ï¼é¶é¨ä»¶ä¼ä¸éæ¬å¢æå»ä¸å®¹ç¼',
      link: 'https://www.autoinfo.org.cn/',
      description: '2026å¹´1-2æï¼æ±½è½¦è¡ä¸å©æ¶¦çè·è³2.9%ï¼è¿ä½äºä¸æ¸¸å·¥ä¸ä¼ä¸å¹³åæ°´å¹³5.8%ãä¸ä¸æ¸¸éä»·ååæç»­ä¼ å¯¼ï¼ææ¯åæ°åè§æ¨¡åæ¯ç ´å±å³é®ã',
      pubDate: today,
      source: 'ä¸­å½æ±½è½¦å·¥ä¸ä¿¡æ¯ç½',
      category: 'parts',
    },
    {
      title: 'J.D. Powerï¼æ°è½æºè½¦æ»¡æåº¦åè³829åï¼ç«äºç¦ç¹è½¬åäº§åä½éª',
      link: 'https://china.jdpower.com/press-releases/2026-china-new-energy-vehicle-automotive-performance-execution-and-layout-nev-apeal',
      description: 'ä¸­å½æ°è½æºæ±½è½¦è¡ä¸å¹³åæ»¡æåº¦è¯åè¾¾å°829åï¼æ»¡å1000åï¼ï¼è¾2025å¹´å¢é¿23ç¹ãå¶é åç«äºç¦ç¹ä»ä»·æ ¼åéç½®è½¬åæ´ä½äº§åä½éªã',
      pubDate: today,
      source: 'J.D. Power',
      category: 'oem',
    },
    {
      title: 'èæ¥ES9ãä¹éL90ç­æ°è½¦å¯éåå¸ï¼4-5ææ°è½¦ä¸å¸æ½®æ¥è¢­',
      link: 'https://nev.ofweek.com/2026-04/ART-71011-8500-30684476.html',
      description: 'èæ¥ES9å°äº4æåºåäº¬è½¦å±äº®ç¸ã5æåºä¸å¸ãä¹éL90 2026æ¬¾å°äº4æ21æ¥åå¸ãå¤å®¶æ°è½æºè½¦ä¼éä¸­åå¸æ°è½¦åï¼å¸åºç«äºç½ç­åã',
      pubDate: today,
      source: 'æ±½è½¦å¤´æ¡',
      category: 'nev',
    },
    {
      title: 'ãæ±½è½¦è¡ä¸ä»·æ ¼è¡ä¸ºåè§æåãå¾æ±æè§ï¼ä¸ºè½¦ä¼åå®ä»·æ ¼"çº¢çº¿"',
      link: 'https://www.gov.cn/zhengce/zhengceku/202509/P020250913479433067283.pdf',
      description: 'ãæ±½è½¦è¡ä¸ä»·æ ¼è¡ä¸ºåè§æåï¼å¾æ±æè§ç¨¿ï¼ãæ­£å¼åå¸ï¼æä¸ºæ±½è½¦çäº§åéå®ä¼ä¸åå®æç¡®çä»·æ ¼è¡ä¸º"çº¢çº¿"ï¼å¼å¯¼è¡ä¸èµ°åè§èç«äºã',
      pubDate: today,
      source: 'å¸åºçç®¡æ»å±',
      category: 'policy',
    },
    {
      title: 'æ°è½æºæ±½è½¦æ¸éçé¢è®¡åè³58%ï¼å¢éæ¾ç¼è³5%ä»¥ä¸',
      link: 'https://nev.ofweek.com/2026-02/ART-71000-8420-30681104.html',
      description: '2026å¹´ä¹ç¨è½¦æ°è½æºæ¸éçå°ä»2025å¹´ç53.9%å¢å å°58%å·¦å³ãè½ç¶æ¸éçæç»­æåï¼ä½å¢é¿éåº¦æ¾ç¼è³5%ä»¥ä¸ï¼å¸åºè¿å¥é«ä½çæ´æã',
      pubDate: today,
      source: 'OFweek',
      category: 'nev',
    },
  ];
}
