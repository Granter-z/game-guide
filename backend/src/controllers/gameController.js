const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');
const Game = require('../models/Game');
const { getOfficialGameNameZh } = require('../config/officialGameNames');

const RAWG_BASE_URL = 'https://api.rawg.io/api';

const fetchFromRAWG = async (endpoint, params = {}) => {
  const apiKey = process.env.RAWG_API_KEY;
  if (!apiKey) {
    throw new Error('RAWG API key not configured');
  }
  const proxyUrl = process.env.PROXY_URL?.trim();
  const agent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;
  const response = await axios.get(`${RAWG_BASE_URL}${endpoint}`, {
    params: { key: apiKey, ...params },
    ...(agent ? { httpAgent: agent, httpsAgent: agent } : {}),
    timeout: 15000
  });
  return response.data;
};

const mapRAWGToGame = (game) => ({
  gameId: game.id.toString(),
  name: game.name,
  slug: game.slug,
  official_name_zh: getOfficialGameNameZh(game.slug),
  description: game.description_raw || game.description || '',
  backgroundImage: game.background_image,
  released: game.released,
  metacritic: game.metacritic,
  platforms: game.platforms || [],
  genres: game.genres || [],
  tags: game.tags?.slice(0, 10) || [],
  developers: game.developers || [],
  publishers: game.publishers || [],
  screenshots: [],
  trailers: game.clip ? [{ id: game.id, name: game.name, preview: game.clip.clip, data: { max: game.clip.clip } }] : []
});

exports.getGames = async (req, res) => {
  try {
    const { page = 1, page_size = 20, genres, platforms, ordering, search, dates, metacritic } = req.query;

    const params = {
      page: parseInt(page),
      page_size: parseInt(page_size)
    };

    if (genres) params.genres = genres;
    if (platforms) params.platforms = platforms;
    if (ordering) params.ordering = ordering;
    if (search) params.search = search;
    if (dates) params.dates = dates;
    if (metacritic) params.metacritic = metacritic;

    const data = await fetchFromRAWG('/games', params);

    res.json({
      count: data.count,
      next: data.next,
      previous: data.previous,
      results: data.results.map(game => ({
        id: game.id,
        name: game.name,
        slug: game.slug,
        official_name_zh: getOfficialGameNameZh(game.slug),
        background_image: game.background_image,
        released: game.released,
        metacritic: game.metacritic,
        platforms: game.platforms,
        genres: game.genres
      }))
    });
  } catch (error) {
    console.error('Error fetching games:', error.message);
    res.status(500).json({ message: 'Failed to fetch games', error: error.message });
  }
};

exports.getGameBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const data = await fetchFromRAWG(`/games/${slug}`);

    const screenshotsData = await fetchFromRAWG(`/games/${slug}/screenshots`);
    const gameData = mapRAWGToGame(data);
    gameData.screenshots = screenshotsData.results?.map(s => s.image) || [];

    res.json(gameData);
  } catch (error) {
    console.error('Error fetching game:', error.message);
    res.status(500).json({ message: 'Failed to fetch game', error: error.message });
  }
};

exports.searchGames = async (req, res) => {
  try {
    const { q, page = 1, platforms } = req.query;
    const params = { search: q, page: parseInt(page) };
    if (platforms) params.platforms = platforms;
    const data = await fetchFromRAWG('/games', params);

    res.json({
      count: data.count,
      results: data.results
    });
  } catch (error) {
    console.error('Error searching games:', error.message);
    res.status(500).json({ message: 'Failed to search games', error: error.message });
  }
};

exports.getGenres = async (req, res) => {
  try {
    const data = await fetchFromRAWG('/genres');
    res.json(data.results);
  } catch (error) {
    console.error('Error fetching genres:', error.message);
    res.status(500).json({ message: 'Failed to fetch genres', error: error.message });
  }
};

exports.getPlatforms = async (req, res) => {
  try {
    const data = await fetchFromRAWG('/platforms');
    res.json(data.results);
  } catch (error) {
    console.error('Error fetching platforms:', error.message);
    res.status(500).json({ message: 'Failed to fetch platforms', error: error.message });
  }
};