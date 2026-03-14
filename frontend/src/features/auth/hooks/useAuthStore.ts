import { create } from "zustand";
import { authService } from "@/services/authService";

interface User {
  id: number;
  username: string;
  email: string;
  roles: string[];
  token: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initialize: () => void;
  fetchUser: () => Promise<void>;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // Thêm trạng thái loading để dashboard chờ

  initialize: () => {
    const user = authService.getCurrentUser();
    if (user) {
      set({ user, isAuthenticated: true, isLoading: false });
    } else {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  fetchUser: async () => {
    set({ isLoading: true });
    try {
      const userData = await authService.getMe();
      if (userData) {
         set({ user: userData, isAuthenticated: true, isLoading: false });
      }
    } catch (err) {
      console.error("Failed to fetch user in store", err);
      authService.logout();
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  setUser: (user) => {
    set({ user, isAuthenticated: true });
  },

  logout: () => {
    authService.logout();
    set({ user: null, isAuthenticated: false });
    // Nếu gọi logout() từ client component thì có thể dùng next/navigation router để đẩy về /login
  },
}));
