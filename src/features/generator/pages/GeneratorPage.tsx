// src/features/generator/pages/GeneratorPage.tsx
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, RefreshCw, Copy, Check, Shield, Clock,
  KeyRound, AlignLeft, ChevronRight, Trash2
} from 'lucide-react';
import {
  generatePassword,
  generatePassphrase,
  type PasswordGeneratorOptions,
  type PassphraseOptions,
  DEFAULT_PASSWORD_OPTIONS,
  DEFAULT_PASSPHRASE_OPTIONS,
} from '@/crypto/passwordGenerator';
import { calculateEntropy } from '@/crypto/entropyCalculator';
import { useClipboard } from '@/hooks/useClipboard';
import { cn } from '@/components/ui/Button';

// ─── Types ────────────────────────────────────────────────────────────────────

type Mode = 'password' | 'passphrase';

interface HistoryEntry {
  id: string;
  value: string;
  mode: Mode;
  ts: number;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Toggle({
  checked, onChange, id,
}: { checked: boolean; onChange: (v: boolean) => void; id: string }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative w-10 h-5 rounded-full transition-colors duration-200 shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
        checked ? 'bg-brand-500' : 'bg-surface-700'
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200',
          checked ? 'translate-x-5' : 'translate-x-0'
        )}
      />
    </button>
  );
}

