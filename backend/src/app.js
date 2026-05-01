require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const gamesRouter = require('./routes/games');
const authRouter = require('./routes/auth');
const favoritesRouter = require('./routes/favorites');
const translateRouter = require('./routes/translate');
const chatRouter = require('./routes/chat');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/games', gamesRouter);
app.use('/api/auth', authRouter);
app.use('/api/favorites', favoritesRouter);
app.use('/api/translate', translateRouter);
app.use('/api/chat', chatRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Game Guide API is running' });
});

const PORT = process.env.PORT || 4000;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;