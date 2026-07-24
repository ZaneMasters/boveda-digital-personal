// src/types/user.types.ts
import type { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  provider: 'email' | 'google' | 'github';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;                        // 'en', 'es'
  autoLockMinutes: number;                 // 0=never, 1, 5, 15, 30, 60
  clipboardClearSeconds: number;           // 15, 30, 60
  defaultVaultView: 'list' | 'grid';
  showPasswordStrength: boolean;
  developerModeEnabled: boolean;
  mfaEnabled: boolean;
  hasCompletedOnboarding: boolean;         // True after Master Password is set
}

export interface UserSalt {
  salt: string;   // base64 encoded, 32 bytes
  version: number;
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
  theme: 'dark',
  language: 'en',
  autoLockMinutes: 15,
  clipboardClearSeconds: 30,
  defaultVaultView: 'list',
  showPasswordStrength: true,
  developerModeEnabled: false,
  mfaEnabled: false,
  hasCompletedOnboarding: false,
};
