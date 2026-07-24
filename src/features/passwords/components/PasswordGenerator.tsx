// src/features/passwords/components/PasswordGenerator.tsx
import { useState, useEffect } from 'react';
import { generatePassword } from '@/crypto/passwordGenerator';
import { calculateEntropy } from '@/crypto/entropyCalculator';
import { RefreshCw, Copy, Check } from 'lucide-react';
import { useClipboard } from '@/hooks/useClipboard';
import { cn } from '@/components/ui/Button';

export interface PasswordGeneratorProps {
  onApply?: (password: string) => void;
  initialLength?: number;
}

export function PasswordGenerator({ onApply, initialLength = 16 }: PasswordGeneratorProps) {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(initialLength);
  const [useUppercase, setUseUppercase] = useState(true);
  const [useLowercase, setUseLowercase] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  
  const { copy, copiedId } = useClipboard();
  const hasCopied = copiedId === password;

  const handleGenerate = () => {
    try {
      const pwd = generatePassword({
        length,
        uppercase: useUppercase,
        lowercase: useLowercase,
        numbers: useNumbers,
        symbols: useSymbols,
      });
      setPassword(pwd);
    } catch (e) {
      // If no character sets selected, default to lowercase
      if (!useUppercase && !useLowercase && !useNumbers && !useSymbols) {
        setUseLowercase(true);
      }
    }
  };

  // Generate on initial render and when options change
  useEffect(() => {
    handleGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [length, useUppercase, useLowercase, useNumbers, useSymbols]);

  const entropy = password ? calculateEntropy(password) : { bits: 0, strength: 'Weak', crackTimeDisplay: 'Instant' };
  
  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'Very Weak': return 'bg-danger-500';
      case 'Weak': return 'bg-warning-500';
      case 'Reasonable': return 'bg-success-400';
      case 'Strong': return 'bg-success-500';
      case 'Very Strong': return 'bg-success-600';
      default: return 'bg-surface-600';
    }
  };

  const strengthColor = getStrengthColor(entropy.strength);

  return (
    <div className="space-y-5 p-4 rounded-xl bg-surface-900 border border-surface-700">
      
      {/* Password Display */}
      <div className="relative group">
        <div className="p-4 rounded-lg bg-surface-950 font-mono text-center text-lg text-white break-all tracking-wider border border-surface-800">
          {password}
        </div>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={handleGenerate}
            className="p-2 rounded-md hover:bg-surface-800 text-surface-400 hover:text-white transition-colors"
            title="Regenerate"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => copy(password)}
            className={cn(
              "p-2 rounded-md transition-colors",
              hasCopied ? "bg-success-500/20 text-success-400" : "hover:bg-surface-800 text-surface-400 hover:text-white"
            )}
            title="Copy"
          >
            {hasCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Strength Meter */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs">
          <span className="text-surface-400">Strength: <span className="font-medium text-white">{entropy.strength}</span></span>
          <span className="text-surface-500">~{entropy.crackTimeDisplay} to crack</span>
        </div>
        <div className="h-1.5 w-full bg-surface-800 rounded-full overflow-hidden">
          <div 
            className={cn("h-full transition-all duration-300", strengthColor)}
            style={{ 
              width: `${Math.min(100, Math.max(5, (entropy.bits / 128) * 100))}%` 
            }}
          />
        </div>
      </div>

      {/* Length Slider */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-surface-300">Length</label>
          <span className="text-sm font-mono text-brand-400">{length}</span>
        </div>
        <input
          type="range"
          min="8"
          max="64"
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
          className="w-full accent-brand-500 h-1.5 bg-surface-800 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { id: 'uppercase', label: 'A-Z', checked: useUppercase, set: setUseUppercase },
          { id: 'lowercase', label: 'a-z', checked: useLowercase, set: setUseLowercase },
          { id: 'numbers', label: '0-9', checked: useNumbers, set: setUseNumbers },
          { id: 'symbols', label: '!@#', checked: useSymbols, set: setUseSymbols },
        ].map((opt) => (
          <label key={opt.id} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-surface-800 border border-transparent hover:border-surface-700 transition-colors">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                checked={opt.checked}
                onChange={(e) => opt.set(e.target.checked)}
                className="peer sr-only"
              />
              <div className="w-4 h-4 rounded border border-surface-600 bg-surface-900 peer-checked:bg-brand-500 peer-checked:border-brand-500 flex items-center justify-center transition-colors">
                <Check className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" />
              </div>
            </div>
            <span className="text-sm font-medium text-surface-300 select-none">{opt.label}</span>
          </label>
        ))}
      </div>

      {/* Apply Button */}
      {onApply && (
        <button
          type="button"
          onClick={() => onApply(password)}
          className="w-full btn-secondary mt-2"
        >
          Use Password
        </button>
      )}
    </div>
  );
}
