const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');
const Game = require('../models/Game');
const { getOfficialGameNameZh } = require('../config/officialGameNames');
const aiService = require('../services/aiService');

const RAWG_BASE_URL = 'https://api.rawg.io/api';
const GAME_DETAIL_CACHE_TTL_MS = parseInt(process.env.GAME_DETAIL_CACHE_TTL_MS || `${6 * 60 * 60 * 1000}`, 10);

const fetchFromRAWG = async (endpoint, params = {}) => {
  const apiKey = process.env.RAWG_API_KEY;
  if (!apiKey) {
    throw new Error('RAWG API key not configured');
  }
  const proxyUrl = process.env.PROXY_URL?.trim();
  const agent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;
  const axiosConfig = {
    params: { key: apiKey, ...params },
    timeout: 15000
  };
  if (agent) {
    axiosConfig.httpAgent = agent;
    axiosConfig.httpsAgent = agent;
  }
  const response = await axios.get(`${RAWG_BASE_URL}${endpoint}`, axiosConfig);
  return response.data;
};

const mapRAWGToGame = (game) => ({
  id: game.id,
  gameId: game.id.toString(),
  name: game.name,
  official_name_zh: getOfficialGameNameZh(game.slug),
  slug: game.slug,
  description: game.description_raw || game.description || '',
  backgroundImage: game.background_image,
  released: game.released,
  metacritic: game.metacritic,
  platforms: game.platforms || [],
  genres: game.genres || [],
  tags: game.tags?.slice(0, 10) || [],
  developers: game.developers || [],
  publishers: game.publishers || [],
  website: game.website || '',
  reddit_url: game.reddit_url || '',
  stores: game.stores || [],
  screenshots: [],
  trailers: game.clip ? [{ id: game.id, name: game.name, preview: game.clip.clip, data: { max: game.clip.clip } }] : []
});

const ENHANCED_CONTENT_SCHEMA_VERSION = 2;

const toPublicEnhancedContent = (ec) => {
  if (!ec) return null;
  const { schemaVersion, ...rest } = ec;
  return Object.keys(rest).length ? rest : null;
};

const mapDbGameToResponse = (dbGame) => ({
  id: Number(dbGame.gameId),
  gameId: dbGame.gameId,
  name: dbGame.name,
  official_name_zh: dbGame.official_name_zh || getOfficialGameNameZh(dbGame.slug),
  slug: dbGame.slug,
  description: dbGame.description || '',
  description_raw: dbGame.description || '',
  backgroundImage: dbGame.backgroundImage,
  background_image: dbGame.backgroundImage,
  released: dbGame.released,
  metacritic: dbGame.metacritic,
  platforms: dbGame.platforms || [],
  genres: dbGame.genres || [],
  tags: dbGame.tags || [],
  developers: dbGame.developers || [],
  publishers: dbGame.publishers || [],
  website: dbGame.website || '',
  reddit_url: dbGame.reddit_url || '',
  stores: dbGame.stores || [],
  screenshots: dbGame.screenshots || [],
  trailers: dbGame.trailers || [],
  requirements: dbGame.requirements || {},
  enhancedContent: toPublicEnhancedContent(dbGame.enhancedContent)
});

const isCacheFresh = (updatedAt) => {
  if (!updatedAt) return false;
  return Date.now() - new Date(updatedAt).getTime() < GAME_DETAIL_CACHE_TTL_MS;
};

const hasStoreData = (game) => Array.isArray(game?.stores) && game.stores.length > 0;

const hasEnhancedContent = (game) => {
  const data = game?.enhancedContent;
  if (!data) return false;
  if (data.schemaVersion !== ENHANCED_CONTENT_SCHEMA_VERSION) return false;
  return Array.isArray(data.highlights) && data.highlights.length > 0;
};

const extractJson = (text) => {
  if (!text) return null;
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch (e) {
    return null;
  }
};

const normalizeEnhancedContent = (raw) => ({
  highlights: Array.isArray(raw?.highlights) ? raw.highlights.slice(0, 5) : [],
  beginnerTips: Array.isArray(raw?.beginnerTips) ? raw.beginnerTips.slice(0, 5) : [],
  advancedTips: Array.isArray(raw?.advancedTips) ? raw.advancedTips.slice(0, 5) : [],
  faq: Array.isArray(raw?.faq)
    ? raw.faq
      .map((item) => ({ q: item?.q || '', a: item?.a || '' }))
      .filter((item) => item.q && item.a)
      .slice(0, 5)
    : []
});

const slugHash = (slug) => {
  const s = String(slug || '');
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
};

