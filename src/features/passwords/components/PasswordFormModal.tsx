// src/features/passwords/components/PasswordFormModal.tsx
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Button } from '@/components/ui/Button';
import { PasswordGenerator } from './PasswordGenerator';
import { useCreateVaultItem, useUpdateVaultItem } from '@/features/vault/hooks/useVaultQueries';
import type { DecryptedVaultItem, PasswordData } from '@/types/vault.types';
import { Globe, User, Lock, AlignLeft, Shield, AlertCircle } from 'lucide-react';

const passwordSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  username: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  password: z.string().min(1, 'Password is required'),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  notes: z.string().optional(),
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export interface PasswordFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: DecryptedVaultItem<PasswordData> | null;
}

export function PasswordFormModal({ isOpen, onClose, item }: PasswordFormModalProps) {
  const [showGenerator, setShowGenerator] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createMutation = useCreateVaultItem();
  const updateMutation = useUpdateVaultItem();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      password: '',
      website: '',
      notes: '',
    },
  });

  // Load item data when editing
  useEffect(() => {
    if (item) {
      reset({
        name: item.name,
        username: item.data.username || '',
        email: item.data.email || '',
        password: item.data.password,
        website: item.data.website || '',
        notes: item.data.notes || '',
      });
    } else {
      reset({ name: '', username: '', email: '', password: '', website: '', notes: '' });
    }
    setShowGenerator(false);
    setError(null);
  }, [item, isOpen, reset]);

  const onSubmit = async (values: PasswordFormValues) => {
    setError(null);
    try {
      const data: PasswordData = {
        username: values.username || undefined,
        email: values.email || undefined,
        password: values.password,
        website: values.website || undefined,
        notes: values.notes || undefined,
      };

      if (item) {
        await updateMutation.mutateAsync({
          id: item.id,
          type: 'password',
          name: values.name,
          data,
        });
      } else {
        await createMutation.mutateAsync({
          type: 'password',
          name: values.name,
          data,
        });
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save password');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={item ? 'Edit Password' : 'Add Password'}
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
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="e.g. Google, GitHub, Bank" {...register('name')} error={errors.name?.message} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input id="username" icon={<User className="w-4 h-4" />} placeholder="johndoe" {...register('username')} error={errors.username?.message} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" icon={<User className="w-4 h-4" />} placeholder="john@example.com" {...register('email')} error={errors.email?.message} />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Password</Label>
              <button
                type="button"
                onClick={() => setShowGenerator(!showGenerator)}
                className="text-xs font-medium text-brand-400 hover:text-brand-300 flex items-center gap-1"
              >
                <Shield className="w-3 h-3" />
                {showGenerator ? 'Hide Generator' : 'Generate'}
              </button>
            </div>
            
            {!showGenerator ? (
              <Input 
                id="password" 
                type="text" // Always show text in edit mode for ease, or use a toggle. Text is fine inside an authenticated vault.
                icon={<Lock className="w-4 h-4" />} 
                placeholder="••••••••" 
                {...register('password')} 
                error={errors.password?.message} 
              />
            ) : (
              <div className="mt-2">
                <PasswordGenerator 
                  onApply={(pwd) => {
                    setValue('password', pwd, { shouldValidate: true, shouldDirty: true });
                    setShowGenerator(false);
                  }} 
                />
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="website">Website URL</Label>
            <Input id="website" type="url" icon={<Globe className="w-4 h-4" />} placeholder="https://example.com" {...register('website')} error={errors.website?.message} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <div className="relative">
              <div className="absolute left-3.5 top-3 text-surface-500">
                <AlignLeft className="w-4 h-4" />
              </div>
              <textarea
                id="notes"
                rows={3}
                className="input-base pl-10 py-2.5 resize-none"
                placeholder="Secure notes..."
                {...register('notes')}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-surface-700/50">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="brand" isLoading={isPending}>
            {item ? 'Save Changes' : 'Add Password'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
