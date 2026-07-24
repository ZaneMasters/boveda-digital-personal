// src/crypto/entropyCalculator.ts

export interface EntropyResult {
  bits: number;
  strength: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
  strengthLabel: string;
  strengthScore: number; // 0-100
  crackTime: string;
  color: string;
}

/**
 * Calculates the theoretical entropy of a password in bits.
 * Entropy = log2(charset_size ^ length) = length * log2(charset_size)
 *
 * Higher entropy = harder to brute force.
 * This is a mathematical estimate, not a full dictionary/pattern analysis.
 * For real-world strength, combine with zxcvbn.
 */
export function calculateEntropy(password: string): EntropyResult {
  if (!password || password.length === 0) {
    return {
      bits: 0,
      strength: 'very-weak',
      strengthLabel: 'Very Weak',
      strengthScore: 0,
      crackTime: 'Instant',
      color: '#ef4444',
    };
  }

  // Determine effective charset size
  let charsetSize = 0;
  if (/[a-z]/.test(password)) charsetSize += 26;
  if (/[A-Z]/.test(password)) charsetSize += 26;
  if (/[0-9]/.test(password)) charsetSize += 10;
  if (/[!@#$%^&*()\-_=+[\]{}|;:,.<>?/\\`~"']/.test(password)) charsetSize += 32;

  if (charsetSize === 0) charsetSize = 26; // fallback

  const bits = Math.round(password.length * Math.log2(charsetSize));

  // Map bits to strength tiers
  let strength: EntropyResult['strength'];
  let strengthLabel: string;
  let strengthScore: number;
  let color: string;

  if (bits < 28) {
    strength = 'very-weak'; strengthLabel = 'Very Weak'; strengthScore = 5; color = '#ef4444';
  } else if (bits < 36) {
    strength = 'weak'; strengthLabel = 'Weak'; strengthScore = 20; color = '#f97316';
  } else if (bits < 50) {
    strength = 'fair'; strengthLabel = 'Fair'; strengthScore = 40; color = '#eab308';
  } else if (bits < 65) {
    strength = 'good'; strengthLabel = 'Good'; strengthScore = 65; color = '#22c55e';
  } else if (bits < 80) {
    strength = 'strong'; strengthLabel = 'Strong'; strengthScore = 80; color = '#8b5cf6';
  } else {
    strength = 'very-strong'; strengthLabel = 'Very Strong'; strengthScore = 100; color = '#8b5cf6';
  }

  return {
    bits,
    strength,
    strengthLabel,
    strengthScore,
    crackTime: estimateCrackTime(bits),
    color,
  };
}

/**
 * Estimates how long it would take to brute-force a password
 * Assumes 10 billion guesses per second (modern GPU cluster).
 */
function estimateCrackTime(bits: number): string {
  const guessesPerSecond = 1e10; // 10 billion/sec
  const totalGuesses = Math.pow(2, bits);
  const seconds = totalGuesses / (2 * guessesPerSecond); // average = half the space

  if (seconds < 1) return 'Instantly';
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
  if (seconds < 2592000) return `${Math.round(seconds / 86400)} days`;
  if (seconds < 31536000) return `${Math.round(seconds / 2592000)} months`;
  if (seconds < 3153600000) return `${Math.round(seconds / 31536000)} years`;
  if (seconds < 3.154e13) return `${Math.round(seconds / 3.154e9)} millennia`;
  return 'Centuries';
}
