import apiClient from './api';

export const getGames = async (params) => {
  const res = await apiClient.get('/games', { params });
  const d = res.data;
  if (!d || typeof d !== 'object' || Array.isArray(d)) {
    throw new Error('游戏列表接口返回格式异常（不是 JSON 对象）。');
  }
  if (!Array.isArray(d.results)) {
    throw new Error(`游戏列表缺少 results 数组，实际字段：${Object.keys(d).join(', ') || '无'}`);
  }
  return res;
};
export const getGameBySlug = (slug) => apiClient.get(`/games/${slug}`);
export const searchGames = (query, page, platforms) => apiClient.get('/games/search', { params: { q: query, page, ...(platforms ? { platforms } : {}) } });
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
