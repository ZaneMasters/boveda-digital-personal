// src/features/notes/components/NoteFormModal.tsx
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Button } from '@/components/ui/Button';
import { useCreateVaultItem, useUpdateVaultItem } from '@/features/vault/hooks/useVaultQueries';
import type { DecryptedVaultItem, NoteData } from '@/types/vault.types';
import { AlignLeft, AlertCircle } from 'lucide-react';

const noteSchema = z.object({
  name: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Note content cannot be empty'),
  isMarkdown: z.boolean(),
});

type NoteFormValues = z.infer<typeof noteSchema>;

export interface NoteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: DecryptedVaultItem<NoteData> | null;
}

export function NoteFormModal({ isOpen, onClose, item }: NoteFormModalProps) {
  const [error, setError] = useState<string | null>(null);

  const createMutation = useCreateVaultItem();
  const updateMutation = useUpdateVaultItem();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NoteFormValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      name: '',
      content: '',
      isMarkdown: false,
    },
  });

  // Load item data when editing
  useEffect(() => {
    if (item) {
      reset({
        name: item.name,
        content: item.data.content,
        isMarkdown: item.data.isMarkdown,
      });
    } else {
      reset({ name: '', content: '', isMarkdown: false });
    }
    setError(null);
  }, [item, isOpen, reset]);

  const onSubmit = async (values: NoteFormValues) => {
    setError(null);
    try {
      const data: NoteData = {
        content: values.content,
        isMarkdown: values.isMarkdown,
      };

      if (item) {
        await updateMutation.mutateAsync({
          id: item.id,
          type: 'note',
          name: values.name,
          data,
        });
      } else {
        await createMutation.mutateAsync({
          type: 'note',
          name: values.name,
          data,
        });
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save note');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={item ? 'Edit Secure Note' : 'Add Secure Note'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-danger-500/10 text-danger-400 text-sm border border-danger-500/20">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Note Title</Label>
            <Input id="name" placeholder="e.g. WiFi Passwords, Recovery Codes..." {...register('name')} error={errors.name?.message} />
          </div>

          <div className="space-y-1.5 flex-1 flex flex-col">
            <Label htmlFor="content">Secure Content</Label>
            <div className="relative flex-1">
              <div className="absolute left-3.5 top-3 text-surface-500 pointer-events-none">
                <AlignLeft className="w-4 h-4" />
              </div>
              <textarea
                id="content"
                rows={10}
                className="input-base pl-10 py-2.5 resize-none w-full"
                placeholder="Type your secure note here..."
                {...register('content')}
              />
            </div>
            {errors.content?.message && (
              <p className="text-xs text-danger-400 mt-1">{errors.content.message}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="isMarkdown" 
              className="rounded border-surface-600 bg-surface-800 text-brand-500 focus:ring-brand-500"
              {...register('isMarkdown')} 
            />
            <Label htmlFor="isMarkdown" className="mb-0 text-sm font-normal text-surface-300">
              Format as Markdown
            </Label>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-surface-700/50">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="brand" isLoading={isPending}>
            {item ? 'Save Changes' : 'Add Note'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
