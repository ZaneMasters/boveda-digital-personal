// src/features/notes/pages/NotesPage.tsx
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, StickyNote } from 'lucide-react';
import { useVaultItems, useDeleteVaultItem, useUpdateVaultItem } from '@/features/vault/hooks/useVaultQueries';
import { NoteItem } from '../components/NoteItem';
import { NoteFormModal } from '../components/NoteFormModal';
import { NoteViewModal } from '../components/NoteViewModal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { DecryptedVaultItem, NoteData } from '@/types/vault.types';

export function NotesPage() {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DecryptedVaultItem<NoteData> | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'a-z' | 'recent' | 'frequent'>('recent');
  
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: items, isLoading, error } = useVaultItems('note');
  const deleteMutation = useDeleteVaultItem();
  const updateMutation = useUpdateVaultItem();

  const handleView = (item: DecryptedVaultItem<NoteData>) => {
    setSelectedItem(item);
    setIsViewModalOpen(true);
  };

  const handleEdit = (item: DecryptedVaultItem<NoteData>) => {
    setSelectedItem(item);
    setIsViewModalOpen(false); // Close view if open
    setIsFormModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedItem(null);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync({ id: itemToDelete });
      setItemToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUse = async (item: DecryptedVaultItem<NoteData>) => {
    try {
      await updateMutation.mutateAsync({
        ...item,
        usageCount: (item.usageCount || 0) + 1,
      });
    } catch (e) {
      console.error('Failed to update usage count', e);
    }
  };

  const filteredItems = useMemo(() => {
    if (!items) return [];
    const query = searchQuery.toLowerCase();
    const filtered = (items as DecryptedVaultItem<NoteData>[]).filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.data.content?.toLowerCase().includes(query)
    );

    return filtered.sort((a, b) => {
      if (sortBy === 'a-z') return a.name.localeCompare(b.name);
      if (sortBy === 'recent') return b.createdAt.toMillis() - a.createdAt.toMillis();
      if (sortBy === 'frequent') return (b.usageCount || 0) - (a.usageCount || 0);
      return 0;
    });
  }, [items, searchQuery, sortBy]);

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-row items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <StickyNote className="w-6 h-6 text-brand-400" />
            Secure Notes
          </h1>
          <p className="text-sm text-surface-400 mt-1 hidden sm:block">Store your private text safely</p>
        </div>
        <div className="shrink-0 flex items-center">
          {/* Mobile Custom SVG Button */}
          <button
            onClick={handleAddNew}
            className="block sm:hidden hover:scale-105 active:scale-95 transition-transform outline-none"
            aria-label="Add Note"
          >
            <svg viewBox="0 0 64 64" className="w-[60px] h-[60px]" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="vault-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8B5CF6"/>
                  <stop offset="100%" stopColor="#3B82F6"/>
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feComponentTransfer in="blur" result="glow">
                    <feFuncA type="linear" slope="0.5"/>
                  </feComponentTransfer>
                  <feMerge>
                    <feMergeNode in="glow"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <circle cx="32" cy="32" r="24" fill="url(#vault-gradient)" filter="url(#glow)"/>
              <circle cx="32" cy="32" r="23" fill="none" stroke="white" strokeOpacity="0.4" strokeWidth="1.5"/>
              <path 
                d="M32 20 V44 M20 32 H44" 
                stroke="white" 
                strokeWidth="4" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </button>
          
          {/* Desktop Button */}
          <Button 
            onClick={handleAddNew} 
            className="!hidden sm:!flex px-4 py-2.5 rounded-xl shadow-xl shadow-brand-500/20 items-center justify-center"
          >
            <Plus size={16} strokeWidth={2} />
            <span className="ml-2">Add Note</span>
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex flex-col sm:flex-row items-center gap-4">
        <div className="w-full sm:flex-1 max-w-md">
          <Input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="w-full sm:w-auto">
          <div className="relative inline-block w-full sm:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full appearance-none bg-surface-900 border border-surface-700 text-surface-200 text-sm rounded-xl px-4 py-2.5 pr-8 hover:border-surface-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors cursor-pointer"
            >
              <option value="recent">Recently Added</option>
              <option value="a-z">Name (A-Z)</option>
              <option value="frequent">Most Used</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-surface-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 w-full skeleton" />
            ))}
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-danger-500/10 text-danger-400 text-center border border-danger-500/20">
            <p className="font-medium">Failed to load notes.</p>
            <p className="text-xs mt-1 text-danger-500 opacity-80">
              {error instanceof Error ? error.message : 'Please check your connection.'}
            </p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-16 h-16 rounded-full bg-surface-800 flex items-center justify-center mb-4">
              <StickyNote className="w-8 h-8 text-surface-500" />
            </div>
            <h3 className="text-lg font-medium text-white">No notes found</h3>
            <p className="text-sm text-surface-400 mt-1 max-w-sm">
              {searchQuery ? "We couldn't find any notes matching your search." : "You haven't added any notes yet. Create your first one to get started."}
            </p>
            {!searchQuery && (
              <Button onClick={handleAddNew} variant="secondary" className="mt-6">
                Add your first note
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap items-start gap-4">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="w-full sm:w-auto flex-auto sm:flex-initial"
              >
                <NoteItem
                  item={item}
                  onClick={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                  onUse={handleUse}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <NoteViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        item={selectedItem}
        onEditClick={handleEdit}
      />

      <NoteFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        item={selectedItem}
      />

      <ConfirmModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDelete}
        title="Move to Trash"
        message="Are you sure you want to move this note to the trash? You can restore it later from the trash bin."
        confirmText="Move to Trash"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
}
