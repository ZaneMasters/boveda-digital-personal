// src/crypto/passwordGenerator.ts

export interface PasswordGeneratorOptions {
  length: number;           // 8–128
  uppercase: boolean;       // A-Z
  lowercase: boolean;       // a-z
  numbers: boolean;         // 0-9
  symbols: boolean;         // !@#$%^&*...
  excludeAmbiguous: boolean; // Exclude: 0, O, l, 1, I
}

export interface PassphraseOptions {
  wordCount: number;        // 3–8
  separator: string;        // '-', '_', ' ', '.'
  capitalize: boolean;
  includeNumber: boolean;
}

const CHARSET = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  ambiguous: '0O1lI',
};

// EFF large wordlist (abbreviated — full list loaded from public/)
// For production, fetch /wordlist.json
const SAMPLE_WORDS = [
  'apple', 'brave', 'cloud', 'dance', 'earth', 'flame', 'grove', 'heart',
  'ivory', 'jewel', 'karma', 'lemon', 'maple', 'noble', 'ocean', 'pearl',
  'queen', 'river', 'stone', 'tiger', 'ultra', 'vivid', 'water', 'xenon',
  'yacht', 'zebra', 'amber', 'blaze', 'crisp', 'delta', 'eagle', 'frost',
  'glide', 'haven', 'indie', 'joker', 'knack', 'lunar', 'magic', 'nexus',
  'orbit', 'prism', 'quest', 'radar', 'solar', 'trick', 'umbra', 'valor',
  'whirl', 'exact', 'yield', 'zippy', 'atlas', 'boxer', 'cyber', 'droid',
];

/**
 * Generates a cryptographically secure random password.
 * Uses Web Crypto API for true randomness.
 */
export function generatePassword(options: PasswordGeneratorOptions): string {
  let charset = '';

  if (options.uppercase) charset += CHARSET.uppercase;
  if (options.lowercase) charset += CHARSET.lowercase;
  if (options.numbers) charset += CHARSET.numbers;
  if (options.symbols) charset += CHARSET.symbols;

  if (options.excludeAmbiguous) {
    for (const char of CHARSET.ambiguous) {
      charset = charset.replaceAll(char, '');
    }
  }

  if (charset.length === 0) {
    charset = CHARSET.lowercase; // fallback
  }

  // Ensure at least one character from each required set
  const required: string[] = [];
  const getSecureChar = (chars: string) => {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return chars[arr[0] % chars.length];
  };

  if (options.uppercase) required.push(getSecureChar(CHARSET.uppercase));
  if (options.lowercase) required.push(getSecureChar(CHARSET.lowercase));
  if (options.numbers) required.push(getSecureChar(CHARSET.numbers));
  if (options.symbols) required.push(getSecureChar(CHARSET.symbols));

  // Fill remaining length with random chars
  const remaining = options.length - required.length;
  const randomChars: string[] = [];
  const randomValues = new Uint32Array(Math.max(remaining, 0));
  crypto.getRandomValues(randomValues);

  for (let i = 0; i < Math.max(remaining, 0); i++) {
    randomChars.push(charset[randomValues[i] % charset.length]);
  }

  // Shuffle all characters together using Fisher-Yates with Web Crypto
  const allChars = [...required, ...randomChars];
  for (let i = allChars.length - 1; i > 0; i--) {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    const j = arr[0] % (i + 1);
    [allChars[i], allChars[j]] = [allChars[j], allChars[i]];
  }

  return allChars.join('').slice(0, options.length);
}

/**
 * Generates a cryptographically secure passphrase.
 * Based on EFF diceware wordlist concept.
 */
export function generatePassphrase(options: PassphraseOptions): string {
  const words: string[] = [];
  const randomValues = new Uint32Array(options.wordCount);
  crypto.getRandomValues(randomValues);

  for (let i = 0; i < options.wordCount; i++) {
    let word = SAMPLE_WORDS[randomValues[i] % SAMPLE_WORDS.length];
    if (options.capitalize) {
      word = word.charAt(0).toUpperCase() + word.slice(1);
    }
    words.push(word);
  }

  if (options.includeNumber) {
    const numArr = new Uint32Array(1);
    crypto.getRandomValues(numArr);
    const num = numArr[0] % 100;
    const posArr = new Uint32Array(1);
    crypto.getRandomValues(posArr);
    const pos = posArr[0] % words.length;
    words[pos] = words[pos] + String(num);
  }

  return words.join(options.separator);
}

export const DEFAULT_PASSWORD_OPTIONS: PasswordGeneratorOptions = {
  length: 20,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
  excludeAmbiguous: false,
};

export const DEFAULT_PASSPHRASE_OPTIONS: PassphraseOptions = {
  wordCount: 4,
  separator: '-',
  capitalize: true,
  includeNumber: true,
};
