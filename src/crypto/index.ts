// src/crypto/index.ts
/**
 * VaultOne Crypto Module
 *
 * Public API for all cryptographic operations.
 * This module is completely decoupled from UI, Firebase, and business logic.
 *
 * Security guarantees:
 * - AES-256-GCM: authenticated encryption (tampering detection built-in)
 * - Argon2id: memory-hard KDF, resistant to GPU/ASIC attacks
 * - Web Crypto API only: no CryptoJS, no third-party crypto except argon2-browser WASM
 * - Non-extractable keys: derived CryptoKey cannot be read from memory via JS
 * - Random IV per operation: prevents ciphertext pattern analysis
 */

export { deriveKey } from './deriveKey';
export { encrypt } from './encrypt';
export { decrypt } from './decrypt';
export { generateSalt, saltToBase64, base64ToSalt } from './generateSalt';
export { generateIV, ivToBase64, base64ToIV } from './generateIV';
export {
  generatePassword,
  generatePassphrase,
  DEFAULT_PASSWORD_OPTIONS,
  DEFAULT_PASSPHRASE_OPTIONS,
} from './passwordGenerator';
export type { PasswordGeneratorOptions, PassphraseOptions } from './passwordGenerator';
export { calculateEntropy } from './entropyCalculator';
export type { EntropyResult } from './entropyCalculator';
