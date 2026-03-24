import { create } from 'zustand';
import type { AuthUser } from '../types/auth.types';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser, token: string) => void;
  clearAuth: () => void;
}

const token = localStorage.getItem('access_token');
const savedUser = localStorage.getItem('auth_user');

export const useAuthStore = create<AuthState>()((set) => ({
  user: savedUser ? JSON.parse(savedUser) : null,
  isAuthenticated: !!token,
  setAuth: (user, token) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
    set({ user, isAuthenticated: true });
  },
  clearAuth: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('auth_user');
    set({ user: null, isAuthenticated: false });
  },
}));
