// src/store/ui.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  // Sidebar
  isSidebarCollapsed: boolean;
  isMobileSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (val: boolean) => void;
  setMobileSidebarOpen: (val: boolean) => void;

  // Search
  isSearchOpen: boolean;
  searchQuery: string;
  openSearch: () => void;
  closeSearch: () => void;
  setSearchQuery: (q: string) => void;

  // Theme
  theme: 'light' | 'dark' | 'system';
  resolvedTheme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark' | 'system') => void;

  // Active item (for detail panel)
  activeItemId: string | null;
  setActiveItemId: (id: string | null) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isSidebarCollapsed: false,
      isMobileSidebarOpen: false,
      toggleSidebar: () =>
        set((s) => ({ isSidebarCollapsed: !s.isSidebarCollapsed })),
      setSidebarCollapsed: (val) => set({ isSidebarCollapsed: val }),
      setMobileSidebarOpen: (val) => set({ isMobileSidebarOpen: val }),

      isSearchOpen: false,
      searchQuery: '',
      openSearch: () => set({ isSearchOpen: true }),
      closeSearch: () => set({ isSearchOpen: false, searchQuery: '' }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),

      theme: 'dark',
      resolvedTheme: 'dark',
      setTheme: (theme) => {
        const resolved =
          theme === 'system'
            ? window.matchMedia('(prefers-color-scheme: dark)').matches
              ? 'dark'
              : 'light'
            : theme;
        document.documentElement.classList.toggle('dark', resolved === 'dark');
        set({ theme, resolvedTheme: resolved });
      },

      activeItemId: null,
      setActiveItemId: (activeItemId) => set({ activeItemId }),
    }),
    {
      name: 'vaultone-ui',
      partialize: (s) => ({
        isSidebarCollapsed: s.isSidebarCollapsed,
        theme: s.theme,
      }),
    }
  )
);
