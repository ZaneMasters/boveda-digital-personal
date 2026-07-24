// src/layouts/AppLayout.tsx
import { Outlet, useNavigate } from 'react-router-dom';
import { useAutoLock } from '@/hooks/useAutoLock';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useVaultStore } from '@/store/vault.store';
import { useUIStore } from '@/store/ui.store';
import { AppSidebar } from '@/features/vault/components/AppSidebar';
import { AppHeader } from '@/features/vault/components/AppHeader';
import { GlobalSearchModal } from '@/features/search/components/GlobalSearchModal';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

import { AnimatedBackground } from '@/components/ui/AnimatedBackground';

export function AppLayout() {
  const { isLocked } = useVaultStore();
  const { isSidebarCollapsed } = useUIStore();
  const navigate = useNavigate();

  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Initialize global behaviors
  useAutoLock();
  useKeyboardShortcuts();

  // Redirect to unlock if vault gets locked (e.g., auto-lock fires)
  useEffect(() => {
    if (isLocked) {
      navigate('/unlock', { replace: true });
    }
  }, [isLocked, navigate]);

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    // Only apply scroll hide behavior on mobile devices (window width < 768px)
    if (window.innerWidth >= 768) return;
    
    const currentScrollY = e.currentTarget.scrollTop;
    
    // Allow a small threshold before hiding to prevent jitter
    if (currentScrollY > lastScrollY && currentScrollY > 60) {
      setIsHeaderVisible(false);
    } else if (currentScrollY < lastScrollY || currentScrollY <= 0) {
      setIsHeaderVisible(true);
    }
    
    setLastScrollY(currentScrollY);
  };

  return (
    <div className="flex h-screen overflow-hidden text-surface-200">
      <AnimatedBackground />
      {/* Sidebar */}
      <AppSidebar />

      {/* Main content */}
      <div
        className={`flex flex-col flex-1 min-w-0 transition-all duration-300 ${
          isSidebarCollapsed ? 'md:ml-[64px]' : 'md:ml-[240px]'
        }`}
      >
        {/* Header wrapper for mobile hiding */}
        <div 
          className={`transition-all duration-300 ease-in-out shrink-0 ${
            !isHeaderVisible ? 'mt-[-64px] opacity-0 pointer-events-none md:mt-0 md:opacity-100 md:pointer-events-auto' : 'mt-0 opacity-100'
          }`}
        >
          <AppHeader />
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto" onScroll={handleScroll}>
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
