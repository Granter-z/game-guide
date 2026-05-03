import { create } from 'zustand';
import api from '../services/api';

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false, // 默认 false，启动时通过 checkAuth 验证
  authChecked: false,     // 是否已完成首次验证

  setUser: (user) => set({ user }),
  setToken: (token) => {
    localStorage.setItem('token', token);
    set({ token, isAuthenticated: !!token });
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false, authChecked: true });
  },

  /**
   * 验证本地 token 是否有效，应用启动时调用一次
   */
  checkAuth: async () => {
    const token = get().token;
    if (!token) {
      set({ isAuthenticated: false, authChecked: true });
      return;
    }
    try {
      const res = await api.get('/auth/me');
      set({ user: res.data, isAuthenticated: true, authChecked: true });
    } catch {
      // token 过期或无效，清除本地状态
      localStorage.removeItem('token');
      set({ user: null, token: null, isAuthenticated: false, authChecked: true });
    }
  }
}));

export default useAuthStore;
