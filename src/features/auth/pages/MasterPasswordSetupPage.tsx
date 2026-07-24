// src/features/auth/pages/MasterPasswordSetupPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Eye, EyeOff, AlertTriangle, Loader2, CheckCircle2 } from 'lucide-react';
import { setupMasterPassword, signOutUser } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { useVaultStore } from '@/store/vault.store';
import { calculateEntropy } from '@/crypto';

export function MasterPasswordSetupPage() {
  const navigate = useNavigate();
  const { firebaseUser } = useAuthStore();
  const { unlock } = useVaultStore();

  const [masterPassword, setMasterPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const entropy = calculateEntropy(masterPassword);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (masterPassword !== confirm) {
      setError('Passwords do not match');
      return;
    }
    if (entropy.bits < 40) {
      setError('Master Password is too weak. Use at least 10 characters with mixed types.');
      return;
    }
    if (!firebaseUser) {
      setError('Not authenticated');
      return;
    }

    setIsLoading(true);
    try {
      const key = await setupMasterPassword(firebaseUser, masterPassword);
      
      // Update local state so router knows onboarding is complete
      useAuthStore.getState().setSettings({
        ...useAuthStore.getState().settings,
        hasCompletedOnboarding: true,
      } as any);

      unlock(key);
      navigate('/app', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Setup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    await signOutUser();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-950 p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        {/* Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', boxShadow: '0 0 40px rgba(139,92,246,0.3)' }}>
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Protect Your Vault</h1>
          <p className="mt-2 text-surface-400 text-sm leading-relaxed">
            Create a <strong className="text-white">Master Password</strong> to encrypt all your data.
            This is the only password that unlocks your vault.
          </p>
        </div>

        {/* Warning */}
        <div className="flex gap-3 p-4 rounded-xl mb-6"
          style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)' }}>
          <AlertTriangle className="w-5 h-5 text-warning-400 shrink-0 mt-0.5" />
          <div className="text-sm text-warning-400">
            <strong>Important:</strong> We cannot recover this password.
            If you lose it, you lose access to your vault permanently.
          </div>
        </div>

        <form onSubmit={handleSetup} className="space-y-4">
          {/* Master password */}
          <div className="space-y-1.5">
            <label htmlFor="master-password" className="text-sm font-medium text-surface-300">
              Master Password
            </label>
            <div className="relative">
              <input
                id="master-password"
                type={showPass ? 'text' : 'password'}
                value={masterPassword}
                onChange={(e) => setMasterPassword(e.target.value)}
                placeholder="Create a strong master password"
                className="input-base pr-10"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Strength meter */}
            <AnimatePresence>
              {masterPassword && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 pt-1"
                >
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className="h-1.5 flex-1 rounded-full transition-all duration-300"
                        style={{
                          background: level <= Math.ceil(entropy.strengthScore / 20)
                            ? entropy.color
                            : 'rgb(51,65,85)'
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-xs">
                    <span style={{ color: entropy.color }}>{entropy.strengthLabel}</span>
                    <span className="text-surface-500">{entropy.bits} bits</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Confirm */}
          <div className="space-y-1.5">
            <label htmlFor="confirm-password" className="text-sm font-medium text-surface-300">
              Confirm Master Password
            </label>
            <div className="relative">
              <input
                id="confirm-password"
                type={showConfirm ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat your master password"
                className="input-base pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirm && masterPassword === confirm && (
              <p className="flex items-center gap-1.5 text-xs text-success-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Passwords match
              </p>
            )}
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-danger-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            id="setup-master-password-btn"
            type="submit"
            disabled={isLoading || !masterPassword || !confirm}
            className="btn-brand w-full mt-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            Protect My Vault
          </button>
        </form>

        {/* Cancel / Sign out */}
        <button
          onClick={handleCancel}
          className="flex items-center justify-center w-full mt-6 text-sm text-surface-500 hover:text-surface-300 transition-colors"
        >
          ← Cancel and sign out
        </button>
      </motion.div>
    </div>
  );
}
