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

/** 浏览器 Origin 总是带协议；环境变量里常漏写 https://，这里补全以便匹配。 */
function parseCorsOrigins(raw) {
  const parts = (raw || '')
    .split(',')
    .map((s) => s.trim().replace(/\/$/, ''))
    .filter(Boolean);
  const out = new Set();
  for (const p of parts) {
    if (p === '*') {
      out.add('*');
      continue;
    }
    if (/^https?:\/\//i.test(p)) {
      out.add(p);
      continue;
    }
    if (/^(localhost|127\.0\.0\.1)/i.test(p)) {
      out.add(`http://${p}`);
      out.add(`https://${p}`);
    } else {
      out.add(`https://${p}`);
    }
  }
  return [...out];
}

const allowedOrigins = parseCorsOrigins(process.env.CORS_ORIGIN);

const allowAnyOrigin = allowedOrigins.includes('*');

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server requests and tools without Origin (curl/Postman).
    if (!origin) return callback(null, true);
    if (allowedOrigins.length === 0 || allowAnyOrigin) return callback(null, true);
    const normalized = origin.replace(/\/$/, '');
    if (allowedOrigins.includes(normalized)) return callback(null, true);
    // 勿传 Error，否则预检/跨域表现异常，浏览器端常变成「Network Error」
    console.warn(`[cors] blocked origin: ${origin} (allowed: ${allowedOrigins.join(', ')})`);
    return callback(null, false);
  }
}));
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
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;