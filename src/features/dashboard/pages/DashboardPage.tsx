import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  KeyRound, StickyNote, CreditCard, FileText, Paperclip, User,
  Star, AlertTriangle, Clock, Shield, Activity
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useVaultItems } from '@/features/vault/hooks/useVaultQueries';
import { useSecurityScore } from '@/features/security/hooks/useSecurityScore';

const STAT_CARDS_TEMPLATE = [
  { label: 'Passwords', type: 'password', icon: KeyRound, color: '#8b5cf6', to: '/app/passwords' },
  { label: 'Notes', type: 'note', icon: StickyNote, color: '#06b6d4', to: '/app/notes' },
  { label: 'Cards', type: 'card', icon: CreditCard, color: '#f59e0b', to: '/app/cards' },
  { label: 'Documents', type: 'document', icon: FileText, color: '#10b981', to: '/app/documents' },
  { label: 'Identities', type: 'identity', icon: User, color: '#f43f5e', to: '/app/identities' },
  { label: 'Attachments', type: 'attachment', icon: Paperclip, color: '#64748b', to: '/app/attachments' },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export function DashboardPage() {
  const { firebaseUser, profile } = useAuthStore();
  const { data: items = [] } = useVaultItems();
  const sec = useSecurityScore();
  
  const displayName = profile?.displayName ?? firebaseUser?.displayName ?? 'there';

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const statCards = STAT_CARDS_TEMPLATE.map(card => ({
    ...card,
    value: items.filter(item => item.type === card.type).length
  }));

  const score = sec.score;
  const scoreColor = sec.color;
  const scoreLabel = sec.totalPasswords === 0 ? 'Add passwords to get your score' : sec.label;

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          {greeting}, {displayName} 👋
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Your vault is secure and up to date.
        </p>
      </motion.div>

      {/* Security Score Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-2xl p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0"
        style={{
          background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(124,58,237,0.08))',
          border: '1px solid rgba(139,92,246,0.2)',
        }}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Security Score</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-3xl font-bold" style={{ color: sec.totalPasswords === 0 ? 'white' : scoreColor }}>
                {score === 0 ? '—' : score}
              </span>
              <span className="text-sm text-surface-500">/ 100</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-start md:items-end w-full md:w-auto mt-2 md:mt-0">
          <p className="text-xs text-surface-500">{scoreLabel}</p>
          <div className="w-full md:w-48 h-2 rounded-full mt-2 overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
            <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${score}%`, background: scoreColor }} />
          </div>
        </div>
      </motion.div>

      {/* Stats grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
      >
        {statCards.map((card) => (
          <motion.div key={card.label} variants={itemVariants}>
            <Link
              to={card.to}
              className="vault-item p-4 flex flex-col gap-3 no-underline h-full"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${card.color}18` }}>
                <card.icon className="w-5 h-5" style={{ color: card.color }} />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{card.value}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{card.label}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Password Health */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="vault-item p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning-400" />
              <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Password Health</h2>
            </div>
            <Link to="/app/security" className="text-xs text-brand-400 hover:text-brand-300">View Report →</Link>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Weak / Critical',      count: sec.weakCount + sec.criticalCount, color: '#ef4444' },
              { label: 'Duplicate passwords',   count: sec.duplicateCount,                color: '#f97316' },
              { label: 'Old passwords (+90d)',  count: sec.oldCount,                      color: '#eab308' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                <span className="text-sm font-semibold" style={{ color: item.count > 0 ? item.color : '#22c55e' }}>
                  {item.count > 0 ? item.count : '✓'}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="vault-item p-5 space-y-4"
        >
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-brand-400" />
            <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Recent Activity</h2>
          </div>
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <Clock className="w-8 h-8 text-surface-700" />
            <p className="text-sm text-surface-600">No activity yet</p>
            <p className="text-xs text-surface-700">Start adding items to your vault</p>
          </div>
        </motion.div>
      </div>

      {/* Favorites */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="vault-item p-5 space-y-4"
      >
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-warning-400" />
          <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Favorites</h2>
        </div>
        <div className="flex flex-col items-center justify-center py-8 gap-2">
          <Star className="w-8 h-8 text-surface-700" />
          <p className="text-sm text-surface-600">No favorites yet</p>
          <p className="text-xs text-surface-700">Star items to find them quickly here</p>
        </div>
      </motion.div>
    </div>
  );
}
