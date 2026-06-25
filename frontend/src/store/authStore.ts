import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';

interface User {
  id: string;
  email: string;
  fullName?: string;
  name?: string;
  role: 'ADMIN' | 'PIC';
  status?: string;
  profileCompleted?: boolean;
  profileImage?: string;
  referralCode?: string;
  rejectionReason?: string;
  isPolicyAccepted?: boolean;
  panCard?: string;
  aadhaarNumber?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setAuth: (user: User, token: string) => void;
  setLoading: (isLoading: boolean) => void;
  logout: () => void;
  initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
      setAuth: (user, token) => set({ user, token, isAuthenticated: true, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ user: null, token: null, isAuthenticated: false, isLoading: false }),

      initAuth: async () => {
        const hasPersistedUser = !!get().user;

        if (!hasPersistedUser) {
          set({ isLoading: true });
        }

        try {
          const res = await api.get('/auth/me');
          const userData = res.data.data;
          set({ user: userData, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
          const status = error?.response?.status;
          if (status === 401 || status === 403) {
            set({ user: null, token: null, isAuthenticated: false, isLoading: false });
          } else {
            set({ isLoading: false });
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isLoading = false;
        }
      },
    }
  )
);
