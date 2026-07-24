// src/features/generator/pages/GeneratorPage.tsx
import { Zap } from 'lucide-react';

export function GeneratorPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.15)' }}>
          <Zap className="w-5 h-5 text-brand-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Password Generator</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Coming soon</p>
        </div>
      </div>
    </div>
  );
}
