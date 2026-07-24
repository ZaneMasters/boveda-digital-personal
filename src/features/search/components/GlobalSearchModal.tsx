import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { useUIStore } from '@/store/ui.store';

export function GlobalSearchModal() {
  const { isSearchOpen, searchQuery, closeSearch, setSearchQuery } = useUIStore();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isSearchOpen]);

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
            onClick={closeSearch}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.15 }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 z-50 w-full max-w-xl"
          >
            <div className="rounded-2xl overflow-hidden shadow-2xl"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-4 border-b"
                style={{ borderColor: 'var(--border-subtle)' }}>
                <Search className="w-5 h-5 shrink-0" style={{ color: 'var(--text-muted)' }} />
                <input
                  ref={inputRef}
                  id="global-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search passwords, notes, cards..."
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: 'var(--text-primary)' }}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-surface-500 hover:text-surface-300">
                    <X className="w-4 h-4" />
                  </button>
                )}
                <kbd className="px-2 py-1 rounded text-xs font-mono text-surface-500"
                  style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-default)' }}>
                  Esc
                </kbd>
              </div>

              {/* Empty state */}
              {!searchQuery && (
                <div className="py-12 text-center">
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    Start typing to search your vault
                  </p>
                </div>
              )}

              {/* Results placeholder */}
              {searchQuery && (
                <div className="py-4">
                  <p className="px-4 py-2 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                    No results yet — search coming in Phase 7
                  </p>
                </div>
              )}

              {/* Footer shortcuts */}
              <div className="border-t px-4 py-3 flex items-center gap-4 text-xs"
                style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded font-mono"
                    style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-default)' }}>↵</kbd>
                  to select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded font-mono"
                    style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-default)' }}>↑↓</kbd>
                  to navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded font-mono"
                    style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-default)' }}>Esc</kbd>
                  to close
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
