// src/layouts/AppLayout.tsx
import { Outlet, useNavigate } from 'react-router-dom';
import { useAutoLock } from '@/hooks/useAutoLock';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useVaultStore } from '@/store/vault.store';
import { useUIStore } from '@/store/ui.store';
import { AppSidebar } from '@/features/vault/components/AppSidebar';
import { AppHeader } from '@/features/vault/components/AppHeader';
import { GlobalSearchModal } from '@/features/search/components/GlobalSearchModal';
import { useEffect } from 'react';
import { motion } from 'framer-motion';

export function AppLayout() {
  const { isLocked } = useVaultStore();
  const { isSidebarCollapsed } = useUIStore();
  const navigate = useNavigate();

  // Initialize global behaviors
  useAutoLock();
  useKeyboardShortcuts();

  // Redirect to unlock if vault gets locked (e.g., auto-lock fires)
  useEffect(() => {
    if (isLocked) {
      navigate('/unlock', { replace: true });
    }
  }, [isLocked, navigate]);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <AppSidebar />

      {/* Main content */}
      <div
        className={`flex flex-col flex-1 min-w-0 transition-all duration-300 ${
          isSidebarCollapsed ? 'md:ml-[64px]' : 'md:ml-[240px]'
        }`}
      >
        {/* Header */}
        <AppHeader />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      {/* Global search modal */}
      <GlobalSearchModal />
    </div>
  );
}