const pickUniqueBySlug = (items, slug, count) => {
  if (!items.length) return [];
  const h = slugHash(slug);
  const out = [];
  const used = new Set();
  let step = 1 + (h % Math.max(1, items.length - 1 || 1));
  let idx = h % items.length;
  let guard = 0;
  while (out.length < count && out.length < items.length && guard < items.length * 3) {
    guard += 1;
    if (!used.has(idx)) {
      used.add(idx);
      out.push(items[idx]);
    }
    idx = (idx + step) % items.length;
  }
  return out;
};

const textMentionsTitle = (text, title) => {
  if (!title || String(title).length < 2) return true;
  return String(text).toLowerCase().includes(String(title).toLowerCase());
};

const aiContentMentionsGame = (normalized, game) => {
  const titles = [game.name, game.official_name_zh].filter(Boolean);
  if (!titles.length) return true;
  const chunks = [
    ...normalized.highlights,
    ...normalized.beginnerTips,
    ...normalized.advancedTips,
    ...(normalized.faq || []).map((f) => `${f.q} ${f.a}`)
  ].join(' ');
  return titles.some((t) => textMentionsTitle(chunks, t));
};

const wrapEnhancedPayload = (payload) => ({
  ...payload,
  schemaVersion: ENHANCED_CONTENT_SCHEMA_VERSION
});

const buildEnhancedContentFallback = (game) => {
  const slug = game.slug || game.gameId || 'game';
  const displayZh = game.official_name_zh || game.name;
  const displayEn = game.name || '本作';
  const genreLine = game.genres?.map((g) => g.name).filter(Boolean).join('、') || '多类型';
  const platformLine = game.platforms?.map((p) => p.platform?.name).filter(Boolean).slice(0, 5).join('、') || '多平台';
  const tagNames = (game.tags || []).map((t) => t.name).filter(Boolean).slice(0, 5);
  const tagLine = tagNames.length ? `常见标签：${tagNames.join('、')}。` : '';
  const devLine = game.developers?.map((d) => d.name).filter(Boolean).slice(0, 2).join('、');
  const devSuffix = devLine ? `开发团队包括 ${devLine}。` : '';

  const beginnerPool = [
    `《${displayZh}》前期建议先把教程关打完，熟悉移动、战斗与资源界面，再推进主线。`,
    `在《${displayZh}》里优先解锁你最常用的武器或技能树分支，避免点数平均浪费。`,
    `若《${displayZh}》战斗吃紧，可先回头做支线或探索地图收集补给，再挑战主线卡点。`,
    `《${displayZh}》建议先记录敌人攻击前摇与可打断时机，比盲目堆数值更有效。`,
    `玩《${displayZh}》时可先确认难度选项与辅助系统，必要时调低难度专注体验剧情。`,
    `《${displayZh}》若地图较大，建议先开传送点或营地，减少重复跑路时间。`,
    `在《${displayZh}》中优先完成给核心资源的任务链，再考虑收集类成就。`
  ];

  const advancedPool = [
    `《${displayZh}》中后期可围绕「${tagNames[0] || genreLine}」构建一套主力 Build，并准备一套备用方案应对不同敌人。`,
    `针对《${displayZh}》的 ${genreLine} 玩法，建议研究敌人弱点与属性克制表，而不是单一输出套路。`,
    `《${displayZh}》资源循环上，优先投资能跨章节复用的成长项（如永久被动、核心装备强化）。`,
    `若《${displayZh}》有多人要素，可先固定小队分工（输出/控场/辅助），再优化个人配装。`,
    `《${displayZh}》高难内容前，建议先整理背包与消耗品栏位，战斗中减少无效切菜单。`,
    `研究《${displayZh}》的关卡设计与精英怪机制，往往比单纯刷等级更能缩短通关时间。`,
    `《${displayZh}》可尝试录制自己的失败战斗片段，复盘走位与技能释放顺序。`
  ];

  const faqTemplates = [
    {
      q: `《${displayZh}》适合什么类型的玩家？`,
      a: `本作类型偏 ${genreLine}，若你喜欢该品类核心循环，会更容易上手；英文名称为 ${displayEn}。`
    },
    {
      q: `《${displayZh}》前期最该优先做什么？`,
      a: `建议先推进主线到系统解锁完整，再按兴趣补支线；平台方面支持 ${platformLine}。`
    },
    {
      q: `《${displayZh}》卡关或打不过怎么办？`,
      a: `可先检查装备与技能搭配是否合理，必要时降低难度或回头收集资源；${tagLine || '也可参考社区攻略。'}`
    },
    {
      q: `《${displayZh}》大概需要投入多少学习成本？`,
      a: `从类型与标签（${tagNames.slice(0, 3).join('、') || genreLine}）来看，建议预留数小时熟悉核心机制后再深入。`
    }
  ];

  const highlights = [
    `《${displayZh}》（${displayEn}）是一款 ${genreLine} 作品，适合喜欢该类型节奏的玩家。`,
    `发售信息：${game.released || '日期待定'}；平台覆盖：${platformLine}。${devSuffix}`,
    game.metacritic
      ? `Metacritic ${game.metacritic} 分，可作为口碑参考之一。`
      : '暂无 Metacritic 分数，建议结合玩家评价与实机视频判断。',
    tagLine || `可从商店页、社区讨论与实机演示了解《${displayZh}》是否符合你的口味。`
  ].filter(Boolean);

  return wrapEnhancedPayload({
    highlights,
    beginnerTips: pickUniqueBySlug(beginnerPool, slug, 4),
    advancedTips: pickUniqueBySlug(advancedPool, slug, 4),
    faq: pickUniqueBySlug(faqTemplates, slug, 3)
  });
};

