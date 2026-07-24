// src/crypto/encrypt.ts
import type { EncryptedPayload } from '@/types/crypto.types';
import { generateIV, ivToBase64 } from './generateIV';

const CURRENT_VERSION = 1;

/**
 * Encrypts any serializable data using AES-256-GCM.
 *
 * Process:
 * 1. Serialize data to JSON string
 * 2. Encode as UTF-8 bytes
 * 3. Generate a fresh random IV (12 bytes)
 * 4. Encrypt with AES-GCM using the derived CryptoKey
 * 5. Return base64-encoded { ciphertext, iv, version }
 *
 * @param data - Any JSON-serializable data (password, note, card, etc.)
 * @param key - AES-256-GCM CryptoKey derived from Master Password
 * @returns EncryptedPayload ready to store in Firestore
 */
export async function encrypt(
  data: unknown,
  key: CryptoKey
): Promise<EncryptedPayload> {
  const plaintext = JSON.stringify(data);
  const encoded = new TextEncoder().encode(plaintext);
  const iv = generateIV();

  const ciphertextBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer },
    key,
    encoded.buffer as ArrayBuffer
  );

  // Convert ArrayBuffer to base64
  const ciphertextBytes = new Uint8Array(ciphertextBuffer);
  const ciphertext = btoa(String.fromCharCode(...ciphertextBytes));

  return {
    ciphertext,
    iv: ivToBase64(iv),
    version: CURRENT_VERSION,
  };
}
