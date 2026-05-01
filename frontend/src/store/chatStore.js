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

    // 确保有活跃 session
    const { currentSessionId } = get();
    if (!currentSessionId) {
      get().createSession();
    }

    set(state => ({
      messages: [...state.messages, userMessage],
      isLoading: true
    }));

    // 同步消息到当前 session
    get()._syncMessagesToSession();

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

    // 同步最新消息到当前 session
    get()._syncMessagesToSession();
  },

  // 将当前 messages 同步到 sessions 数组中对应的 session
  _syncMessagesToSession: () => {
    const { messages, currentSessionId } = get();
    if (!currentSessionId) return;
    set(state => ({
      sessions: state.sessions.map(s =>
        s.id === currentSessionId
          ? {
              ...s,
              messages: [...messages],
              title: messages.length > 0
                ? messages[0].content.slice(0, 20) + (messages[0].content.length > 20 ? '...' : '')
                : '新对话'
            }
          : s
      )
    }));
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
    const { currentSessionId } = get();
    // 切换前先把当前消息存入旧 session
    if (currentSessionId) {
      get()._syncMessagesToSession();
    }
    const session = get().sessions.find(s => s.id === sessionId);
    if (session) {
      set({
        currentSessionId: sessionId,
        messages: [...(session.messages || [])]
      });
    }
  },

  deleteSession: (sessionId) => {
    set(state => {
      const newSessions = state.sessions.filter(s => s.id !== sessionId);
      let newMessages = state.messages;
      let newCurrentId = state.currentSessionId;
      if (state.currentSessionId === sessionId) {
        if (newSessions.length > 0) {
          newCurrentId = newSessions[0].id;
          newMessages = [...(newSessions[0].messages || [])];
        } else {
          newCurrentId = null;
          newMessages = [];
        }
      }
      return {
        sessions: newSessions,
        currentSessionId: newCurrentId,
        messages: newMessages
      };
    });
  },

  clearMessages: () => {
    set({ messages: [] });
    get()._syncMessagesToSession();
  },

  reset: () => set({
    messages: [],
    sessions: [],
    currentSessionId: null,
    isLoading: false
  })
}));

export default useChatStore;