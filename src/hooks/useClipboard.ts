// src/hooks/useClipboard.ts
import { useState, useCallback } from 'react';
import { useAuthStore } from '@/store/auth.store';

interface UseClipboardReturn {
  copy: (text: string, label?: string) => Promise<void>;
  copiedId: string | null;
}

/**
 * Clipboard hook with automatic clearing.
 * Copies text to clipboard and clears it after the configured timeout.
 * Shows a visual confirmation for 2 seconds, then clears after user's setting.
 */
export function useClipboard(): UseClipboardReturn {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { settings } = useAuthStore();
  const clearSeconds = settings?.clipboardClearSeconds ?? 30;

  const copy = useCallback(
    async (text: string, label = 'value') => {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedId(label);

        // Visual confirmation reset after 2 seconds
        setTimeout(() => setCopiedId(null), 2000);

        // Clear clipboard after configured time
        setTimeout(async () => {
          try {
            const current = await navigator.clipboard.readText();
            // Only clear if we're still the last thing copied
            if (current === text) {
              await navigator.clipboard.writeText('');
            }
          } catch {
            // Clipboard read might fail due to permissions — non-fatal
          }
        }, clearSeconds * 1000);
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
      }
    },
    [clearSeconds]
  );

  return { copy, copiedId };
}
