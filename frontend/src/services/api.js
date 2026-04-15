import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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

export default api;