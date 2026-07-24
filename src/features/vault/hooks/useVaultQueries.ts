// src/features/vault/hooks/useVaultQueries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getVaultItemsByType,
  getAllVaultItems,
  getTrashedItems,
  getVaultItemById,
  createVaultItem,
  updateVaultItem,
  softDeleteVaultItem,
  hardDeleteVaultItem,
  restoreVaultItem,
  toggleFavorite
} from '@/services/vault.service';
import { useVaultStore } from '@/store/vault.store';
import { useAuthStore } from '@/store/auth.store';
import type { VaultItemType, CreateVaultItemInput, DecryptedVaultItem } from '@/types/vault.types';

export const queryKeys = {
  all: ['vault'] as const,
  lists: () => [...queryKeys.all, 'list'] as const,
  list: (type: VaultItemType) => [...queryKeys.lists(), { type }] as const,
  trashed: () => [...queryKeys.all, 'trashed'] as const,
  detail: (id: string) => [...queryKeys.all, 'detail', id] as const,
};

export function useVaultItems(type?: VaultItemType) {
  const { firebaseUser: user } = useAuthStore();
  const { cryptoKey } = useVaultStore();

  return useQuery({
    queryKey: type ? queryKeys.list(type) : queryKeys.lists(),
    queryFn: async () => {
      if (!user?.uid || !cryptoKey) throw new Error('Unauthorized or Vault locked');
      if (type) {
        return getVaultItemsByType(user.uid, cryptoKey, type);
      }
      return getAllVaultItems(user.uid, cryptoKey);
    },
    enabled: !!user?.uid && !!cryptoKey,
  });
}

export function useTrashedItems() {
  const { firebaseUser: user } = useAuthStore();
  const { cryptoKey } = useVaultStore();

  return useQuery({
    queryKey: queryKeys.trashed(),
    queryFn: async () => {
      if (!user?.uid || !cryptoKey) throw new Error('Unauthorized or Vault locked');
      return getTrashedItems(user.uid, cryptoKey);
    },
    enabled: !!user?.uid && !!cryptoKey,
  });
}

export function useVaultItem(id: string) {
  const { firebaseUser: user } = useAuthStore();
  const { cryptoKey } = useVaultStore();

  return useQuery({
    queryKey: queryKeys.detail(id),
    queryFn: async () => {
      if (!user?.uid || !cryptoKey) throw new Error('Unauthorized or Vault locked');
      return getVaultItemById(user.uid, cryptoKey, id);
    },
    enabled: !!user?.uid && !!cryptoKey && !!id,
  });
}

export function useCreateVaultItem() {
  const queryClient = useQueryClient();
  const { firebaseUser: user } = useAuthStore();
  const { cryptoKey } = useVaultStore();

  return useMutation({
    mutationFn: async ({ type, name, data, ...meta }: CreateVaultItemInput & { type: VaultItemType, name: string }) => {
      if (!user?.uid || !cryptoKey) throw new Error('Unauthorized or Vault locked');
      return createVaultItem(user.uid, cryptoKey, type, name, data, meta);
    },
    onSuccess: (newItem, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.list(variables.type) });
    },
  });
}

export function useUpdateVaultItem() {
  const queryClient = useQueryClient();
  const { firebaseUser: user } = useAuthStore();
  const { cryptoKey } = useVaultStore();

  return useMutation({
    mutationFn: async ({
      id,
      name,
      data,
      type,
      ...meta
    }: Omit<CreateVaultItemInput, 'type'> & { id: string, name: string, type: VaultItemType }) => {
      if (!user?.uid || !cryptoKey) throw new Error('Unauthorized or Vault locked');
      await updateVaultItem(user.uid, cryptoKey, id, name, data, meta);
      return id;
    },
    onSuccess: (id, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.list(variables.type) });
    },
  });
}

export function useDeleteVaultItem() {
  const queryClient = useQueryClient();
  const { firebaseUser: user } = useAuthStore();

  return useMutation({
    mutationFn: async ({ id, hard = false }: { id: string, hard?: boolean }) => {
      if (!user?.uid) throw new Error('Unauthorized');
      if (hard) {
        await hardDeleteVaultItem(user.uid, id);
      } else {
        await softDeleteVaultItem(user.uid, id);
      }
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
  });
}

export function useRestoreVaultItem() {
  const queryClient = useQueryClient();
  const { firebaseUser: user } = useAuthStore();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user?.uid) throw new Error('Unauthorized');
      await restoreVaultItem(user.uid, id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  const { firebaseUser: user } = useAuthStore();

  return useMutation({
    mutationFn: async ({ id, isFavorite }: { id: string, isFavorite: boolean }) => {
      if (!user?.uid) throw new Error('Unauthorized');
      await toggleFavorite(user.uid, id, isFavorite);
      return id;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
    },
  });
}
