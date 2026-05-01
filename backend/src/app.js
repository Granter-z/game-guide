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

// 支持 CORS_ORIGIN 环境变量：多个域名用逗号分隔，设为 * 则允许全部
const corsOrigin = process.env.CORS_ORIGIN;
app.use(cors(corsOrigin ? { origin: corsOrigin.split(',').map(s => s.trim()) } : undefined));
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

// 仅当被直接运行时（node src/app.js / Railway / localhost）才 listen
// 被 index.js require 时（Vercel serverless）跳过，由 Vercel 接管
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;