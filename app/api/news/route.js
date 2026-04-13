import { fetchAllNews } from '@/lib/fetch-news';

// Vercel Edge: ç¼å­ 30 åéèªå¨å·æ°
export const revalidate = 1800;

export async function GET(request) {
  try {
    const news = await fetchAllNews();
    return Response.json({
      success: true,
      count: news.length,
      updatedAt: new Date().toISOString(),
      data: news,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
      },
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: error.message,
      data: [],
    }, { status: 500 });
  }
}
