const RAWG_API_KEY = 'e59ef34a1dc24a11a368041c077f9eb8';
const RAWG_BASE_URL = 'https://api.rawg.io/api';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const url = new URL(req.url);

  // 移除 /api/rawg 前缀，构建目标路径
  const path = url.pathname.replace(/^\/api\/rawg/, '');
  const targetUrl = `${RAWG_BASE_URL}${path}${url.search}`;

  // 如果 URL 没有 key 参数，添加 key
  const finalUrl = url.searchParams.has('key')
    ? targetUrl
    : `${targetUrl}${url.search ? '&' : '?'}key=${RAWG_API_KEY}`;

  try {
    const response = await fetch(finalUrl, {
      method: req.method,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'GameGuide/1.0'
      }
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Proxy error', message: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
