// src/services/vault.service.ts
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  type QueryConstraint,
} from 'firebase/firestore';
import { db } from '@/firebase/firestore';
import { encrypt, decrypt } from '@/crypto';
import type { VaultItem, VaultItemType, DecryptedVaultItem } from '@/types/vault.types';
import { nanoid } from 'nanoid';

// ─── Collection helpers ───────────────────────────────────────────────────────

function itemsCollection(uid: string) {
  return collection(db, 'vaults', uid, 'items');
}

function itemDoc(uid: string, itemId: string) {
  return doc(db, 'vaults', uid, 'items', itemId);
}

// ─── CRUD Operations ──────────────────────────────────────────────────────────

/** Create a new vault item. Encrypts data before saving. */
export async function createVaultItem<T>(
  uid: string,
  key: CryptoKey,
  type: VaultItemType,
  name: string,
  data: T,
  meta: Partial<Pick<VaultItem, 'isFavorite' | 'categoryId' | 'tags' | 'color' | 'icon'>> = {}
): Promise<VaultItem> {
  const id = nanoid();
  const encryptedData = await encrypt(data, key);

  const item: any = {
    id,
    userId: uid,
    type,
    name,
    isFavorite: meta.isFavorite ?? false,
    isDeleted: false,
    tags: meta.tags ?? [],
    encryptedData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    usageCount: 0,
  };

  if (meta.categoryId !== undefined) item.categoryId = meta.categoryId;
  if (meta.color !== undefined) item.color = meta.color;
  if (meta.icon !== undefined) item.icon = meta.icon;

  await setDoc(itemDoc(uid, id), item);
  return item as unknown as VaultItem;
}

/** Update an existing vault item. Re-encrypts data. */
export async function updateVaultItem<T>(
  uid: string,
  key: CryptoKey,
  itemId: string,
  name: string,
  data: T,
  meta: Partial<Pick<VaultItem, 'isFavorite' | 'categoryId' | 'tags' | 'color' | 'icon' | 'usageCount'>> = {}
): Promise<void> {
  const encryptedData = await encrypt(data, key);

  const updatePayload: any = {
    name,
    encryptedData,
    updatedAt: serverTimestamp(),
  };

  if (meta.isFavorite !== undefined) updatePayload.isFavorite = meta.isFavorite;
  if (meta.tags) updatePayload.tags = meta.tags;
  if (meta.color !== undefined) updatePayload.color = meta.color;
  if (meta.categoryId !== undefined) updatePayload.categoryId = meta.categoryId;
  if (meta.icon !== undefined) updatePayload.icon = meta.icon;
  if (meta.usageCount !== undefined) updatePayload.usageCount = meta.usageCount;

  await updateDoc(itemDoc(uid, itemId), updatePayload);
}

/** Soft delete (move to trash) */
export async function softDeleteVaultItem(uid: string, itemId: string): Promise<void> {
  await updateDoc(itemDoc(uid, itemId), {
    isDeleted: true,
    updatedAt: serverTimestamp(),
  });
}

/** Hard delete (permanent) */
export async function hardDeleteVaultItem(uid: string, itemId: string): Promise<void> {
  await deleteDoc(itemDoc(uid, itemId));
}

/** Restore from trash */
export async function restoreVaultItem(uid: string, itemId: string): Promise<void> {
  await updateDoc(itemDoc(uid, itemId), {
    isDeleted: false,
    updatedAt: serverTimestamp(),
  });
}

/** Toggle favorite */
export async function toggleFavorite(
  uid: string,
  itemId: string,
  isFavorite: boolean
): Promise<void> {
  await updateDoc(itemDoc(uid, itemId), { isFavorite, updatedAt: serverTimestamp() });
}

// ─── Queries ──────────────────────────────────────────────────────────────────

/** Fetch all non-deleted items of a specific type */
export async function getVaultItemsByType(
  uid: string,
  key: CryptoKey,
  type: VaultItemType
): Promise<DecryptedVaultItem[]> {
  const constraints: QueryConstraint[] = [
    where('type', '==', type),
    where('isDeleted', '==', false),
  ];

  const q = query(itemsCollection(uid), ...constraints);
  const snapshot = await getDocs(q);

  const items = await Promise.all(
    snapshot.docs.map(async (docSnap) => {
      const item = docSnap.data() as VaultItem;
      const data = await decrypt(item.encryptedData, key);
      const { encryptedData: _, ...rest } = item;
      return { ...rest, data } as DecryptedVaultItem;
    })
  );

  return items.sort((a, b) => b.updatedAt.toMillis() - a.updatedAt.toMillis());
}

/** Fetch all non-deleted items (for global search / dashboard) */
export async function getAllVaultItems(
  uid: string,
  key: CryptoKey
): Promise<DecryptedVaultItem[]> {
  const q = query(
    itemsCollection(uid),
    where('isDeleted', '==', false)
  );

  const snapshot = await getDocs(q);

  const items = await Promise.all(
    snapshot.docs.map(async (docSnap) => {
      const item = docSnap.data() as VaultItem;
      const data = await decrypt(item.encryptedData, key);
      const { encryptedData: _, ...rest } = item;
      return { ...rest, data } as DecryptedVaultItem;
    })
  );

  return items.sort((a, b) => b.updatedAt.toMillis() - a.updatedAt.toMillis());
}

/** Fetch trashed items */
export async function getTrashedItems(
  uid: string,
  key: CryptoKey
): Promise<DecryptedVaultItem[]> {
  const q = query(
    itemsCollection(uid),
    where('isDeleted', '==', true)
  );

  const snapshot = await getDocs(q);

  const items = await Promise.all(
    snapshot.docs.map(async (docSnap) => {
      const item = docSnap.data() as VaultItem;
      const data = await decrypt(item.encryptedData, key);
      const { encryptedData: _, ...rest } = item;
      return { ...rest, data } as DecryptedVaultItem;
    })
  );

  return items.sort((a, b) => b.updatedAt.toMillis() - a.updatedAt.toMillis());
}

/** Fetch a single item by id */
export async function getVaultItemById(
  uid: string,
  key: CryptoKey,
  itemId: string
): Promise<DecryptedVaultItem | null> {
  const snap = await getDoc(itemDoc(uid, itemId));
  if (!snap.exists()) return null;

  const item = snap.data() as VaultItem;
  const data = await decrypt(item.encryptedData, key);
  const { encryptedData: _, ...rest } = item;
  return { ...rest, data } as DecryptedVaultItem;
}
