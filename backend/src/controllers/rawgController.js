const axios = require('axios');

const RAWG_BASE_URL = 'https://api.rawg.io/api';

const fetchFromRAWG = async (endpoint, params = {}) => {
  const apiKey = process.env.RAWG_API_KEY;
  const response = await axios.get(`${RAWG_BASE_URL}${endpoint}`, {
    params: { key: apiKey, ...params },
    timeout: 15000
  });
  return response.data;
};

exports.getGames = async (page = 1, pageSize = 20, filters = {}) => {
  const params = {
    page,
    page_size: pageSize,
    ...filters
  };
  return fetchFromRAWG('/games', params);
};

exports.getGameBySlug = async (slug) => {
  return fetchFromRAWG(`/games/${slug}`);
};

exports.getGameDetails = async (id) => {
  return fetchFromRAWG(`/games/${id}`);
};

exports.searchGames = async (query, page = 1) => {
  return fetchFromRAWG('/games', { search: query, page });
};

exports.getGameScreenshots = async (id) => {
  return fetchFromRAWG(`/games/${id}/screenshots`);
};

exports.getGameTrailers = async (id) => {
  return fetchFromRAWG(`/games/${id}/movies`);
};

exports.getGenres = async () => {
  return fetchFromRAWG('/genres');
};

exports.getPlatforms = async () => {
  return fetchFromRAWG('/platforms');
};