// src/store/auth.store.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { User } from 'firebase/auth';
import type { UserProfile, UserSettings } from '@/types/user.types';

interface AuthState {
  // Firebase Auth user
  firebaseUser: User | null;
  isAuthLoading: boolean;

  // App-level user data
  profile: UserProfile | null;
  settings: UserSettings | null;

  // Auth status
  isAuthenticated: boolean;
  isEmailVerified: boolean;

  // Actions
  setFirebaseUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setSettings: (settings: UserSettings | null) => void;
  setAuthLoading: (loading: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      firebaseUser: null,
      isAuthLoading: true,
      profile: null,
      settings: null,
      isAuthenticated: false,
      isEmailVerified: false,

      setFirebaseUser: (user) =>
        set({
          firebaseUser: user,
          isAuthenticated: !!user,
          isEmailVerified: user?.emailVerified ?? false,
        }),

      setProfile: (profile) => set({ profile }),

      setSettings: (settings) => set({ settings }),

      setAuthLoading: (isAuthLoading) => set({ isAuthLoading }),

      clearAuth: () =>
        set({
          firebaseUser: null,
          profile: null,
          settings: null,
          isAuthenticated: false,
          isEmailVerified: false,
        }),
    }),
    { name: 'vaultone-auth' }
  )
);
