// src/types/vault.types.ts
import type { Timestamp } from 'firebase/firestore';
import type { EncryptedPayload } from './crypto.types';

export type VaultItemType =
  | 'password'
  | 'note'
  | 'card'
  | 'bankaccount'
  | 'identity'
  | 'document'
  | 'attachment'
  | 'wifi'
  | 'license'
  | 'recovery_code'
  | 'developer';

export const VAULT_ITEM_LABELS: Record<VaultItemType, string> = {
  password: 'Password',
  note: 'Secure Note',
  card: 'Credit Card',
  bankaccount: 'Bank Account',
  identity: 'Identity',
  document: 'Document',
  attachment: 'Attachment',
  wifi: 'WiFi',
  license: 'License',
  recovery_code: 'Recovery Codes',
  developer: 'Developer Secret',
};

/** Base structure for every vault item stored in Firestore */
export interface VaultItem {
  id: string;
  userId: string;
  type: VaultItemType;

  // These fields are stored in clear text for UI listing (not sensitive)
  name: string;         // e.g. "Gmail", "Chase Visa"
  isFavorite: boolean;
  isDeleted: boolean;   // soft delete (trash)
  categoryId?: string;
  tags: string[];
  color?: string;       // hex color for visual organization
  icon?: string;        // emoji or icon name

  // ALL sensitive data lives here, encrypted
  encryptedData: EncryptedPayload;

  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastAccessedAt?: Timestamp;
}

/** A decrypted vault item with typed data */
export interface DecryptedVaultItem<T = unknown> extends Omit<VaultItem, 'encryptedData'> {
  data: T;
}

/** Firestore document input (for creating/updating) */
export type CreateVaultItemInput<T = unknown> = Omit<VaultItem, 'id' | 'createdAt' | 'updatedAt' | 'encryptedData'> & {
  data: T; // Will be encrypted before saving
};

// ─── Data Shapes (what lives inside encryptedData) ──────────────────────────

export interface PasswordData {
  username?: string;
  email?: string;
  password: string;
  website?: string;
  notes?: string;
  history?: PasswordHistoryEntry[];
}

export interface PasswordHistoryEntry {
  password: string;
  changedAt: string; // ISO string
}

export interface NoteData {
  content: string;
  isMarkdown: boolean;
}

export interface CardData {
  bank?: string;
  cardNumber: string;
  cvv: string;
  expiryDate: string;   // MM/YY
  cardHolder: string;
  alias?: string;
  notes?: string;
}

export interface BankAccountData {
  bank: string;
  accountType: string;  // 'checking' | 'savings' | 'business'
  accountNumber: string;
  holder: string;
  iban?: string;
  swift?: string;
  notes?: string;
}

export interface IdentityData {
  firstName: string;
  lastName: string;
  documentType?: string;
  documentNumber?: string;
  birthDate?: string;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  company?: string;
  jobTitle?: string;
}

export interface DocumentData {
  documentType: string; // passport, license, id, rut, contract, deed, warranty
  documentNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  issuingCountry?: string;
  notes?: string;
}

export interface AttachmentData {
  fileName: string;       // original filename (encrypted)
  mimeType: string;
  fileSize: number;       // bytes
  storageRef: string;     // Firebase Storage path (the file itself is encrypted)
  notes?: string;
}

export interface WifiData {
  ssid: string;
  password: string;
  location?: string;
  securityType?: string; // WPA2, WPA3, WEP, Open
}

export interface LicenseData {
  software: string;
  licenseKey: string;
  email?: string;
  purchaseDate?: string;
  expiryDate?: string;
  maxDevices?: number;
  notes?: string;
}

export interface RecoveryCodeData {
  service: string;    // google, microsoft, github...
  codes: string[];    // list of recovery codes
  notes?: string;
}

export interface DeveloperItemData {
  service: string;       // aws, openai, github, stripe...
  keyType: string;       // api_key, ssh_key, jwt, env, connection_string
  value: string;
  description?: string;
  environment?: string;  // dev, staging, prod
}
