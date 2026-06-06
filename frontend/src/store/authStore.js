import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/axios';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,
      error: null,

      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          localStorage.setItem('shopbd_token', data.token);
          set({ user: data.user, token: data.token, loading: false });
          return data;
        } catch (err) {
          const msg = err.response?.data?.message || 'Login failed';
          set({ error: msg, loading: false });
          throw new Error(msg);
        }
      },

      register: async (name, email, password) => {
        set({ loading: true, error: null });
        try {
          const { data } = await api.post('/auth/register', { name, email, password });
          localStorage.setItem('shopbd_token', data.token);
          set({ user: data.user, token: data.token, loading: false });
          return data;
        } catch (err) {
          const msg = err.response?.data?.message || 'Registration failed';
          set({ error: msg, loading: false });
          throw new Error(msg);
        }
      },

      logout: async () => {
        try { await api.post('/auth/logout'); } catch {}
        localStorage.removeItem('shopbd_token');
        set({ user: null, token: null });
      },

      fetchMe: async () => {
        try {
          const { data } = await api.get('/auth/me');
          set({ user: data.user });
        } catch {
          set({ user: null, token: null });
          localStorage.removeItem('shopbd_token');
        }
      },

      updateProfile: async (updates) => {
        const { data } = await api.put('/auth/me', updates);
        set({ user: data.user });
      },

      isAdmin: () => {
        const { user } = get();
        return user?.role === 'admin' || user?.role === 'superadmin';
      },

      isLoggedIn: () => !!get().user,
    }),
    {
      name: 'shopbd-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);

export default useAuthStore;
