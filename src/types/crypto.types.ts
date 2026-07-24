// src/types/crypto.types.ts
export interface EncryptedPayload {
  ciphertext: string; // base64 encoded
  iv: string;         // base64 encoded, 12 bytes (AES-GCM nonce)
  version: number;    // schema version for future migration
}

export interface CryptoConfig {
  saltLength: number;      // 32 bytes
  ivLength: number;        // 12 bytes
  keyLength: number;       // 256 bits
  argon2Time: number;      // iterations = 3
  argon2Memory: number;    // 65536 KB = 64MB
  argon2Parallelism: number; // 4
}

export const DEFAULT_CRYPTO_CONFIG: CryptoConfig = {
  saltLength: 32,
  ivLength: 12,
  keyLength: 256,
  argon2Time: 3,
  argon2Memory: 65536,
  argon2Parallelism: 4,
};
