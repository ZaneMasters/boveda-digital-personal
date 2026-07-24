// src/crypto/deriveKey.ts
/**
 * Derives an AES-256-GCM CryptoKey from a Master Password using PBKDF2.
 *
 * NOTE ON SECURITY ROADMAP:
 * Currently using PBKDF2-SHA256 (600,000 iterations) which is the NIST recommended
 * minimum for 2024 and is supported natively by Web Crypto API with zero dependencies.
 *
 * Phase 2 upgrade path: Replace with Argon2id via a Web Worker + WASM bundle to get
 * memory-hard protection. The deriveKey() API stays identical — only the KDF changes.
 *
 * PBKDF2 with 600k iterations on modern hardware takes ~300ms — acceptable for UX
 * and meaningfully resistant to offline brute-force attacks.
 *
 * Security properties:
 * - PBKDF2-SHA256, 600,000 iterations (NIST SP 800-132 recommendation)
 * - The resulting CryptoKey is non-extractable (cannot be read from JS memory)
 * - The Master Password is NEVER stored — only the derived key lives in memory
 * - Random 32-byte salt per user prevents rainbow table attacks
 *
 * @param masterPassword - The user's master password (plain text, never stored)
 * @param salt - A unique random salt per user (stored in Firestore, not secret)
 * @returns A non-extractable AES-256-GCM CryptoKey
 */
export async function deriveKey(
  masterPassword: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBytes = encoder.encode(masterPassword);

  // Import the password as a raw key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBytes,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  // Derive an AES-256-GCM key using PBKDF2-SHA256
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt.buffer as ArrayBuffer,
      iterations: 600_000,   // NIST recommendation for SHA-256 in 2024
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,   // non-extractable
    ['encrypt', 'decrypt']
  );
}
