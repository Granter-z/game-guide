const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');
const { HttpsProxyAgent } = require('https-proxy-agent');
const aiService = require('../services/aiService');

const getTranslateCredentials = () => ({
  appId: process.env.BAIDU_TRANSLATE_APP_ID,
  apiKey: process.env.BAIDU_TRANSLATE_API_KEY
});

const translateWithAI = async (text, from = 'en', to = 'zh') => {
  const languageMap = {
    en: 'English',
    zh: 'Chinese'
  };

  const sourceLang = languageMap[from] || from;
  const targetLang = languageMap[to] || to;

  const prompt = [
    `Translate the following ${sourceLang} game description into natural ${targetLang}.`,
    'Keep game terms accurate. Return translated text only without explanations.',
    '',
    text
  ].join('\n');

  const result = await aiService.chat(
    [{ role: 'user', content: prompt }],
    'You are a professional game localization translator.'
  );

  if (!result || typeof result !== 'string') {
    throw new Error('AI translation returned empty result');
  }

  return result.trim();
};

const translateWithBaidu = async (text, from = 'en', to = 'zh', appId, apiKey) => {
  // 按句子分段翻译
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const results = [];
  let translatedCount = 0;
  const proxyUrl = process.env.PROXY_URL;
  const agent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;

  for (const s of sentences) {
    if (!s.trim()) continue;
    const salt = Date.now();
    const sign = crypto.createHash('md5').update(appId + s.trim().slice(0, 500) + salt + apiKey).digest('hex');

    try {
      const response = await axios.post(
        'https://fanyi-api.baidu.com/api/trans/vip/translate',
        new URLSearchParams({ q: s.trim().slice(0, 500), from, to, appid: appId, salt, sign }),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          timeout: 10000,
          httpAgent: agent,
          httpsAgent: agent
        }
      );

      if (response.data.trans_result) {
        results.push(response.data.trans_result[0].dst);
        translatedCount += 1;
      } else {
        results.push(s.trim());
      }
    } catch (error) {
      // 翻译失败则保留原文
      results.push(s.trim());
    }
  }

  if (translatedCount === 0) {
    throw new Error('Translation service unavailable');
  }

  return results.join('');
};

const translateText = async (text, from = 'en', to = 'zh') => {
  if (!text || !text.trim()) return '';
  const { appId, apiKey } = getTranslateCredentials();
  if (!appId || !apiKey) {
    const result = await translateWithAI(text, from, to);
    return { result, engine: 'ai' };
  }
  const result = await translateWithBaidu(text, from, to, appId, apiKey);
  return { result, engine: 'baidu' };
};

router.post('/', async (req, res) => {
  const { text, from = 'en', to = 'zh' } = req.body;
  if (!text) return res.status(400).json({ error: 'No text provided' });

  try {
    const translated = await translateText(text, from, to);
    res.json(translated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
