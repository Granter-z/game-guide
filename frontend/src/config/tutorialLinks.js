const CUSTOM_TUTORIAL_LINKS = {
  // 示例:
  // 'elden-ring': [
  //   { title: '新手开荒思路', url: 'https://example.com/elden-ring-starter' },
  //   { title: 'BOSS 速查表', url: 'https://example.com/elden-ring-boss' },
  // ],
};

const ensureHttpUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://${url}`;
};

const buildSearchUrl = (baseUrl, query) => `${baseUrl}${encodeURIComponent(query)}`;

export const getTutorialLinksForGame = (game, displayName) => {
  if (!game) return [];

  const gameName = displayName || game.name || game.slug || 'game';
  const slug = game.slug || '';

  const autoLinks = [
    {
      title: '游戏官网',
      url: ensureHttpUrl(game.website),
    },
    {
      title: 'Reddit 社区',
      url: ensureHttpUrl(game.reddit_url),
    },
    {
      title: 'YouTube 教程搜索',
      url: buildSearchUrl('https://www.youtube.com/results?search_query=', `${gameName} beginner guide`),
    },
    {
      title: 'Bilibili 教程搜索',
      url: buildSearchUrl('https://search.bilibili.com/all?keyword=', `${gameName} 攻略`),
    },
  ].filter((item) => item.url);

  const manualLinks = CUSTOM_TUTORIAL_LINKS[slug] || [];
  const merged = [...manualLinks, ...autoLinks];

  const unique = new Set();
  return merged.filter((item) => {
    if (!item?.url || unique.has(item.url)) return false;
    unique.add(item.url);
    return true;
  });
};

export const getDownloadLinksForGame = (game) => {
  const gameName = game?.name || game?.slug || 'game';
  const steamSearchUrl = buildSearchUrl('https://store.steampowered.com/search/?term=', gameName);
  const quarkLinksDocUrl = 'https://www.kdocs.cn/l/cvOkS65ij2HL';

  return [
    {
      title: '打开 Steam 搜索该游戏',
      url: steamSearchUrl,
    },
    {
      title: '夸克链接',
      url: quarkLinksDocUrl,
    },
  ];
};

export { CUSTOM_TUTORIAL_LINKS };
