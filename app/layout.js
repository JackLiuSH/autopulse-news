export const metadata = {
  title: 'AutoPulse | 汽车行业新闻追踪',
  description: '聚焦零部件与整车行业，每日更新汽车行业新闻、政策法规、供应链动态和技术趋势。',
  keywords: '汽车新闻,零部件,整车,新能源汽车,供应链,汽车政策',
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
