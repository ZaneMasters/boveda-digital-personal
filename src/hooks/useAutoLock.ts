// src/hooks/useAutoLock.ts
import { useEffect, useCallback } from 'react';
import { useVaultStore } from '@/store/vault.store';
import { useAuthStore } from '@/store/auth.store';

const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'touchstart', 'scroll'] as const;

/**
 * Auto-lock hook — monitors user activity and locks the vault after inactivity.
 * The CryptoKey is wiped from memory when the vault locks.
 *
 * Usage: Call this once in AppLayout or a top-level provider.
 */
export function useAutoLock() {
  const { lock, recordActivity, setLockTimer, isLocked } = useVaultStore();
  const { settings } = useAuthStore();

  const timeoutMinutes = settings?.autoLockMinutes ?? 15;

  const resetTimer = useCallback(() => {
    if (timeoutMinutes === 0) return; // 0 = never lock

    recordActivity();

    const { lockTimerId, setLockTimer: _setTimer } = useVaultStore.getState();
    if (lockTimerId) clearTimeout(lockTimerId);

    const id = setTimeout(() => {
      useVaultStore.getState().lock();
    }, timeoutMinutes * 60 * 1000);

    setLockTimer(id);
  }, [timeoutMinutes, recordActivity, setLockTimer]);

  useEffect(() => {
    if (isLocked || timeoutMinutes === 0) return;

    // Start timer on mount
    resetTimer();

    // Reset timer on any activity
    ACTIVITY_EVENTS.forEach((event) =>
      document.addEventListener(event, resetTimer, { passive: true })
    );

    return () => {
      ACTIVITY_EVENTS.forEach((event) =>
        document.removeEventListener(event, resetTimer)
      );
      const { lockTimerId } = useVaultStore.getState();
      if (lockTimerId) clearTimeout(lockTimerId);
    };
  }, [isLocked, timeoutMinutes, resetTimer]);

  return { lock };
}
