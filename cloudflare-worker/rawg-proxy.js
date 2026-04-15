const RAWG_API_KEY = 'e59ef34a1dc24a11a368041c077f9eb8';
const RAWG_BASE_URL = 'https://api.rawg.io/api';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 移除 /rawg 前缀，构建目标路径
    const path = url.pathname.replace(/^\/rawg/, '');
    const targetUrl = `${RAWG_BASE_URL}${path}${url.search}`;

    try {
      const response = await fetch(targetUrl, {
        method: request.method,
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
};
