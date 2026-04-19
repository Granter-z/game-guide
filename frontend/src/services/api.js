import axios from 'axios';

/** 前后端不同域名时：优先用构建变量；未设置时可读 index.html 里 meta（需重新部署静态资源）。 */
function resolveApiBaseUrl() {
  const fromEnv = import.meta.env.VITE_API_BASE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  if (typeof document !== 'undefined') {
    const el = document.querySelector('meta[name="api-base-url"]');
    const fromMeta = el?.getAttribute('content')?.trim();
    if (fromMeta) return fromMeta.replace(/\/$/, '');
  }
  return '/api';
}

const API_BASE_URL = resolveApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000
});

export function describeApiError(error) {
  const status = error.response?.status;
  const body = error.response?.data;
  const detail = typeof body?.error === 'string' ? body.error : body?.message;
  const head = detail || error.message || '请求失败';
  if (!error.response) {
    return `${head}。请确认已在构建时设置 VITE_API_BASE_URL 为后端地址（以 /api 结尾），且后端 CORS_ORIGIN 包含当前页面域名。`;
  }
  if (status === 401 || status === 403) return head;
  return `${head}（HTTP ${status}）`;
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 静态站 SPA 兜底常返回 200 + HTML；Axios 解析 JSON 失败时会把 data 留成字符串，导致「网络全绿但列表为空」。
api.interceptors.response.use(
  (response) => {
    const d = response.data;
    if (typeof d === 'string') {
      const head = d.trimStart();
      if (head.startsWith('<') || head.startsWith('<!')) {
        return Promise.reject(
          new Error(
            '收到 HTML 页面而非接口 JSON（常见：请求打到了前端域名）。请将 VITE_API_BASE_URL 设为后端地址并以 /api 结尾，然后重新构建前端。'
          )
        );
      }
    }
    return response;
  },
  (err) => Promise.reject(err)
);

export const getGames = (params) => api.get('/games', { params });
export const getGameBySlug = (slug) => api.get(`/games/${slug}`);
export const searchGames = (query, page) => api.get('/games/search', { params: { q: query, page } });
export const getGenres = () => api.get('/games/genres');
export const getPlatforms = () => api.get('/games/platforms');

export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);
export const getMe = () => api.get('/auth/me');

export const getFavorites = () => api.get('/favorites');
export const addFavorite = (gameId, gameData) => api.post('/favorites', { gameId, gameData });
export const removeFavorite = (gameId) => api.delete(`/favorites/${gameId}`);
export const rateGame = (gameId, score, comment) => api.post('/favorites/rate', { gameId, score, comment });
export const getRatings = () => api.get('/favorites/ratings');

export const chat = (messages) => api.post('/chat', { messages });

export default api;