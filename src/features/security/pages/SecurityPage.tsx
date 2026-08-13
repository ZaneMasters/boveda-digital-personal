// src/features/security/pages/SecurityPage.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, AlertTriangle, Copy, RefreshCw, ChevronDown,
  KeyRound, Clock, CheckCircle2, XCircle, Eye, EyeOff, ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSecurityScore, type PasswordAnalysis, type PasswordStrength } from '../hooks/useSecurityScore';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STRENGTH_META: Record<PasswordStrength, { label: string; color: string; bg: string }> = {
  critical:   { label: 'Critical',    color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  weak:       { label: 'Weak',        color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
  fair:       { label: 'Fair',        color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  strong:     { label: 'Strong',      color: '#84cc16', bg: 'rgba(132,204,22,0.12)' },
  very_strong:{ label: 'Very Strong', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
};

function ScoreRing({ score, color, grade }: { score: number; color: string; grade: string }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: 140, height: 140 }}>
      <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10" />
        {/* Progress */}
        <circle
          cx="70" cy="70" r={radius} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.2s ease' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-black" style={{ color }}>{score}</span>
        <span className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
          Grade {grade}
        </span>
      </div>
    </div>
  );
}

function StrengthBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-3 w-full">
      <div className="flex-1 h-1.5 rounded-full" style={{ background: 'var(--bg-tertiary)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <span className="text-xs font-semibold tabular-nums w-6 text-right" style={{ color }}>
        {value}
      </span>
    </div>
  );
}

function PasswordRow({ item, showPw }: { item: PasswordAnalysis; showPw: boolean }) {
  const meta = STRENGTH_META[item.strength];
  const displayUrl = item.website?.replace(/^https?:\/\//, '').split('/')[0] ?? '';
  const pw = showPw ? item.password : '•'.repeat(Math.min(item.password.length, 14));

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex flex-wrap items-center gap-3 p-3 rounded-xl"
      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}
    >
      {/* Icon */}
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: meta.bg }}>
        <KeyRound className="w-4 h-4" style={{ color: meta.color }} />
      </div>

      {/* Name + user */}
      <div className="flex-1 min-w-[120px]">
        <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{item.name}</p>
        <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{item.username || displayUrl || '—'}</p>
      </div>

      {/* Masked password */}
      <code className="text-xs font-mono px-2 py-1 rounded-md hidden sm:block"
        style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', maxWidth: 130, overflow: 'hidden', whiteSpace: 'nowrap' }}>
        {pw}
      </code>

      {/* Strength badge */}
      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
        style={{ background: meta.bg, color: meta.color }}>
        {meta.label}
      </span>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => copyToClipboard(item.password)}
          title="Copy password"
          className="p-1.5 rounded-lg transition-colors text-surface-500 hover:text-white hover:bg-surface-700"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
        {item.website && (
          <a
            href={item.website.startsWith('http') ? item.website : `https://${item.website}`}
            target="_blank" rel="noopener noreferrer"
            title="Open website"
            className="p-1.5 rounded-lg transition-colors text-surface-500 hover:text-white hover:bg-surface-700"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* Issues (collapsed on mobile) */}
      {item.issues.length > 0 && (
        <div className="w-full flex flex-wrap gap-1.5 pt-1">
          {item.issues.map(issue => (
            <span key={issue} className="text-[10px] px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171' }}>
              {issue}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

interface SectionProps {
  title: string;
  count: number;
  icon: React.ReactNode;
  color: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function CollapsibleSection({ title, count, icon, color, children, defaultOpen = false }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="vault-item overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: `${color}18` }}>
            <span style={{ color }}>{icon}</span>
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold tabular-nums px-2.5 py-0.5 rounded-full"
            style={{ background: `${color}18`, color }}>
            {count}
          </span>
          <ChevronDown
            className="w-4 h-4 transition-transform duration-200"
            style={{ color: 'var(--text-muted)', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-4 pb-4 space-y-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function SecurityPage() {
  const sec = useSecurityScore();
  const [showPasswords, setShowPasswords] = useState(false);

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  if (sec.isLoading) {
    return (
      <div className="p-6 space-y-4">
        {[1, 2, 3].map(i => <div key={i} className="h-24 skeleton rounded-2xl" />)}
      </div>
    );
  }

  const hasNoPasswords = sec.totalPasswords === 0;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(139,92,246,0.15)' }}>
          <Shield className="w-5 h-5 text-brand-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Security Center</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {hasNoPasswords ? 'Add passwords to get your score' : `Analyzing ${sec.totalPasswords} password${sec.totalPasswords !== 1 ? 's' : ''}`}
          </p>
        </div>
      </motion.div>

      {/* Score card + breakdown */}
      <motion.div
        variants={containerVariants} initial="hidden" animate="show"
        className="grid grid-cols-1 lg:grid-cols-5 gap-5"
      >
        {/* Score Ring */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 rounded-2xl p-6 flex flex-col items-center justify-center gap-4"
          style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(124,58,237,0.06))',
            border: '1px solid rgba(139,92,246,0.2)',
          }}
        >
          {hasNoPasswords ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <Shield className="w-14 h-14" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                No passwords yet
              </p>
              <Link
                to="/app/passwords"
                className="text-sm font-semibold text-brand-400 hover:text-brand-300 underline-offset-2 hover:underline"
              >
                Add your first password →
              </Link>
            </div>
          ) : (
            <>
              <ScoreRing score={sec.score} color={sec.color} grade={sec.grade} />
              <div className="text-center">
                <p className="text-lg font-bold" style={{ color: sec.color }}>{sec.label}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Overall security score</p>
              </div>
              <button
                onClick={() => setShowPasswords(p => !p)}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors"
                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
              >
                {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showPasswords ? 'Hide passwords' : 'Show passwords'}
              </button>
            </>
          )}
        </motion.div>

        {/* Breakdown */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-3 vault-item p-5 space-y-4"
        >
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Strength Breakdown</h2>

          <div className="space-y-3">
            {[
              { label: 'Very Strong', count: sec.veryStrongCount, color: '#22c55e' },
              { label: 'Strong',      count: sec.strongCount,     color: '#84cc16' },
              { label: 'Fair',        count: sec.fairCount,        color: '#f59e0b' },
              { label: 'Weak',        count: sec.weakCount,        color: '#f97316' },
              { label: 'Critical',    count: sec.criticalCount,    color: '#ef4444' },
            ].map(row => (
              <div key={row.label} className="flex items-center gap-3">
                <span className="text-xs w-20 shrink-0" style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                <StrengthBar value={row.count} max={sec.totalPasswords} color={row.color} />
              </div>
            ))}
          </div>

          <div className="pt-2 border-t grid grid-cols-3 gap-3" style={{ borderColor: 'var(--border-subtle)' }}>
            {[
              {
                label: 'Duplicates',
                value: sec.duplicateCount,
                icon: <RefreshCw className="w-3.5 h-3.5" />,
                color: sec.duplicateCount > 0 ? '#f97316' : '#22c55e',
              },
              {
                label: 'Outdated',
                value: sec.oldCount,
                icon: <Clock className="w-3.5 h-3.5" />,
                color: sec.oldCount > 0 ? '#f59e0b' : '#22c55e',
              },
              {
                label: 'At Risk',
                value: sec.criticalCount + sec.weakCount,
                icon: <AlertTriangle className="w-3.5 h-3.5" />,
                color: (sec.criticalCount + sec.weakCount) > 0 ? '#ef4444' : '#22c55e',
              },
            ].map(stat => (
              <div key={stat.label} className="flex flex-col items-center gap-1 p-3 rounded-xl"
                style={{ background: 'var(--bg-tertiary)' }}>
                <span style={{ color: stat.color }}>{stat.icon}</span>
                <span className="text-xl font-black" style={{ color: stat.color }}>{stat.value}</span>
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{stat.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Recommendations */}
      {!hasNoPasswords && (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-3">

          <motion.h2 variants={itemVariants} className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Issues to Fix
          </motion.h2>

          {/* All good */}
          {sec.criticalCount === 0 && sec.weakCount === 0 && sec.duplicateCount === 0 && sec.oldCount === 0 && (
            <motion.div variants={itemVariants}
              className="rounded-2xl p-5 flex items-center gap-4"
              style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <CheckCircle2 className="w-8 h-8 text-green-400 shrink-0" />
              <div>
                <p className="font-semibold text-green-400">All passwords are secure!</p>
                <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  No issues detected. Keep up the good work.
                </p>
              </div>
            </motion.div>
          )}

          {/* Critical */}
          {sec.criticalPasswords.length > 0 && (
            <motion.div variants={itemVariants}>
              <CollapsibleSection
                title="Critical Passwords"
                count={sec.criticalPasswords.length}
                icon={<XCircle className="w-4 h-4" />}
                color="#ef4444"
                defaultOpen
              >
                {sec.criticalPasswords.map(item => (
                  <PasswordRow key={item.id} item={item} showPw={showPasswords} />
                ))}
              </CollapsibleSection>
            </motion.div>
          )}

          {/* Weak */}
          {sec.weakPasswords.length > 0 && (
            <motion.div variants={itemVariants}>
              <CollapsibleSection
                title="Weak Passwords"
                count={sec.weakPasswords.length}
                icon={<AlertTriangle className="w-4 h-4" />}
                color="#f97316"
                defaultOpen={sec.criticalPasswords.length === 0}
              >
                {sec.weakPasswords.map(item => (
                  <PasswordRow key={item.id} item={item} showPw={showPasswords} />
                ))}
              </CollapsibleSection>
            </motion.div>
          )}

          {/* Duplicates */}
          {sec.duplicatePasswords.length > 0 && (
            <motion.div variants={itemVariants}>
              <CollapsibleSection
                title="Reused Passwords"
                count={sec.duplicatePasswords.length}
                icon={<RefreshCw className="w-4 h-4" />}
                color="#f59e0b"
              >
                {sec.duplicatePasswords.map(item => (
                  <PasswordRow key={item.id} item={item} showPw={showPasswords} />
                ))}
              </CollapsibleSection>
            </motion.div>
          )}

          {/* Old */}
          {sec.oldPasswords.length > 0 && (
            <motion.div variants={itemVariants}>
              <CollapsibleSection
                title="Outdated Passwords (90+ days)"
                count={sec.oldPasswords.length}
                icon={<Clock className="w-4 h-4" />}
                color="#64748b"
              >
                {sec.oldPasswords.map(item => (
                  <div key={item.id} className="flex flex-wrap items-center gap-3 p-3 rounded-xl"
                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(100,116,139,0.12)' }}>
                      <Clock className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-[120px]">
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{item.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Last updated {item.daysSinceUpdate} days ago
                      </p>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(100,116,139,0.15)', color: '#94a3b8' }}>
                      {STRENGTH_META[item.strength].label}
                    </span>
                  </div>
                ))}
              </CollapsibleSection>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* All Passwords table */}
      {!hasNoPasswords && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <CollapsibleSection
            title="All Passwords"
            count={sec.totalPasswords}
            icon={<KeyRound className="w-4 h-4" />}
            color="#8b5cf6"
          >
            <div className="space-y-2">
              {sec.allAnalyzed.map(item => (
                <PasswordRow key={item.id} item={item} showPw={showPasswords} />
              ))}
            </div>
          </CollapsibleSection>
        </motion.div>
      )}
    </div>
  );
}
