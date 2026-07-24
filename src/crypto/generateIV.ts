// src/crypto/generateIV.ts
/**
 * Generates a cryptographically secure random Initialization Vector (IV/Nonce).
 * AES-GCM requires a 12-byte (96-bit) nonce. Each encryption must use a unique IV.
 * Uses Web Crypto API — never reuse IVs with the same key!
 * @param length IV length in bytes (default: 12 for AES-GCM)
 */
export function generateIV(length = 12): Uint8Array {
  const iv = new Uint8Array(length);
  crypto.getRandomValues(iv);
  return iv;
}

/**
 * Converts IV to base64 for storage alongside ciphertext.
 */
export function ivToBase64(iv: Uint8Array): string {
  return btoa(String.fromCharCode(...iv));
}

/**
 * Converts base64 back to IV Uint8Array for decryption.
 */
export function base64ToIV(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
