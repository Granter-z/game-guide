import axios from 'axios';

// 使用后端代理 API，隐藏 RAWG API Key
const API_BASE_URL = 'http://localhost:4000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

export const getGames = (params) => apiClient.get('/games', { params });
export const getGameBySlug = (slug) => apiClient.get(`/games/${slug}`);
export const searchGames = (query, page) => apiClient.get('/games/search', { params: { q: query, page } });
export const getGenres = () => apiClient.get('/games/genres');
export const getPlatforms = () => apiClient.get('/games/platforms');
export const getGameDetails = async (id) => {
  // 游戏详情通过 slug 获取，返回完整数据包括 screenshots
  const res = await apiClient.get(`/games/${id}`);
  return res.data;
};
export const getGameScreenshots = (id) => apiClient.get(`/games/${id}/screenshots`).catch(() => ({ data: { results: [] } }));
export const getGameTrailers = (id) => apiClient.get(`/games/${id}/trailers`).catch(() => ({ data: { results: [] } }));

export default apiClient;
