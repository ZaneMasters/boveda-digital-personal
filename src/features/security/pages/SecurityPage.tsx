// src/features/security/pages/SecurityPage.tsx
import { Shield } from 'lucide-react';

export function SecurityPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(139,92,246,0.15)' }}>
          <Shield className="w-5 h-5 text-brand-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Security Center</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Coming soon — being built in the next phase</p>
        </div>
      </div>
      <div className="vault-item p-12 flex flex-col items-center justify-center gap-4 text-center">
        <Shield className="w-12 h-12 text-surface-700" />
        <p className="text-surface-600">This module is being implemented</p>
      </div>
    </div>
  );
}
