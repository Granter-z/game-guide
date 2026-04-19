import apiClient from './api';

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
