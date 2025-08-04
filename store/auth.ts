import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { persist } from 'zustand/middleware';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

interface AuthActions {
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setInitialized: (initialized: boolean) => void;
  signOut: () => void;
  clearError: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // State
        user: null,
        isLoading: true,
        isInitialized: false,
        error: null,

        // Actions
        setUser: (user) => {
          set({ user, error: null });
        },

        setLoading: (isLoading) => {
          set({ isLoading });
        },

        setError: (error) => {
          set({ error, isLoading: false });
        },

        setInitialized: (isInitialized) => {
          set({ isInitialized, isLoading: false });
        },

        signOut: () => {
          set({ user: null, error: null, isLoading: false });
        },

        clearError: () => {
          set({ error: null });
        },

        updateUser: (updates) => {
          const currentUser = get().user;
          if (currentUser) {
            set({ user: { ...currentUser, ...updates } });
          }
        },
      }),
      {
        name: 'auth-store',
        partialize: (state) => ({
          user: state.user,
          isInitialized: state.isInitialized,
        }),
      }
    )
  )
);

// Selectors for optimized re-renders
export const useUser = () => useAuthStore((state) => state.user);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);
export const useIsAuthenticated = () => useAuthStore((state) => !!state.user);
export const useAuthInitialized = () => useAuthStore((state) => state.isInitialized);