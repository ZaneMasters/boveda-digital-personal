import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
  isLoading = false,
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="flex flex-col items-center text-center pt-2 pb-4">
        {isDestructive && (
          <div className="w-12 h-12 rounded-full bg-danger-500/10 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-danger-400" />
          </div>
        )}
        <p className="text-surface-300 text-sm leading-relaxed">{message}</p>
      </div>
      
      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-surface-700/50">
        <Button
          variant="secondary"
          onClick={onClose}
          disabled={isLoading}
          className="flex-1"
        >
          {cancelText}
        </Button>
        <Button
          variant={isDestructive ? 'danger' : 'primary'}
          onClick={onConfirm}
          disabled={isLoading}
          className="flex-1"
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
}
