const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.post('/', chatController.chat);
router.get('/models', chatController.getModels);

module.exports = router;