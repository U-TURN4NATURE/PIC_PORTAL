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
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  logout: () => void;
  initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ user: null, isAuthenticated: false, isLoading: false }),

      initAuth: async () => {
        // If we already have a user in the store (from persisted state),
        // verify in the background WITHOUT showing a loading spinner.
        // This prevents flash-of-redirect on back navigation.
        const hasPersistedUser = !!get().user;

        if (!hasPersistedUser) {
          // No cached user — must wait for API before rendering protected content
          set({ isLoading: true });
        }

        try {
          const res = await api.get('/auth/me');
          const userData = res.data.data;
          set({ user: userData, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
          // Only clear the session if the server explicitly says Unauthorized (401).
          // For network errors, timeouts, 502/503 (Railway cold start), etc.,
          // keep the persisted user so back/refresh navigation still works.
          const status = error?.response?.status;
          if (status === 401 || status === 403) {
            set({ user: null, isAuthenticated: false, isLoading: false });
          } else {
            // Network error / server down — trust the persisted session
            set({ isLoading: false });
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // After hydration from localStorage, we already have user data — stop loading
          state.isLoading = false;
        }
      },
    }
  )
);
