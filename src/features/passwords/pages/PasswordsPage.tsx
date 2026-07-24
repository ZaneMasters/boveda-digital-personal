// src/features/passwords/pages/PasswordsPage.tsx
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, KeyRound } from 'lucide-react';
import { useVaultItems, useDeleteVaultItem } from '@/features/vault/hooks/useVaultQueries';
import { PasswordItem } from '../components/PasswordItem';
import { PasswordFormModal } from '../components/PasswordFormModal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { DecryptedVaultItem, PasswordData } from '@/types/vault.types';

export function PasswordsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DecryptedVaultItem<PasswordData> | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: items, isLoading, error } = useVaultItems('password');
  const deleteMutation = useDeleteVaultItem();

  const handleEdit = (item: DecryptedVaultItem<PasswordData>) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setIsModalOpen(true);
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

  const filteredItems = useMemo(() => {
    if (!items) return [];
    const query = searchQuery.toLowerCase();
    return (items as DecryptedVaultItem<PasswordData>[]).filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.data.username?.toLowerCase().includes(query) ||
        item.data.email?.toLowerCase().includes(query) ||
        item.data.website?.toLowerCase().includes(query)
    );
  }, [items, searchQuery]);

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <KeyRound className="w-6 h-6 text-brand-400" />
            Passwords
          </h1>
          <p className="text-sm text-surface-400 mt-1">Manage your secure credentials</p>
        </div>
        <Button onClick={handleAddNew} className="w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          Add Password
        </Button>
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex items-center">
        <div className="w-full max-w-md">
          <Input
            type="text"
            placeholder="Search passwords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
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
            Failed to load passwords. Please check your connection.
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-16 h-16 rounded-full bg-surface-800 flex items-center justify-center mb-4">
              <KeyRound className="w-8 h-8 text-surface-500" />
            </div>
            <h3 className="text-lg font-medium text-white">No passwords found</h3>
            <p className="text-sm text-surface-400 mt-1 max-w-sm">
              {searchQuery ? "We couldn't find any passwords matching your search." : "You haven't added any passwords yet. Create your first one to get started."}
            </p>
            {!searchQuery && (
              <Button onClick={handleAddNew} variant="secondary" className="mt-6">
                Add your first password
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <PasswordItem
                  item={item}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <PasswordFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={editingItem}
      />

      <ConfirmModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDelete}
        title="Move to Trash"
        message="Are you sure you want to move this password to the trash? You can restore it later from the trash bin."
        confirmText="Move to Trash"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
}
