import axios from 'axios';

/**
 * API 根地址解析顺序：
 * 1) window.__GAME_GUIDE_API_BASE__（public/runtime-config.js，可覆盖错误构建出的 /api）
 * 2) Vite 构建变量 VITE_API_BASE_URL
 * 3) meta[name="api-base-url"]
 * 4) 默认 /api（仅前后端同域时可用）
 */
function resolveApiBaseUrl() {
  if (typeof window !== 'undefined') {
    const w = window.__GAME_GUIDE_API_BASE__;
    if (typeof w === 'string' && w.trim()) return w.trim().replace(/\/$/, '');
  }
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
    if (/HTML|收到 HTML|接口 JSON/i.test(head)) return head;
    if (/network error|err_network|failed to fetch/i.test(head)) {
      return `${head}。多为跨域：请在后端环境变量 CORS_ORIGIN 中加入你打开本站时地址栏里的完整域名（例如 https://你的前端.up.railway.app，不要末尾斜杠）；多个用英文逗号分隔。排查时可临时设为 *。`;
    }
    return `${head}。若已配置 runtime-config：请确认后端地址可访问，且 CORS_ORIGIN 包含当前页面域名。`;
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
            '收到 HTML 而非接口 JSON：请求仍指向前端域名。请编辑 public/runtime-config.js，设置 window.__GAME_GUIDE_API_BASE__ = \"https://你的后端域名/api\" 后重新部署；或在 Railway 构建变量中设置 BACKEND_API_BASE 后执行 npm run build（已配置 prebuild 时会自动写入）。'
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