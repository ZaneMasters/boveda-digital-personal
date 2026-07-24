// src/features/vault/components/AppSidebar.tsx
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, LayoutDashboard, KeyRound, StickyNote,
  CreditCard, Landmark, User, FileText, Paperclip,
  Wifi, Key, RefreshCw, Terminal, Shield, Zap,
  Settings, ChevronLeft, Lock, LogOut
} from 'lucide-react';
import { useUIStore } from '@/store/ui.store';
import { useVaultStore } from '@/store/vault.store';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/app', end: true },
  { label: 'Passwords', icon: KeyRound, to: '/app/passwords' },
  { label: 'Secure Notes', icon: StickyNote, to: '/app/notes' },
  { label: 'Cards', icon: CreditCard, to: '/app/cards' },
  { label: 'Bank Accounts', icon: Landmark, to: '/app/bank' },
  { label: 'Identities', icon: User, to: '/app/identities' },
  { label: 'Documents', icon: FileText, to: '/app/documents' },
  { label: 'Attachments', icon: Paperclip, to: '/app/attachments' },
  { label: 'WiFi', icon: Wifi, to: '/app/wifi' },
  { label: 'Licenses', icon: Key, to: '/app/licenses' },
  { label: 'Recovery Codes', icon: RefreshCw, to: '/app/recovery' },
];

const DEVELOPER_ITEMS = [
  { label: 'Dev Vault', icon: Terminal, to: '/app/developer' },
];

const BOTTOM_ITEMS = [
  { label: 'Security', icon: Shield, to: '/app/security' },
  { label: 'Generator', icon: Zap, to: '/app/generator' },
  { label: 'Settings', icon: Settings, to: '/app/settings' },
];

export function AppSidebar() {
  const { isSidebarCollapsed, toggleSidebar, isMobileSidebarOpen, setMobileSidebarOpen } = useUIStore();
  const { lock } = useVaultStore();
  const { settings } = useAuthStore();

  const showDev = settings?.developerModeEnabled ?? false;

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        animate={{ width: isSidebarCollapsed ? 64 : 240 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`fixed left-0 top-0 h-full flex flex-col z-50 border-r transition-transform duration-300 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        style={{ background: 'var(--bg-sidebar)', borderColor: 'var(--border-subtle)' }}
      >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b shrink-0"
        style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
          <ShieldCheck className="w-4 h-4 text-white" />
        </div>
        <AnimatePresence>
          {!isSidebarCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="ml-3 font-bold text-white text-lg tracking-tight whitespace-nowrap"
            >
              VaultOne
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {NAV_ITEMS.map((item) => (
          <SidebarLink key={item.to} item={item} collapsed={isSidebarCollapsed} />
        ))}

        {showDev && (
          <>
            <div className="py-2 px-2">
              <div className="h-px" style={{ background: 'var(--border-subtle)' }} />
            </div>
            {DEVELOPER_ITEMS.map((item) => (
              <SidebarLink key={item.to} item={item} collapsed={isSidebarCollapsed} />
            ))}
          </>
        )}
      </nav>

      {/* Bottom items */}
      <div className="border-t py-3 px-2 space-y-0.5" style={{ borderColor: 'var(--border-subtle)' }}>
        {BOTTOM_ITEMS.map((item) => (
          <SidebarLink key={item.to} item={item} collapsed={isSidebarCollapsed} />
        ))}

        {/* Lock button */}
        <button
          onClick={lock}
          className="sidebar-link w-full"
          title="Lock vault (Ctrl+L)"
        >
          <Lock className="w-4 h-4 shrink-0" />
          <AnimatePresence>
            {!isSidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm font-medium whitespace-nowrap"
              >
                Lock Vault
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* Sign Out button */}
        <button
          onClick={async () => {
            const { signOutUser } = await import('@/services/auth.service');
            await signOutUser();
            // Optional: The auth state listener in App will handle redirect
          }}
          className="sidebar-link w-full text-danger-400 hover:bg-danger-500/10 hover:text-danger-400"
          title="Sign out of VaultOne"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <AnimatePresence>
            {!isSidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm font-medium whitespace-nowrap"
              >
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Collapse toggle (Desktop only) */}
      <div className="border-t px-2 py-3 hidden md:block" style={{ borderColor: 'var(--border-subtle)' }}>
        <button
          onClick={toggleSidebar}
          className="sidebar-link w-full"
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <motion.div animate={{ rotate: isSidebarCollapsed ? 180 : 0 }}>
            <ChevronLeft className="w-4 h-4 shrink-0" />
          </motion.div>
          <AnimatePresence>
            {!isSidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm whitespace-nowrap"
              >
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
    </>
  );
}

interface NavItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  to: string;
  end?: boolean;
}

function SidebarLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const { setMobileSidebarOpen } = useUIStore();
  
  return (
    <NavLink
      to={item.to}
      end={item.end}
      title={collapsed ? item.label : undefined}
      onClick={() => setMobileSidebarOpen(false)}
      className={({ isActive }) =>
        cn('sidebar-link', isActive && 'active')
      }
    >
      <item.icon className="w-4 h-4 shrink-0" />
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="whitespace-nowrap overflow-hidden text-ellipsis"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
    </NavLink>
  );
}