function StrengthMeter({ password }: { password: string }) {
  const entropy = password ? calculateEntropy(password) : null;
  if (!entropy) return null;

  const pct = Math.min(100, Math.max(4, (entropy.bits / 128) * 100));

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span style={{ color: 'var(--text-secondary)' }}>
          Strength:{' '}
          <span className="font-semibold" style={{ color: entropy.color }}>
            {entropy.strengthLabel}
          </span>
        </span>
        <span style={{ color: 'var(--text-muted)' }}>
          {entropy.bits} bits · cracks in {entropy.crackTime}
        </span>
      </div>
      <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: entropy.color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

function OptionRow({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3"
      style={{ borderBottom: '1px solid var(--border-subtle)' }}>
      <div className="min-w-0">
        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{label}</p>
        {sub && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function GeneratorPage() {
  const [mode, setMode] = useState<Mode>('password');
  const [generated, setGenerated] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Password options
  const [pwOpts, setPwOpts] = useState<PasswordGeneratorOptions>({
    ...DEFAULT_PASSWORD_OPTIONS,
    length: 20,
  });

  // Passphrase options
  const [ppOpts, setPpOpts] = useState<PassphraseOptions>(DEFAULT_PASSPHRASE_OPTIONS);

  const { copy, copiedId } = useClipboard();
  const hasCopied = copiedId === 'generated';

  // ─── Generate ──────────────────────────────────────────────────────────────

  const generate = useCallback(() => {
    try {
      const val =
        mode === 'password'
          ? generatePassword(pwOpts)
          : generatePassphrase(ppOpts);
      setGenerated(val);
    } catch {
      /* ignore if no charset selected */
    }
  }, [mode, pwOpts, ppOpts]);

  // Regenerate whenever options change
  useEffect(() => {
    generate();
  }, [generate]);

  const handleCopy = () => {
    if (!generated) return;
    copy(generated, 'generated');
    // Add to history
    setHistory(prev => [
      { id: crypto.randomUUID(), value: generated, mode, ts: Date.now() },
      ...prev.slice(0, 19),
    ]);
  };

  // ─── Helpers ───────────────────────────────────────────────────────────────

  const setPwOpt = <K extends keyof PasswordGeneratorOptions>(
    key: K,
    val: PasswordGeneratorOptions[K]
  ) => setPwOpts(o => ({ ...o, [key]: val }));

  const setPpOpt = <K extends keyof PassphraseOptions>(
    key: K,
    val: PassphraseOptions[K]
  ) => setPpOpts(o => ({ ...o, [key]: val }));

  const SEPARATORS = [
    { label: 'Hyphen  —', value: '-' },
    { label: 'Dot  .', value: '.' },
    { label: 'Underscore  _', value: '_' },
    { label: 'Space', value: ' ' },
    { label: 'None', value: '' },
  ];

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-2xl mx-auto">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(139,92,246,0.15)' }}>
          <Zap className="w-5 h-5 text-brand-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Password Generator
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Cryptographically secure · Web Crypto API
          </p>
        </div>
      </motion.div>

      {/* Mode tabs */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex p-1 rounded-xl gap-1"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
        {(['password', 'passphrase'] as const).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200',
              mode === m
                ? 'text-white shadow-md'
                : 'hover:text-white'
            )}
            style={mode === m
              ? { background: 'linear-gradient(135deg,#8b5cf6,#7c3aed)', color: 'white' }
              : { color: 'var(--text-muted)' }
            }
          >
            {m === 'password'
              ? <><KeyRound className="w-4 h-4" /> Password</>
              : <><AlignLeft className="w-4 h-4" /> Passphrase</>
            }
          </button>
        ))}
      </motion.div>

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="vault-item overflow-hidden"
      >
        {/* Generated output */}
        <div className="p-5 space-y-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          {/* Password display */}
          <div
            className="relative rounded-xl p-4 min-h-[72px] flex items-center"
            style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}
          >
            <p
              className="flex-1 font-mono text-lg text-center break-all leading-relaxed pr-2 select-all"
              style={{ color: 'var(--text-primary)', wordBreak: 'break-all' }}
            >
              {generated || '—'}
            </p>
          </div>

          {/* Strength meter */}
          {mode === 'password' && <StrengthMeter password={generated} />}
          {mode === 'passphrase' && generated && (
            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
              <Shield className="w-3.5 h-3.5 text-brand-400" />
              <span>{ppOpts.wordCount} words · entropy ≈ {Math.round(ppOpts.wordCount * Math.log2(7776))} bits</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={generate}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
              }}
            >
              <RefreshCw className="w-4 h-4" />
              Regenerate
            </button>
            <button
              onClick={handleCopy}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
                hasCopied
                  ? 'text-green-400'
                  : 'text-white'
              )}
              style={{
                background: hasCopied
                  ? 'rgba(34,197,94,0.15)'
                  : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                border: hasCopied ? '1px solid rgba(34,197,94,0.3)' : 'none',
              }}
            >
              {hasCopied
                ? <><Check className="w-4 h-4" /> Copied!</>
                : <><Copy className="w-4 h-4" /> Copy Password</>
              }
            </button>
          </div>
        </div>

        {/* Options */}
        <div className="px-5 pb-5">
          <AnimatePresence mode="wait">
            {mode === 'password' ? (
              <motion.div key="pw" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

                {/* Length slider */}
                <div className="py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Length</span>
                    <span className="text-sm font-bold tabular-nums px-2 py-0.5 rounded-md"
                      style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa' }}>
                      {pwOpts.length}
                    </span>
                  </div>
                  <input
                    type="range" min={8} max={64} value={pwOpts.length}
                    onChange={e => setPwOpt('length', Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{ accentColor: '#8b5cf6', background: 'var(--bg-tertiary)' }}
                  />
                  <div className="flex justify-between text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
                    <span>8</span><span>64</span>
                  </div>
                </div>

                {/* Character sets */}
                <OptionRow label="Uppercase" sub="A – Z">
                  <Toggle id="pw-upper" checked={pwOpts.uppercase} onChange={v => setPwOpt('uppercase', v)} />
                </OptionRow>
                <OptionRow label="Lowercase" sub="a – z">
                  <Toggle id="pw-lower" checked={pwOpts.lowercase} onChange={v => setPwOpt('lowercase', v)} />
                </OptionRow>
                <OptionRow label="Numbers" sub="0 – 9">
                  <Toggle id="pw-nums" checked={pwOpts.numbers} onChange={v => setPwOpt('numbers', v)} />
                </OptionRow>
                <OptionRow label="Symbols" sub="! @ # $ % ^ &amp; *">
                  <Toggle id="pw-syms" checked={pwOpts.symbols} onChange={v => setPwOpt('symbols', v)} />
                </OptionRow>
                <OptionRow label="Exclude Ambiguous" sub="Avoids 0, O, l, 1, I">
                  <Toggle id="pw-amb" checked={pwOpts.excludeAmbiguous} onChange={v => setPwOpt('excludeAmbiguous', v)} />
                </OptionRow>
              </motion.div>

            ) : (
              <motion.div key="pp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

                {/* Word count slider */}
                <div className="py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Word Count</span>
                    <span className="text-sm font-bold tabular-nums px-2 py-0.5 rounded-md"
                      style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa' }}>
                      {ppOpts.wordCount}
                    </span>
                  </div>
                  <input
                    type="range" min={3} max={8} value={ppOpts.wordCount}
                    onChange={e => setPpOpt('wordCount', Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{ accentColor: '#8b5cf6', background: 'var(--bg-tertiary)' }}
                  />
                  <div className="flex justify-between text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
                    <span>3</span><span>8</span>
                  </div>
                </div>

                {/* Separator */}
                <div className="py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Separator</p>
                  <div className="flex flex-wrap gap-2">
                    {SEPARATORS.map(s => (
                      <button
                        key={s.value}
                        onClick={() => setPpOpt('separator', s.value)}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                          ppOpts.separator === s.value ? 'text-white' : ''
                        )}
                        style={ppOpts.separator === s.value
                          ? { background: 'linear-gradient(135deg,#8b5cf6,#7c3aed)', color: 'white' }
                          : { background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }
                        }
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <OptionRow label="Capitalize Words" sub="First letter uppercase">
                  <Toggle id="pp-cap" checked={ppOpts.capitalize} onChange={v => setPpOpt('capitalize', v)} />
                </OptionRow>
                <OptionRow label="Include Number" sub="Appended to a random word">
                  <Toggle id="pp-num" checked={ppOpts.includeNumber} onChange={v => setPpOpt('includeNumber', v)} />
                </OptionRow>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* History */}
      {history.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <button
            onClick={() => setShowHistory(h => !h)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors"
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
            }}
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              History
              <span className="text-xs px-1.5 py-0.5 rounded-full"
                style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa' }}>
                {history.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={e => { e.stopPropagation(); setHistory([]); }}
                className="p-1 rounded-md hover:bg-surface-700 transition-colors"
                title="Clear history"
              >
                <Trash2 className="w-3.5 h-3.5 text-surface-500 hover:text-danger-400" />
              </button>
              <ChevronRight
                className="w-4 h-4 transition-transform duration-200"
                style={{ transform: showHistory ? 'rotate(90deg)' : 'rotate(0deg)' }}
              />
            </div>
          </button>

          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                style={{ overflow: 'hidden' }}
              >
                <div className="mt-2 space-y-2">
                  {history.map(entry => (
                    <HistoryRow key={entry.id} entry={entry} onCopy={copy} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

// ─── History row ─────────────────────────────────────────────────────────────

function HistoryRow({ entry, onCopy }: {
  entry: HistoryEntry;
  onCopy: (text: string, label?: string) => Promise<void>;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await onCopy(entry.value, entry.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const elapsed = Math.round((Date.now() - entry.ts) / 1000);
  const timeLabel = elapsed < 60
    ? `${elapsed}s ago`
    : elapsed < 3600
    ? `${Math.round(elapsed / 60)}m ago`
    : `${Math.round(elapsed / 3600)}h ago`;

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl group"
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
        style={{ background: entry.mode === 'password' ? 'rgba(139,92,246,0.12)' : 'rgba(6,182,212,0.12)' }}>
        {entry.mode === 'password'
          ? <KeyRound className="w-3.5 h-3.5 text-brand-400" />
          : <AlignLeft className="w-3.5 h-3.5 text-cyan-400" />
        }
      </div>
      <code
        className="flex-1 text-xs font-mono truncate"
        style={{ color: 'var(--text-secondary)' }}
      >
        {entry.value}
      </code>
      <span className="text-[10px] shrink-0" style={{ color: 'var(--text-muted)' }}>{timeLabel}</span>
      <button
        onClick={handleCopy}
        className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
        style={{ background: 'var(--bg-tertiary)' }}
        title="Copy"
      >
        {copied
          ? <Check className="w-3.5 h-3.5 text-green-400" />
          : <Copy className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
        }
      </button>
    </div>
  );
}
