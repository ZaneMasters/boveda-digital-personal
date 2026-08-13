// src/features/notes/components/NoteItem.tsx
import { useState, useRef, useEffect } from 'react';
import { MoreVertical, StickyNote, Edit2, Trash2 } from 'lucide-react';
import type { DecryptedVaultItem, NoteData } from '@/types/vault.types';

import { motion, AnimatePresence } from 'framer-motion';
import MDEditor from '@uiw/react-md-editor';

export interface NoteItemProps {
  item: DecryptedVaultItem<NoteData>;
  onEdit: (item: DecryptedVaultItem<NoteData>) => void;
  onDelete: (id: string) => void;
  onClick?: (item: DecryptedVaultItem<NoteData>) => void;

}

export function NoteItem({ item, onEdit, onDelete, onClick }: NoteItemProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const data = item.data;

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

  return (
    <div className={`vault-item flex flex-col min-h-[120px] max-h-[400px] min-w-[200px] sm:max-w-[400px] p-4 relative group ${showMenu ? 'z-20' : ''}`}>
      
      {/* Header: Title + Menu */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 min-w-0 flex-1 mr-2">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-400 mt-0.5">
            <StickyNote className="w-4 h-4 opacity-80" />
          </div>
          <h3 className="font-semibold text-white text-base leading-tight break-words">{item.name}</h3>
        </div>

        {/* Context Menu */}
        <div className="relative flex-shrink-0 ml-2" ref={menuRef}>
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            className="p-1.5 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
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
                  onClick={(e) => { e.stopPropagation(); setShowMenu(false); onEdit(item); }}
                  className="flex items-center w-full px-4 py-2 text-sm text-surface-300 hover:text-white hover:bg-brand-500/10 transition-colors"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Note
                </button>
                <div className="h-px bg-surface-700/50 my-1" />
                <button
                  onClick={(e) => { e.stopPropagation(); setShowMenu(false); onDelete(item.id); }}
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

      {/* Content Area */}
      <div 
        className="flex-1 overflow-hidden relative cursor-pointer"
        onClick={() => onClick?.(item)}
        data-color-mode="dark"
      >
        {data.isMarkdown && data.content ? (
          <div className="text-sm prose prose-invert prose-sm max-w-none pointer-events-none">
            <MDEditor.Markdown 
              source={data.content} 
              style={{ backgroundColor: 'transparent', color: 'var(--text-primary)', fontSize: '0.875rem' }} 
            />
          </div>
        ) : (
          <p className="text-sm text-surface-300 whitespace-pre-wrap leading-relaxed">
            {data.content || 'Empty note'}
          </p>
        )}
        
        {/* Fade out effect at the bottom in case note is too long */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-surface-900 to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
