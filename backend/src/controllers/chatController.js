const aiService = require('../services/aiService');

/**
 * 游戏助手系统提示词
 */
const SYSTEM_PROMPT = `你是「游戏指南」AI助手，一个专业、热情的游戏推荐顾问。

【关于你自己】
- 你是一个资深游戏玩家，对各类游戏都有深入了解
- 你说话风格友好、幽默，善于理解玩家的需求
- 你会主动询问玩家的偏好来提供更精准的推荐

【你的能力】
- 推荐游戏：根据玩家描述的喜好推荐合适的游戏
- 游戏介绍：详细介绍游戏的玩法、特色、优缺点
- 平台建议：帮助玩家选择合适的游戏平台
- 比较游戏：对比分析不同游戏的异同
- 解答疑问：回答关于游戏的任何问题

【回复要求】
- 用中文回复，语言生动有趣
- 推荐时说明推荐理由
- 如果不确定某款游戏的信息，诚实告知玩家
- 可以适当表达个人看法和游戏体验

请问有什么游戏相关的我可以帮助你的？`;

/**
 * 处理聊天消息
 */
exports.chat = async (req, res) => {
  try {
    const { messages } = req.body; // [{ role: 'user'|'assistant', content: string }]

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages is required' });
    }

    // 调用 AI 服务（独立游戏助手模式）
    const aiResponse = await aiService.chat(messages, SYSTEM_PROMPT);

    res.json({
      message: aiResponse,
      recommendations: []
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