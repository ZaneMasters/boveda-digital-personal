// src/features/auth/pages/RegisterPage.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle } from 'lucide-react';
import {
  signInWithGoogle,
  signInWithGitHub,
  registerWithEmail,
  hasCompletedOnboarding,
} from '@/services/auth.service';

export function RegisterPage() {
  const navigate = useNavigate();
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [emailMode, setEmailMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOAuth = async (provider: 'google' | 'github') => {
    setError(null);
    setOauthLoading(provider);
    try {
      const result = provider === 'github'
        ? await signInWithGitHub()
        : await signInWithGoogle();

      const completed = await hasCompletedOnboarding(result.user.uid);
      navigate(completed ? '/unlock' : '/setup', { replace: true });
    } catch (err: unknown) {
      // Ignore cancelled popup (user closed it)
      if ((err as { code?: string })?.code === 'auth/popup-closed-by-user' ||
          (err as { code?: string })?.code === 'auth/cancelled-popup-request') return;
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setOauthLoading(null);
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await registerWithEmail(email, password);
      navigate('/setup', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Create your vault</h2>
        <p className="mt-1 text-sm text-surface-400">Get started in seconds</p>
      </div>

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

      {!emailMode ? (
        <div className="space-y-5">
          {/* Primary OAuth options */}
          <div className="space-y-3">
            <button
              id="google-register-btn"
              onClick={() => handleOAuth('google')}
              disabled={!!oauthLoading}
              className="btn-brand w-full"
            >
              {oauthLoading === 'google' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="white" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" opacity="0.9"/>
                  <path fill="white" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" opacity="0.9"/>
                  <path fill="white" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" opacity="0.9"/>
                  <path fill="white" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" opacity="0.9"/>
                </svg>
              )}
              Continue with Google
            </button>


          </div>

          <div className="divider">or</div>

          <button
            id="email-register-toggle"
            onClick={() => setEmailMode(true)}
            className="btn-secondary w-full"
          >
            Sign up with Email
          </button>
        </div>
      ) : (
        <form onSubmit={handleEmailRegister} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="reg-email" className="text-sm font-medium text-surface-300">Email</label>
            <input
              id="reg-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input-base"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="reg-password" className="text-sm font-medium text-surface-300">Password</label>
            <input
              id="reg-password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-base"
            />
          </div>
          <button
            id="email-register-submit"
            type="submit"
            disabled={isSubmitting}
            className="btn-brand w-full"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Create Account
          </button>
          <button type="button" onClick={() => setEmailMode(false)} className="w-full text-sm text-surface-500 hover:text-surface-300 transition-colors">
            ← Back
          </button>
        </form>
      )}

      <p className="text-center text-sm text-surface-500">
        Already have an account?{' '}
        <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
          Sign in
        </Link>
      </p>

      <p className="text-center text-xs text-surface-600">
        By creating an account you agree to our terms.
      </p>
    </div>
  );
}
