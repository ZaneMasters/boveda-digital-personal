// src/crypto/generateSalt.ts
/**
 * Generates a cryptographically secure random salt.
 * Uses Web Crypto API (native browser) — no CryptoJS.
 * @param length Salt length in bytes (default: 32)
 */
export function generateSalt(length = 32): Uint8Array {
  const salt = new Uint8Array(length);
  crypto.getRandomValues(salt);
  return salt;
}

/**
 * Converts a Uint8Array to a base64 string for storage.
 */
export function saltToBase64(salt: Uint8Array): string {
  return btoa(String.fromCharCode(...salt));
}

/**
 * Converts a base64 string back to Uint8Array.
 */
export function base64ToSalt(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
