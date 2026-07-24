// src/features/passwords/components/PasswordItem.tsx
import { useState, useRef, useEffect } from 'react';
import { Globe, MoreVertical, KeyRound, User, Edit2, Trash2, ExternalLink } from 'lucide-react';
import type { DecryptedVaultItem, PasswordData } from '@/types/vault.types';
import { CopyButton } from '@/components/ui/CopyButton';
import { motion, AnimatePresence } from 'framer-motion';

export interface PasswordItemProps {
  item: DecryptedVaultItem<PasswordData>;
  onEdit: (item: DecryptedVaultItem<PasswordData>) => void;
  onDelete: (id: string) => void;
}

export function PasswordItem({ item, onEdit, onDelete }: PasswordItemProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const data = item.data;

  // Simple heuristic for an icon: first letter or Globe
  const initial = item.name.charAt(0).toUpperCase();

  // Handle click outside to close menu
  useEffect(() => {
    if (!showMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  // Ensure website has valid url protocol for href
  const websiteUrl = data.website?.startsWith('http') ? data.website : `https://${data.website}`;

  return (
    <div className={`vault-item group relative flex flex-wrap items-center justify-between p-3 sm:p-4 ${showMenu ? 'z-20' : ''}`}>
      
      {/* Left side: Icon + Info */}
      <div className="flex items-center flex-1 min-w-[200px] mr-2">
        {/* Icon / Avatar */}
        <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-surface-800 border border-surface-700 flex items-center justify-center text-lg sm:text-xl font-bold text-brand-400 mr-3 sm:mr-4">
          {item.icon ? (
            <span>{item.icon}</span>
          ) : data.website ? (
            <Globe className="w-4 h-4 sm:w-5 sm:h-5 opacity-50" />
          ) : (
            initial
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-base font-semibold text-white truncate">{item.name}</h3>
          <p className="text-xs sm:text-sm text-surface-400 truncate">
            {data.username || data.email || 'No username'}
          </p>
        </div>
      </div>

      {/* Right side: Actions + Menu */}
      <div className="flex items-center mt-3 sm:mt-0 ml-auto gap-1 sm:gap-2">
        {/* Quick Actions */}
        <div className="flex items-center gap-1 sm:gap-2 mr-1 sm:mr-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
          {data.website && (
            <a
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Open website"
              className="p-1.5 rounded-md transition-colors text-surface-500 hover:text-surface-200 hover:bg-surface-800 focus:outline-none focus:ring-2 focus:ring-brand-500/50 flex items-center justify-center bg-surface-900 border border-surface-700 h-[32px] w-[32px] sm:h-[34px] sm:w-[34px]"
            >
              <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </a>
          )}
          <div className="flex items-center bg-surface-900 border border-surface-700 rounded-lg p-1">
            <CopyButton value={data.username || data.email || ''} title="Copy username" iconType="user" className="hover:bg-surface-800" />
            <div className="w-px h-4 bg-surface-700 mx-1" />
            <CopyButton value={data.password || ''} title="Copy password" iconType="password" className="hover:bg-surface-800" />
          </div>
        </div>

        {/* Context Menu Button */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 sm:p-2 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
          >
            <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-48 rounded-xl glass-card shadow-xl z-20 overflow-hidden py-1 border border-surface-700"
              >
                <button
                  onClick={() => { setShowMenu(false); onEdit(item); }}
                  className="flex items-center w-full px-4 py-2 text-sm text-surface-300 hover:text-white hover:bg-brand-500/10 transition-colors"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Item
                </button>
                <div className="h-px bg-surface-700/50 my-1" />
                <button
                  onClick={() => { setShowMenu(false); onDelete(item.id); }}
                  className="flex items-center w-full px-4 py-2 text-sm text-danger-400 hover:bg-danger-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Move to Trash
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
