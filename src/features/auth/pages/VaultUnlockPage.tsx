// src/features/auth/pages/VaultUnlockPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Loader2, AlertCircle, LogOut, ShieldCheck } from 'lucide-react';
import { unlockVaultWithMasterPassword } from '@/services/auth.service';
import { signOutUser } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { useVaultStore } from '@/store/vault.store';

export function VaultUnlockPage() {
  const navigate = useNavigate();
  const { firebaseUser, profile } = useAuthStore();
  const { unlock } = useVaultStore();
  const [masterPassword, setMasterPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  const displayName = profile?.displayName ?? firebaseUser?.displayName ?? firebaseUser?.email?.split('@')[0] ?? 'there';
  const avatarUrl = profile?.photoURL ?? firebaseUser?.photoURL;

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser || !masterPassword) return;

    setError(null);
    setIsLoading(true);

    try {
      const key = await unlockVaultWithMasterPassword(firebaseUser, masterPassword);
      unlock(key);
      navigate('/app', { replace: true });
    } catch {
      setAttempts((a) => a + 1);
      setError(
        attempts >= 2
          ? 'Incorrect master password. Please try again carefully.'
          : 'Incorrect master password.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-950 p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm"
      >
        {/* Lock icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', border: '1px solid #334155' }}>
              <Lock className="w-8 h-8 text-brand-400" />
            </div>
          </div>
        </div>

        {/* Greeting */}
        <div className="text-center mb-8">
          {avatarUrl && (
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-12 h-12 rounded-full mx-auto mb-3 border-2 border-surface-700"
            />
          )}
          <h1 className="text-xl font-bold text-white">
            Hello, {displayName} 👋
          </h1>
          <p className="mt-1 text-sm text-surface-400">
            Enter your Master Password to unlock your vault
          </p>
        </div>

        <form onSubmit={handleUnlock} className="space-y-4">
          {/* Master password input */}
          <div className="relative">
            <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
            <input
              id="unlock-master-password"
              type={showPassword ? 'text' : 'password'}
              value={masterPassword}
              onChange={(e) => setMasterPassword(e.target.value)}
              placeholder="Master Password"
              className="input-base pl-10 pr-10"
              autoFocus
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          )}

          {/* Unlock button */}
          <button
            id="unlock-vault-btn"
            type="submit"
            disabled={isLoading || !masterPassword}
            className="btn-brand w-full"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
            Unlock Vault
          </button>
        </form>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 mx-auto mt-6 text-sm text-surface-500 hover:text-surface-300 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out ({firebaseUser?.email})
        </button>
      </motion.div>
    </div>
  );
}