const generateEnhancedContent = async (game) => {
  const shortDescription = (game.description || '').slice(0, 2000);
  if (!shortDescription) return buildEnhancedContentFallback(game);

  const tagLine = (game.tags || []).map((t) => t.name).filter(Boolean).slice(0, 8).join('、') || '无';
  const devLine = (game.developers || []).map((d) => d.name).filter(Boolean).slice(0, 3).join('、') || '未知';

  const prompt = `
请基于以下游戏信息，输出简洁中文 JSON（不要输出 markdown，不要代码块）：
{
  "highlights": ["3-5条，概述玩法卖点"],
  "beginnerTips": ["3-5条，新手建议"],
  "advancedTips": ["3-5条，进阶技巧"],
  "faq": [{"q":"问题","a":"回答"}]
}

硬性要求：
1) 每条 highlights / beginnerTips / advancedTips 都必须自然出现中文显示名「${game.official_name_zh || game.name}」或英文名「${game.name}」至少其一，禁止输出与具体游戏无关的泛泛套话。
2) FAQ 的每个问题里必须包含游戏中文显示名或英文名。
3) 内容要结合下方「简介」中的具体机制、设定或玩法信息，不要只重复类型名。

中文显示名：${game.official_name_zh || game.name}
英文名：${game.name}
slug：${game.slug || ''}
类型：${game.genres?.map((g) => g.name).join(', ') || '未知'}
标签：${tagLine}
开发商：${devLine}
平台：${game.platforms?.map((p) => p.platform?.name).filter(Boolean).join(', ') || '未知'}
发行时间：${game.released || '未知'}
Metacritic：${game.metacritic || '未知'}
简介：${shortDescription}
`;

  try {
    const response = await aiService.chat(
      [{ role: 'user', content: prompt }],
      '你是专业游戏编辑，必须严格按用户 JSON 格式与“硬性要求”输出，不得编造不存在的官方信息。'
    );
    const parsed = extractJson(response);
    if (!parsed) return buildEnhancedContentFallback(game);
    const normalized = normalizeEnhancedContent(parsed);
    if (!normalized.highlights.length) return buildEnhancedContentFallback(game);
    if (!aiContentMentionsGame(normalized, game)) return buildEnhancedContentFallback(game);
    return wrapEnhancedPayload(normalized);
  } catch (error) {
    return buildEnhancedContentFallback(game);
  }
};

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
        official_name_zh: getOfficialGameNameZh(game.slug),
        slug: game.slug,
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
    const cachedGame = await Game.findOne({ slug }).lean();
    if (cachedGame && isCacheFresh(cachedGame.updatedAt) && hasStoreData(cachedGame) && hasEnhancedContent(cachedGame)) {
      return res.json(mapDbGameToResponse(cachedGame));
    }

    const data = await fetchFromRAWG(`/games/${slug}`);
    const screenshotsData = await fetchFromRAWG(`/games/${slug}/screenshots`);
    const gameData = mapRAWGToGame(data);
    gameData.screenshots = screenshotsData.results?.map(s => s.image) || [];
    gameData.enhancedContent = await generateEnhancedContent(gameData);

    await Game.findOneAndUpdate(
      { gameId: gameData.gameId },
      {
        $set: {
          ...gameData,
          slug: gameData.slug || slug
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({
      ...gameData,
      enhancedContent: toPublicEnhancedContent(gameData.enhancedContent),
      background_image: gameData.backgroundImage,
      description_raw: gameData.description
    });
  } catch (error) {
    console.error('Error fetching game:', error.message);
    res.status(500).json({ message: 'Failed to fetch game', error: error.message });
  }
};

exports.searchGames = async (req, res) => {
  try {
    const { q, page = 1 } = req.query;
    const data = await fetchFromRAWG('/games', { search: q, page: parseInt(page) });

    res.json({
      count: data.count,
      results: data.results.map(game => ({
        ...game,
        official_name_zh: getOfficialGameNameZh(game.slug)
      }))
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