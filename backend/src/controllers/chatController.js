const aiService = require('../services/aiService');
const gameContextBuilder = require('../services/gameContextBuilder');

/**
 * 处理聊天消息 - 使用 gameContextBuilder 构建动态系统提示词
 */
exports.chat = async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages is required' });
    }

    // 用最后一条用户消息来构建游戏上下文
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    const userQuery = lastUserMessage?.content || '';

    // 动态构建系统提示词（包含热门游戏 + 搜索相关游戏）
    const systemPrompt = await gameContextBuilder.buildSystemPrompt(userQuery);

    const aiResponse = await aiService.chat(messages, systemPrompt);

    // 从 AI 回复中解析推荐的游戏
    const recommendations = await gameContextBuilder.parseRecommendations(aiResponse, userQuery);

    res.json({
      message: aiResponse,
      recommendations
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: 'AI service error',
      message: error.message
    });
  }
};

/**
 * 获取可用模型列表
 */
exports.getModels = async (req, res) => {
  res.json({
    providers: [
      { id: 'nvidia', name: 'NVIDIA NIM (Llama)', models: ['nvidia/llama-3.1-nemotron-70b-instruct'] },
      { id: 'groq', name: 'Groq (Llama)', models: ['llama-3.1-8b-instant', 'llama-3.2-11b-vision'] }
    ]
  });
};