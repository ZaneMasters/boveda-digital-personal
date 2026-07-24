// src/crypto/decrypt.ts
import type { EncryptedPayload } from '@/types/crypto.types';
import { base64ToIV } from './generateIV';

/**
 * Decrypts an EncryptedPayload using AES-256-GCM.
 *
 * Process:
 * 1. Decode base64 ciphertext to bytes
 * 2. Decode base64 IV
 * 3. Decrypt with AES-GCM using the derived CryptoKey
 * 4. Decode UTF-8 bytes to JSON string
 * 5. Parse and return typed data
 *
 * @param payload - EncryptedPayload from Firestore
 * @param key - The same AES-256-GCM CryptoKey used during encryption
 * @returns The original decrypted data, typed as T
 * @throws Error if key is wrong or data is tampered (AES-GCM provides authentication)
 */
export async function decrypt<T = unknown>(
  payload: EncryptedPayload,
  key: CryptoKey
): Promise<T> {
  // Decode ciphertext from base64
  const ciphertextBinary = atob(payload.ciphertext);
  const ciphertextBytes = new Uint8Array(ciphertextBinary.length);
  for (let i = 0; i < ciphertextBinary.length; i++) {
    ciphertextBytes[i] = ciphertextBinary.charCodeAt(i);
  }

  const iv = base64ToIV(payload.iv);

  let plaintextBuffer: ArrayBuffer;
  try {
    plaintextBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer },
      key,
      ciphertextBytes.buffer as ArrayBuffer
    );
  } catch {
    // AES-GCM will throw if the key is wrong or data is corrupted/tampered
    throw new Error('Decryption failed: invalid key or corrupted data');
  }

  const plaintext = new TextDecoder().decode(plaintextBuffer);
  return JSON.parse(plaintext) as T;
}
