import { create } from 'zustand';
import api from '../services/api';

const useChatStore = create((set, get) => ({
  messages: [],
  sessions: [],
  currentSessionId: null,
  isLoading: false,

  sendMessage: async (content) => {
    const userMessage = {
      role: 'user',
      content,
      timestamp: Date.now()
    };

    set(state => ({
      messages: [...state.messages, userMessage],
      isLoading: true
    }));

    try {
      const response = await api.post('/chat', {
        messages: get().messages
      });

      const assistantMessage = {
        role: 'assistant',
        content: response.data.message,
        recommendations: response.data.recommendations || [],
        timestamp: Date.now()
      };

      set(state => ({
        messages: [...state.messages, assistantMessage],
        isLoading: false
      }));
    } catch (error) {
      console.error('Chat error:', error);
      set(state => ({
        messages: [...state.messages, {
          role: 'assistant',
          content: error.response?.data?.message || error.message || '抱歉，AI服务暂时不可用，请稍后再试。',
          timestamp: Date.now(),
          isError: true
        }],
        isLoading: false
      }));
    }
  },

  createSession: () => {
    const newSession = {
      id: Date.now().toString(),
      title: '新对话',
      messages: [],
      createdAt: Date.now()
    };
    set(state => ({
      sessions: [newSession, ...state.sessions],
      currentSessionId: newSession.id,
      messages: []
    }));
  },

  switchSession: (sessionId) => {
    const session = get().sessions.find(s => s.id === sessionId);
    if (session) {
      set({
        currentSessionId: sessionId,
        messages: session.messages
      });
    }
  },

  clearMessages: () => set({ messages: [] }),

  reset: () => set({
    messages: [],
    sessions: [],
    currentSessionId: null,
    isLoading: false
  })
}));

export default useChatStore;