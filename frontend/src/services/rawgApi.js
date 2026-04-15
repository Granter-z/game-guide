import axios from 'axios';

const RAWG_API_KEY = 'e59ef34a1dc24a11a368041c077f9eb8';
const RAWG_BASE_URL = 'https://api.rawg.io/api';

const rawgApi = axios.create({
  baseURL: RAWG_BASE_URL,
  timeout: 15000,
  params: {
    key: RAWG_API_KEY
  }
});

export const getGames = (params) => rawgApi.get('/games', { params });
export const getGameBySlug = (slug) => rawgApi.get(`/games/${slug}`);
export const searchGames = (query, page, platforms) => rawgApi.get('/games', { params: { search: query, page, platforms } });
export const getGenres = () => rawgApi.get('/genres');
export const getPlatforms = () => rawgApi.get('/platforms');
export const getGameDetails = (id) => rawgApi.get(`/games/${id}`);
export const getGameScreenshots = (id) => rawgApi.get(`/games/${id}/screenshots`);
export const getGameTrailers = (id) => rawgApi.get(`/games/${id}/movies`);

export default rawgApi;
