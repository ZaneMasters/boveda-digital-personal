// src/store/vault.store.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface VaultState {
  // The derived CryptoKey — lives ONLY in memory, never persisted
  // When this is null, the vault is locked
  cryptoKey: CryptoKey | null;

  // Vault lock status
  isLocked: boolean;
  isUnlocking: boolean;

  // Auto-lock timer ID
  lockTimerId: ReturnType<typeof setTimeout> | null;
  lastActivityAt: number; // timestamp

  // Actions
  unlock: (key: CryptoKey) => void;
  lock: () => void;
  setUnlocking: (val: boolean) => void;
  recordActivity: () => void;
  setLockTimer: (id: ReturnType<typeof setTimeout> | null) => void;
}

export const useVaultStore = create<VaultState>()(
  devtools(
    (set, get) => ({
      cryptoKey: null,
      isLocked: true,
      isUnlocking: false,
      lockTimerId: null,
      lastActivityAt: Date.now(),

      unlock: (key: CryptoKey) => {
        const { lockTimerId } = get();
        if (lockTimerId) clearTimeout(lockTimerId);
        set({
          cryptoKey: key,
          isLocked: false,
          lockTimerId: null,
          lastActivityAt: Date.now(),
        });
      },

      lock: () => {
        const { lockTimerId } = get();
        if (lockTimerId) clearTimeout(lockTimerId);
        set({
          cryptoKey: null,
          isLocked: true,
          lockTimerId: null,
        });
      },

      setUnlocking: (isUnlocking) => set({ isUnlocking }),

      recordActivity: () => set({ lastActivityAt: Date.now() }),

      setLockTimer: (id) => set({ lockTimerId: id }),
    }),
    { name: 'vaultone-vault' }
  )
);
