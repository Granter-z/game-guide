const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');

// Groq API 配置 (免费)
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-8b-instant';

// NVIDIA NIM API 配置
const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const NVIDIA_MODEL = 'meta/llama-3.1-8b-instruct';

class AIService {
  constructor() {
    this.provider = process.env.AI_PROVIDER || 'nvidia';
  }

  async chat(messages, systemPrompt) {
    const fullMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    switch (this.provider) {
      case 'nvidia':
        return this.chatWithNVIDIA(fullMessages);
      case 'groq':
        return this.chatWithGroq(fullMessages);
      default:
        return this.chatWithNVIDIA(fullMessages);
    }
  }

  getAgent() {
    const proxyUrl = process.env.PROXY_URL?.trim();
    return proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;
  }

  async chatWithNVIDIA(messages) {
    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      throw new Error('NVIDIA_API_KEY not configured');
    }

    const agent = this.getAgent();
    const axiosConfig = {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 120000
    };
    if (agent) {
      axiosConfig.httpAgent = agent;
      axiosConfig.httpsAgent = agent;
    }

    const response = await axios.post(NVIDIA_API_URL, {
      model: NVIDIA_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 1024
    }, axiosConfig);

    return response.data.choices[0].message.content;
  }

  async chatWithGroq(messages) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY not configured');
    }

    const agent = this.getAgent();
    const axiosConfig = {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    };
    if (agent) {
      axiosConfig.httpAgent = agent;
      axiosConfig.httpsAgent = agent;
    }

    const response = await axios.post(GROQ_API_URL, {
      model: GROQ_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 2048
    }, axiosConfig);

    return response.data.choices[0].message.content;
  }
}

module.exports = new AIService();