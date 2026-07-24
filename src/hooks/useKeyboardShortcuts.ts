// src/hooks/useKeyboardShortcuts.ts
import { useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { useVaultStore } from '@/store/vault.store';

/**
 * Global keyboard shortcuts for VaultOne.
 * Only active when the vault is unlocked.
 */
export function useKeyboardShortcuts() {
  const { openSearch, toggleSidebar } = useUIStore();
  const { isLocked, lock } = useVaultStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toLowerCase().includes('mac');
      const mod = isMac ? e.metaKey : e.ctrlKey;

      if (isLocked) return;

      // Cmd/Ctrl + K — Open global search
      if (mod && e.key === 'k') {
        e.preventDefault();
        openSearch();
      }

      // Cmd/Ctrl + B — Toggle sidebar
      if (mod && e.key === 'b') {
        e.preventDefault();
        toggleSidebar();
      }

      // Cmd/Ctrl + L — Lock vault
      if (mod && e.key === 'l') {
        e.preventDefault();
        lock();
      }

      // Escape — Close search
      if (e.key === 'Escape') {
        useUIStore.getState().closeSearch();
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isLocked, openSearch, toggleSidebar, lock]);
}
