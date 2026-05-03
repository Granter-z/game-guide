const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');

const APP_ID = process.env.BAIDU_APP_ID || '';
const API_KEY = process.env.BAIDU_API_KEY || '';

const translateText = async (text, from = 'en', to = 'zh') => {
  if (!text || !text.trim()) return '';
  if (!APP_ID || !API_KEY) {
    throw new Error('百度翻译 API 密钥未配置：请在 Railway 环境变量中设置 BAIDU_APP_ID 和 BAIDU_API_KEY');
  }

  // 按句子分段翻译
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const results = [];

  for (const s of sentences) {
    if (!s.trim()) continue;
    const salt = Date.now();
    const sign = crypto.createHash('md5').update(APP_ID + s.trim().slice(0, 500) + salt + API_KEY).digest('hex');

    try {
      const response = await axios.post(
        'https://fanyi-api.baidu.com/api/trans/vip/translate',
        new URLSearchParams({ q: s.trim().slice(0, 500), from, to, appid: APP_ID, salt, sign }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 10000 }
      );

      if (response.data.trans_result) {
        results.push(response.data.trans_result[0].dst);
      }
    } catch (error) {
      // 翻译失败则保留原文
      results.push(s.trim());
    }
  }

  return results.join('');
};

router.post('/', async (req, res) => {
  const { text, from = 'en', to = 'zh' } = req.body;
  if (!text) return res.status(400).json({ error: 'No text provided' });

  try {
    const result = await translateText(text, from, to);
    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
