// src/features/auth/pages/VaultUnlockPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Loader2, AlertCircle, LogOut } from 'lucide-react';
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
    <div 
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #070B14 0%, #0F172A 100%)' }}
    >
      {/* Animated Background Orbs */}
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.8, 1, 0.8],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-100px] left-[-100px] w-[700px] h-[700px] rounded-full blur-[100px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, rgba(139,92,246,0) 70%)' }}
      />
      <motion.div
        animate={{ 
          scale: [1, 1.15, 1],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-[-200px] right-[-200px] w-[900px] h-[900px] rounded-full blur-[100px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.20) 0%, rgba(59,130,246,0) 70%)' }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm relative z-10 p-8 rounded-3xl"
        style={{ 
          background: 'rgba(15, 23, 42, 0.6)', 
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 flex items-center justify-center relative">
            <div className="absolute inset-0 bg-brand-500/20 blur-xl rounded-full" />
            <img src="/favicon.svg" alt="VaultOne Logo" className="w-16 h-16 relative z-10" />
          </div>
        </div>

        {/* Greeting */}
        <div className="text-center mb-8">
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
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
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
