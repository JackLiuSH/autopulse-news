// 汽车行业 RSS 新闻源配置
// 每个源包含：名称、RSS URL、分类标签
export const RSS_SOURCES = [
  // 零部件 & 综合
  {
    name: '盖世汽车',
    url: 'https://www.gasgoo.com/rss/news.xml',
    category: 'parts',
    categoryLabel: '零部件',
    fallbackUrl: 'https://www.gasgoo.com',
  },
  {
    name: '中国汽车报',
    url: 'http://www.cnautonews.com/rss',
    category: 'oem',
    categoryLabel: '整车',
    fallbackUrl: 'http://www.cnautonews.com',
  },
  // 新能源
  {
    name: 'OFweek新能源汽车',
    url: 'https://nev.ofweek.com/rss.action',
    category: 'nev',
    categoryLabel: '新能源',
    fallbackUrl: 'https://nev.ofweek.com',
  },
  // 综合汽车
  {
    name: '汽车之家',
    url: 'https://www.autohome.com.cn/rss/news.xml',
    category: 'oem',
    categoryLabel: '整车',
    fallbackUrl: 'https://www.autohome.com.cn',
  },
  // 行业资讯
  {
    name: '第一电动',
    url: 'https://www.d1ev.com/rss',
    category: 'nev',
    categoryLabel: '新能源',
    fallbackUrl: 'https://www.d1ev.com',
  },
  {
    name: '新浪汽车',
    url: 'https://feed.sina.com.cn/auto/rss/auto.xml',
    category: 'oem',
    categoryLabel: '整车',
    fallbackUrl: 'https://auto.sina.com.cn',
  },
];

// 分类配置
export const CATEGORIES = [
  { key: 'all', label: '全部', color: '#e94560' },
  { key: 'parts', label: '零部件', color: '#e94560' },
  { key: 'oem', label: '整车', color: '#3b82f6' },
  { key: 'nev', label: '新能源', color: '#10b981' },
  { key: 'policy', label: '政策法规', color: '#f59e0b' },
  { key: 'supply', label: '供应链', color: '#8b5cf6' },
  { key: 'tech', label: '技术趋势', color: '#14b8a6' },
];

// 根据标题关键词智能分类
export function classifyArticle(title, description = '') {
  const text = (title + ' ' + description).toLowerCase();

  const rules = [
    { category: 'policy', keywords: ['政策', '法规', '补贴', '购置税', '标准', '工信部', '发改委', '合规', '监管', '征求意见', '国标'] },
    { category: 'supply', keywords: ['供应链', '供应商', '采购', '物流', '芯片短缺', '原材料', '锂', '钴', '镍', '产能', '库存'] },
    { category: 'tech', keywords: ['固态电池', '智能驾驶', 'NOA', '自动驾驶', '激光雷达', '芯片', '算力', '大模型', 'AI', '车联网', 'V2X', '800V', '碳化硅'] },
    { category: 'nev', keywords: ['新能源', '电动', '纯电', '插混', '混动', '充电', '换电', '比亚迪', '特斯拉', '蔚来', '小鹏', '理想', '零跑', '哪吒', '极氪'] },
    { category: 'parts', keywords: ['零部件', '变速箱', '底盘', '发动机', '传感器', '线束', '轮胎', '制动', '转向', '轴承', '密封', '博世', '大陆', '采埃孚'] },
    { category: 'oem', keywords: ['销量', '车型', '上市', '发布', '大众', '丰田', '本田', '日产', '奔驰', '宝马', '奥迪', '吉利', '长安', '长城'] },
  ];

  for (const rule of rules) {
    if (rule.keywords.some(kw => text.includes(kw))) {
      return rule.category;
    }
  }

  return 'oem'; // 默认分类
}
// Updated with correct UTF-8 encoding
