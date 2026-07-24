// src/features/vault/components/AppHeader.tsx
import { Search, Moon, Sun, Monitor, Lock } from 'lucide-react';
import { useUIStore } from '@/store/ui.store';
import { useAuthStore } from '@/store/auth.store';
import { useVaultStore } from '@/store/vault.store';
import { getInitials } from '@/lib/utils';

export function AppHeader() {
  const { openSearch, theme, setTheme } = useUIStore();
  const { firebaseUser, profile } = useAuthStore();
  const { lock } = useVaultStore();

  const displayName = profile?.displayName ?? firebaseUser?.displayName ?? firebaseUser?.email ?? '';
  const avatarUrl = profile?.photoURL ?? firebaseUser?.photoURL;

  const nextTheme = theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark';
  const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;

  return (
    <header
      className="h-16 flex items-center justify-between px-6 border-b shrink-0"
      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
    >
      {/* Search bar */}
      <button
        id="global-search-trigger"
        onClick={openSearch}
        className="flex items-center gap-3 px-4 py-2 rounded-xl text-sm transition-all duration-200 group"
        style={{
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-subtle)',
          color: 'var(--text-muted)',
          minWidth: '280px',
        }}
      >
        <Search className="w-4 h-4" />
        <span>Search vault...</span>
        <div className="ml-auto flex items-center gap-1 text-xs opacity-70">
          <kbd className="px-1.5 py-0.5 rounded text-xs font-mono"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
            ⌘
          </kbd>
          <kbd className="px-1.5 py-0.5 rounded text-xs font-mono"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
            K
          </kbd>
        </div>
      </button>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          id="theme-toggle-btn"
          onClick={() => setTheme(nextTheme)}
          className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200"
          style={{ color: 'var(--text-secondary)' }}
          title={`Switch to ${nextTheme} mode`}
        >
          <ThemeIcon className="w-4 h-4" />
        </button>

        {/* Lock */}
        <button
          id="header-lock-btn"
          onClick={lock}
          className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 hover:text-brand-400"
          style={{ color: 'var(--text-secondary)' }}
          title="Lock vault (Ctrl+L)"
        >
          <Lock className="w-4 h-4" />
        </button>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold cursor-pointer overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: 'white' }}>
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            getInitials(displayName)
          )}
        </div>
      </div>
    </header>
  );
}
