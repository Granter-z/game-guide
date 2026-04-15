const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.favorites || []);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch favorites', error: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { gameId, gameData } = req.body;
    const user = await User.findById(req.user.id);

    if (user.favorites.some(f => f.gameId === gameId)) {
      return res.status(400).json({ message: 'Game already in favorites' });
    }

    user.favorites.push({ ...gameData, gameId });
    await user.save();

    res.json({ message: 'Added to favorites', favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add favorite', error: error.message });
  }
});

router.delete('/:gameId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.favorites = user.favorites.filter(f => f.gameId.toString() !== req.params.gameId);
    await user.save();

    res.json({ message: 'Removed from favorites', favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove favorite', error: error.message });
  }
});

router.post('/rate', auth, async (req, res) => {
  try {
    const { gameId, score, comment } = req.body;
    const user = await User.findById(req.user.id);

    const existingRating = user.ratings.find(r => r.gameId === gameId);
    if (existingRating) {
      existingRating.score = score;
      existingRating.comment = comment;
    } else {
      user.ratings.push({ gameId, score, comment });
    }

    await user.save();
    res.json({ message: 'Rating saved', ratings: user.ratings });
  } catch (error) {
    res.status(500).json({ message: 'Failed to save rating', error: error.message });
  }
});

router.get('/ratings', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user.ratings || []);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch ratings', error: error.message });
  }
});

module.exports = router;