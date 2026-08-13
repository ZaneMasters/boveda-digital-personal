// src/features/security/hooks/useSecurityScore.ts
import { useMemo } from 'react';
import { useVaultItems } from '@/features/vault/hooks/useVaultQueries';
import type { DecryptedVaultItem, PasswordData } from '@/types/vault.types';

// ─── Password Strength ───────────────────────────────────────────────────────

export type PasswordStrength = 'critical' | 'weak' | 'fair' | 'strong' | 'very_strong';

export interface PasswordAnalysis {
  id: string;
  name: string;
  password: string;
  username: string;
  website?: string;
  strength: PasswordStrength;
  score: number; // 0–100
  issues: string[];
  updatedAt: Date;
  daysSinceUpdate: number;
}

function evaluatePassword(password: string): { strength: PasswordStrength; score: number; issues: string[] } {
  const issues: string[] = [];
  let score = 0;

  if (!password) return { strength: 'critical', score: 0, issues: ['No password set'] };

  // Length scoring
  if (password.length >= 20) score += 30;
  else if (password.length >= 16) score += 22;
  else if (password.length >= 12) score += 14;
  else if (password.length >= 8) score += 6;
  else { score += 2; issues.push('Too short (min 8 characters)'); }

  // Character variety
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);

  if (hasLower) score += 10;
  if (hasUpper) score += 10;
  else issues.push('No uppercase letters');
  if (hasDigit) score += 15;
  else issues.push('No numbers');
  if (hasSymbol) score += 20;
  else issues.push('No special characters');

  // Entropy bonus (unique characters)
  const unique = new Set(password).size;
  score += Math.min(15, Math.floor((unique / password.length) * 15));

  // Penalty: common patterns
  if (/(.)\1{2,}/.test(password)) { score -= 10; issues.push('Repeated characters'); }
  if (/^[a-zA-Z]+\d+$/.test(password)) { score -= 8; issues.push('Predictable pattern (letters + numbers)'); }
  if (/^(123|abc|qwerty|password|pass|admin|login)/i.test(password)) {
    score -= 20; issues.push('Starts with a common word');
  }

  score = Math.max(0, Math.min(100, score));

  let strength: PasswordStrength;
  if (score < 20) strength = 'critical';
  else if (score < 40) strength = 'weak';
  else if (score < 65) strength = 'fair';
  else if (score < 85) strength = 'strong';
  else strength = 'very_strong';

  return { strength, score, issues };
}

// ─── Main Hook ───────────────────────────────────────────────────────────────

export interface SecurityScoreResult {
  score: number;           // 0–100 overall
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  label: string;           // "Excellent" | "Good" | etc.
  color: string;           // CSS color

  totalPasswords: number;
  criticalCount: number;
  weakCount: number;
  fairCount: number;
  strongCount: number;
  veryStrongCount: number;
  duplicateCount: number;
  oldCount: number;        // passwords not updated in 90+ days

  criticalPasswords: PasswordAnalysis[];
  weakPasswords: PasswordAnalysis[];
  duplicatePasswords: PasswordAnalysis[];
  oldPasswords: PasswordAnalysis[];
  allAnalyzed: PasswordAnalysis[];

  isLoading: boolean;
}

const OLD_THRESHOLD_DAYS = 90;

