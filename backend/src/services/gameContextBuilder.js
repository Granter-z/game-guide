const rawgController = require('../controllers/rawgController');

/**
 * 构建游戏上下文，让 AI 了解游戏库中的游戏
 * 策略：
 * 1. 实时搜索相关游戏 - 根据用户 query 从 RAWG 搜索
 * 2. 热门游戏缓存 - 定期更新热门游戏列表
 * 3. 游戏详情获取 - 根据 slug 获取详细信息
 */
class GameContextBuilder {
  constructor() {
    this.hotGamesCache = null;
    this.hotGamesCacheTime = 0;
    this.CACHE_TTL = 60 * 60 * 1000; // 1小时
  }

  /**
   * 获取热门游戏列表 (带缓存)
   */
  async getHotGames() {
    const now = Date.now();
    if (this.hotGamesCache && (now - this.hotGamesCacheTime) < this.CACHE_TTL) {
      return this.hotGamesCache;
    }

    try {
      // 从 RAWG 获取评分最高的游戏 (PC + PS4/5)
      const data = await rawgController.getGames(1, 50, { ordering: '-metacritic', platforms: '1,18,187' });
      this.hotGamesCache = data.results;
      this.hotGamesCacheTime = now;
      return this.hotGamesCache;
    } catch (error) {
      console.error('Failed to fetch hot games:', error);
      return this.hotGamesCache || [];
    }
  }

  /**
   * 根据用户描述搜索相关游戏
   */
  async searchRelevantGames(query, page = 1) {
    try {
      const data = await rawgController.searchGames(query, page);
      return data.results || [];
    } catch (error) {
      console.error('Failed to search games:', error);
      return [];
    }
  }

  /**
   * 获取游戏详情
   */
  async getGameDetails(slug) {
    try {
      return await rawgController.getGameBySlug(slug);
    } catch (error) {
      console.error('Failed to fetch game details:', error);
      return null;
    }
  }

  /**
   * 构建系统提示词
   * @param {string} userQuery - 用户的原始问题
   * @returns {Promise<string>} 系统提示词
   */
  async buildSystemPrompt(userQuery) {
    // 1. 获取热门游戏作为背景
    const hotGames = await this.getHotGames();
    const hotGamesContext = hotGames.slice(0, 30).map(g =>
      `- ${g.name} (${g.released || 'TBA'}) - ${g.genres?.map(x => x.name).join(', ') || 'Unknown'} - Metacritic: ${g.metacritic || 'N/A'}`
    ).join('\n');

    // 2. 根据用户 query 搜索相关游戏
    const relevantGames = await this.searchRelevantGames(userQuery);
    const relevantGamesContext = relevantGames.slice(0, 10).map(g =>
      `- ${g.name} (ID: ${g.id}, slug: ${g.slug}) - ${g.genres?.map(x => x.name).join(', ') || 'Unknown'} - Metacritic: ${g.metacritic || 'N/A'}`
    ).join('\n');

    return `你是游戏推荐助手，基于以下游戏库帮助用户找到合适的游戏。

【热门游戏库 Top 30】
${hotGamesContext}

【根据用户问题搜索到的相关游戏】
${relevantGamesContext}

【推荐规则】
1. 优先推荐游戏库中存在的游戏，使用游戏slug进行链接：/games/{slug}
2. 如果推荐库外游戏，请明确说明
3. 推荐时提供游戏名称、简介、评分等
4. 可以询问用户的偏好（类型、平台、画质等）以细化推荐
5. 用中文回复，语言友好热情

【输出格式】
当推荐具体游戏时，尽量包含：
- 游戏名称
- 评分 (metacritic)
- 简要介绍
- 适合人群

请用友好的方式回复用户的问题。`;
  }

  /**
   * 从 AI 回复中解析推荐的游戏
   * 尝试从回复中提取游戏名称，匹配游戏库
   */
  async parseRecommendations(aiResponse, userQuery) {
    const recommendations = [];

    try {
      // 获取相关游戏用于匹配
      const relevantGames = await this.searchRelevantGames(userQuery);

      // 简单匹配：在 AI 回复中查找游戏名
      for (const game of relevantGames) {
        if (aiResponse.includes(game.name)) {
          recommendations.push({
            id: game.id,
            name: game.name,
            slug: game.slug,
            background_image: game.background_image,
            metacritic: game.metacritic,
            genres: game.genres
          });
        }
        if (recommendations.length >= 5) break;
      }
    } catch (error) {
      console.error('Failed to parse recommendations:', error);
    }

    return recommendations;
  }
}

module.exports = new GameContextBuilder();