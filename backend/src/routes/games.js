const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

router.get('/', gameController.getGames);
router.get('/search', gameController.searchGames);
router.get('/genres', gameController.getGenres);
router.get('/platforms', gameController.getPlatforms);
router.get('/:slug', gameController.getGameBySlug);

module.exports = router;