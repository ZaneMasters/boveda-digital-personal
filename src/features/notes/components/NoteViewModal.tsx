// src/features/notes/components/NoteViewModal.tsx
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { CopyButton } from '@/components/ui/CopyButton';
import type { DecryptedVaultItem, NoteData } from '@/types/vault.types';
import { Edit2 } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';

export interface NoteViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: DecryptedVaultItem<NoteData> | null;
  onEditClick: (item: DecryptedVaultItem<NoteData>) => void;
}

export function NoteViewModal({ isOpen, onClose, item, onEditClick }: NoteViewModalProps) {
  if (!item) return null;
  const { data } = item;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={item.name}
      maxWidth="lg"
    >
      <div className="space-y-6">
        
        {/* Note Content */}
        <div className="bg-surface-900 border border-surface-700/50 rounded-xl p-4 sm:p-5 max-h-[60vh] overflow-y-auto custom-scrollbar" data-color-mode="dark">
          {data.isMarkdown && data.content ? (
            <MDEditor.Markdown 
              source={data.content} 
              style={{ backgroundColor: 'transparent', color: 'var(--text-primary)' }} 
            />
          ) : (
            <pre className="text-sm text-surface-200 whitespace-pre-wrap font-sans leading-relaxed">
              {data.content || <span className="italic text-surface-500">Empty note</span>}
            </pre>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-surface-700/50">
          <div className="text-xs text-surface-500">
            Last updated: {item.updatedAt.toDate().toLocaleDateString()}
          </div>
          
          <div className="flex gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-surface-400">Copy</span>
              <CopyButton 
                value={data.content || ''} 
                title="Copy note" 
                className="bg-surface-800 hover:bg-surface-700" 
              />
            </div>
            <Button 
              type="button" 
              variant="brand" 
              onClick={() => {
                onClose();
                onEditClick(item);
              }}
              className="px-4"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
