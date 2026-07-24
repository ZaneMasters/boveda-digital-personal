// src/features/auth/pages/ResetPasswordPage.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { resetPassword } from '@/services/auth.service';

const schema = z.object({
  email: z.string().email('Invalid email address'),
});

type Form = z.infer<typeof schema>;

export function ResetPasswordPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: Form) => {
    setError(null);
    try {
      await resetPassword(values.email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
    }
  };

  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-2xl font-bold text-white">Reset Password</h2>
        <p className="mt-1 text-sm text-surface-400">
          We'll send a reset link to your email
        </p>
      </div>

      <AnimatePresence mode="wait">
        {sent ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex flex-col items-center gap-3 p-6 rounded-xl text-center"
              style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <CheckCircle2 className="w-10 h-10 text-success-400" />
              <div>
                <p className="font-semibold text-white">Email sent!</p>
                <p className="text-sm text-surface-400 mt-1">
                  Check <strong className="text-white">{getValues('email')}</strong> for the reset link.
                </p>
              </div>
            </div>
            <Link to="/login" className="btn-secondary w-full flex justify-center">
              <ArrowLeft className="w-4 h-4" /> Back to Sign In
            </Link>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
            <div className="space-y-1.5">
              <label htmlFor="reset-email" className="text-sm font-medium text-surface-300">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                <input
                  id="reset-email"
                  type="email"
                  placeholder="you@example.com"
                  className="input-base pl-10"
                  {...register('email')}
                />
              </div>
              {errors.email && <p className="text-xs text-danger-400">{errors.email.message}</p>}
            </div>
            <button type="submit" disabled={isSubmitting} className="btn-brand w-full">
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Send Reset Link
            </button>
            <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-surface-500 hover:text-surface-300 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Sign In
            </Link>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