export function useSecurityScore(): SecurityScoreResult {
  const { data: items = [], isLoading } = useVaultItems('password');

  return useMemo(() => {
    const passwords = items as DecryptedVaultItem<PasswordData>[];
    const now = Date.now();

    if (passwords.length === 0) {
      return {
        score: 0, grade: 'F', label: 'No passwords', color: '#6b7280',
        totalPasswords: 0, criticalCount: 0, weakCount: 0, fairCount: 0,
        strongCount: 0, veryStrongCount: 0, duplicateCount: 0, oldCount: 0,
        criticalPasswords: [], weakPasswords: [], duplicatePasswords: [], oldPasswords: [],
        allAnalyzed: [],
        isLoading,
      };
    }

    // Analyze every password
    const analyzed: PasswordAnalysis[] = passwords.map(item => {
      const pw = item.data.password ?? '';
      const { strength, score, issues } = evaluatePassword(pw);
      const updatedAt = item.updatedAt?.toDate ? item.updatedAt.toDate() : new Date(item.updatedAt as unknown as string);
      const daysSinceUpdate = Math.floor((now - updatedAt.getTime()) / 86400000);
      return {
        id: item.id,
        name: item.name,
        password: pw,
        username: item.data.username || item.data.email || '',
        website: item.data.website,
        strength,
        score,
        issues,
        updatedAt,
        daysSinceUpdate,
      };
    });

    // Detect duplicates
    const pwMap = new Map<string, PasswordAnalysis[]>();
    for (const a of analyzed) {
      const key = a.password.toLowerCase();
      if (!pwMap.has(key)) pwMap.set(key, []);
      pwMap.get(key)!.push(a);
    }
    const duplicateIds = new Set<string>();
    for (const group of pwMap.values()) {
      if (group.length > 1) group.forEach(a => duplicateIds.add(a.id));
    }

    // Old passwords
    const oldPasswords = analyzed.filter(a => a.daysSinceUpdate >= OLD_THRESHOLD_DAYS);
    const duplicatePasswords = analyzed.filter(a => duplicateIds.has(a.id));
    const criticalPasswords = analyzed.filter(a => a.strength === 'critical');
    const weakPasswords = analyzed.filter(a => a.strength === 'weak');

    // ─── Score Calculation ───────────────────────────────────────────────
    // Base: average strength score of all passwords (0–100) → 60% weight
    const avgStrength = analyzed.reduce((sum, a) => sum + a.score, 0) / analyzed.length;
    let totalScore = avgStrength * 0.6;

    // Penalty: duplicates (−5 pts each, capped at −30)
    const dupPenalty = Math.min(30, duplicatePasswords.length * 5);
    totalScore -= dupPenalty;

    // Penalty: old passwords (−3 pts each, capped at −20)
    const oldPenalty = Math.min(20, oldPasswords.length * 3);
    totalScore -= oldPenalty;

    // Bonus: coverage (+10 if > 5 passwords in vault)
    if (passwords.length >= 5) totalScore += 10;
    if (passwords.length >= 10) totalScore += 5;

    // Bonus: no critical (+15)
    if (criticalPasswords.length === 0) totalScore += 15;
    // Bonus: no weak (+10)
    if (weakPasswords.length === 0) totalScore += 10;

    const score = Math.round(Math.max(0, Math.min(100, totalScore)));

    let grade: 'A' | 'B' | 'C' | 'D' | 'F';
    let label: string;
    let color: string;
    if (score >= 85) { grade = 'A'; label = 'Excellent'; color = '#22c55e'; }
    else if (score >= 70) { grade = 'B'; label = 'Good'; color = '#84cc16'; }
    else if (score >= 50) { grade = 'C'; label = 'Fair'; color = '#f59e0b'; }
    else if (score >= 30) { grade = 'D'; label = 'Needs Work'; color = '#f97316'; }
    else { grade = 'F'; label = 'Critical'; color = '#ef4444'; }

    return {
      score,
      grade,
      label,
      color,
      totalPasswords: passwords.length,
      criticalCount: criticalPasswords.length,
      weakCount: weakPasswords.length,
      fairCount: analyzed.filter(a => a.strength === 'fair').length,
      strongCount: analyzed.filter(a => a.strength === 'strong').length,
      veryStrongCount: analyzed.filter(a => a.strength === 'very_strong').length,
      duplicateCount: duplicatePasswords.length,
      oldCount: oldPasswords.length,
      criticalPasswords,
      weakPasswords,
      duplicatePasswords,
      oldPasswords,
      allAnalyzed: analyzed.sort((a, b) => a.score - b.score),
      isLoading,
    };
  }, [items, isLoading]);
}
