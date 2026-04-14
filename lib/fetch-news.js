import { RSS_SOURCES, classifyArticle } from './rss-sources';

// 解析 RSS XML（不依赖外部库的轻量方案）
function parseRSSXml(xmlText, sourceName, defaultCategory) {
  const items = [];
  // 匹配 <item>...</item> 块
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

// 从单个 RSS 源获取新闻
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

// 获取所有 RSS 源新闻
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

  // 如果 RSS 全部失败，使用备用数据
  if (allItems.length === 0) {
    allItems = getFallbackNews();
  }

  // 按时间排序（最新在前）
  allItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  // 去重（基于标题相似度）
  const seen = new Set();
  const unique = allItems.filter(item => {
    const key = item.title.slice(0, 20);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return unique.slice(0, 60); // 最多返回60条
}

// 备用新闻数据（当所有 RSS 源不可用时）
function getFallbackNews() {
  const now = new Date();
  const today = now.toISOString();

  return [
    {
      title: '一季度乘用车市场零售423.6万辆，同比下滑17.4%',
      link: 'https://nev.ofweek.com/2026-04/ART-71011-8420-30684471.html',
      description: '2026年一季度中国乘用车市场面临较大压力，零售量同比下滑17.4%。3月数据显示回暖迹象，比亚迪重回30万辆大关，零跑首次月销突破5万辆。行业利润率跌至2.9%，远低于下游工业企业平均水平。',
      pubDate: today,
      source: 'OFweek新能源',
      category: 'oem',
    },
    {
      title: '2026合资车企大逃杀：谁在离开，谁在坚守？',
      link: 'https://nev.ofweek.com/2026-04/ART-71000-8110-30684536.html',
      description: '合资品牌进入全面调整期，部分品牌选择收缩产能甚至退出中国市场，另一些通过深度本土化和技术合作寻求突围。市场份额持续萎缩，生存空间被自主品牌和新势力不断挤压。',
      pubDate: today,
      source: 'OFweek新能源',
      category: 'oem',
    },
    {
      title: '飞龙股份一季度净利润预降超40%：汇率波动与关税双重承压',
      link: 'https://finance.sina.com.cn/wm/2026-04-12/doc-inhuhfps6206923.shtml',
      description: '零部件企业飞龙股份预计一季度归母净利润同比下降42.92%至59.23%，受人民币汇率波动产生汇兑损失约2500万元，美国关税政策调整影响利润约1000万元。',
      pubDate: today,
      source: '新浪财经',
      category: 'parts',
    },
    {
      title: '新势力3月销量回暖：零跑凴破5万辆，比了迪重回30万大关',
      link: 'https://m.qctt.cn/news/1876962',
      description: '3月各大新能源车企销量集体回暆。零跐汽车今年首次月销突破5万辆，比亚迪重回30万辆大关。蔚来ES9产品技术发布会将于4月9日举办。',
      pubDate: today,
      source: '汽车头条',
      category: 'nev',
    },
    {
      title: '以旧换新政策密集出台，多地细化补贴方案刺激车市',
      link: 'https://nev.ofweek.com/2026-04/ART-71011-8420-30684451.html',
      description: '2026年新能源汽车购置税由免征改为减半征收，设置1.5万元减免上限。江苏省南京、苏州等地出台细则，对购车者给予3000-7000元不等的补贴。',
      pubDate: today,
      source: '新华网',
      category: 'policy',
    },
    {
      title: '动力电池安全新国标7月实施："不起火不爆炸"列为强制性要求',
      link: 'https://www.news.cn/fortune/20251217/5ada5ede44b049839967ac6a4206016b/c.html',
      description: '《电动汽车用动力蓄电池安全要求》（GB38031-2025）将于2026年7月1日起实施，"不起火、不爆炸"正式列为强制性要求。',
      pubDate: today,
      source: '工信部',
      category: 'policy',
    },
    {
      title: '多家车企启动"囤电"大战：锁定电池供应应对政策变化',
      link: 'https://i.gasgoo.com/news/70439712.html',
      description: '面对购置税政策调整和市场竞争加剧，多家车企启动电池供应锁定战略。通过长期采购协议和战略合作方式，优化采购成本并确保供应稳定。',
      pubDate: today,
      source: '盖世汽车',
      category: 'supply',
    },
    {
      title: '中国汽车供应链出海升级：从单一工厂到全产业链生态构建',
      link: 'https://www.21jingji.com/article/20260105/herald/95f64388d93393311bde0588440fe1f5.html',
      description: '中国汽车供应链出海本土化布局加速，已从早期的单一工厂建设升级为全产业链生态构建。核心零部件企业在东南亚、中东、欧洲等地加速布局。',
      pubDate: today,
      source: '21经济网',
      category: 'supply',
    },
    {
      title: '"油电同智"成主流：华为与奥迪落地燃沺车高阶智驾',
      link: 'http://www.eeo.com.cn/2026/0115/779376.shtml',
      description: '华为与奥迪深度合作，成功落地燃油车集中式域控制器，实现L2+级高阶智能驽驶功能。头部车企已在主要城市实现城市NOA功能全覆盖。',
      pubDate: today,
      source: '经济观察网',
      category: 'tech',
    },
    {
      title: '全固态电池迈向量产验证：中国企业展现规模化与技术双重优势',
      link: 'https://www.news.cn/fortune/20251217/5ada5ede44b049839967ac6a4206016b/c.html',
      description: '全固态电池正从技术研发向量产验证阶段过渡。中国企业在产线布局与技术创新上展现出显著优势，预计2027年前后有望实现小批量装车。',
      pubDate: today,
      source: '新华网',
      category: 'tech',
    },
    {
      title: '行业利润率跌至2.9%：零部件企业降本增效刻不容缓',
      link: 'https://www.autoinfo.org.cn/',
      description: '2026年1-2月，汽车行业利润率跌至2.9%，远低于下游工业企业平均水平5.8%。上下游降价压力持续传导，技术创新和规模化是破局关键。',
      pubDate: today,
      source: '中国汽车工业信息网',
      category: 'parts',
    },
    {
      title: 'J.D. Power：新能源车满意度升至829分，竞争焦点转向产品体验',
      link: 'https://china.jdpower.com/press-releases/2026-china-new-energy-vehicle-automotive-performance-execution-and-layout-nev-apeal',
      description: '中国新能源汽车行业平均满意度评分达到829分（满分1000分），较2025年增长23点。制造商竞争焦点从价格和配置转向整体产品体验。',
      pubDate: today,
      source: 'J.D. Power',
      category: 'oem',
    },
    {
      title: '蔚来ES9、乐道L90等新车密集发布：4-5月新车上市潮来袭',
      link: 'https://nev.ofweek.com/2026-04/ART-71011-8500-30684476.html',
      description: '蔚来ES9将于4月底北京车展亮相、5月底上市。乐道L90 2026款将于4月21日发布。多家新能源车企集中发布新车型，市场竞争白热化。',
      pubDate: today,
      source: '汽车头条',
      category: 'nev',
    },
    {
      title: '《汽车行业价格行为合规指南》征求意见：为车企划定价格"红线"',
      link: 'https://www.gov.cn/zhengce/zhengceku/202509/P020250913479433067283.pdf',
      description: '《汽车行业价格行为合规指南（征求意见稿）》正式发布，拟为汽车生产和销售企业划定明确的价格行为"红线"，引导行业走向规范竞争。',
      pubDate: today,
      source: '市场监管总局',
      category: 'policy',
    },
    {
      title: '新能源汽车渗透率预计升至58%，增速放缓至5%以下',
      link: 'https://nev.ofweek.com/2026-02/ART-71000-8420-30681104.html',
      description: '2026年乘用车新能源渗透率将从2025年的53.9%增加到58%左右。虽然渗透率持续提升，但增长速度放缓至5%以下，市场进入高位盘整期。',
      pubDate: today,
      source: 'OFweek',
      category: 'nev',
    },
  ];
}

// UTF-8 fix applied
