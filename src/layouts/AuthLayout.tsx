// src/layouts/AuthLayout.tsx
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="min-h-screen flex bg-surface-950">
      {/* Left side — Branding panel (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[560px] relative flex-col justify-between p-12 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, #1a0533 0%, #0f172a 50%, #080f1e 100%)'
        }} />
        {/* Decorative orbs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">VaultOne</span>
          </div>
        </div>

        {/* Hero text */}
        <div className="relative z-10 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
              Your digital life,{' '}
              <span style={{ background: 'linear-gradient(135deg, #a78bfa, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                protected.
              </span>
            </h1>
            <p className="mt-4 text-lg text-surface-400 leading-relaxed">
              Zero-knowledge encryption. Your secrets stay yours — always.
            </p>
          </motion.div>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex flex-col gap-3"
          >
            {[
              { icon: '🔐', text: 'AES-256-GCM encryption, locally' },
              { icon: '🌐', text: 'Sync across all your devices' },
              { icon: '🛡️', text: 'Passwords, cards, notes & more' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3 text-surface-300">
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Footer quote */}
        <div className="relative z-10">
          <p className="text-xs text-surface-600">
            "We can't see your data. No one can."
          </p>
        </div>
      </div>

      {/* Right side — Auth form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-white">VaultOne</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Outlet />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
