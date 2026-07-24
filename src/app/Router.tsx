// src/app/Router.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { useVaultStore } from '@/store/vault.store';

// Layouts
import { AuthLayout } from '@/layouts/AuthLayout';
import { AppLayout } from '@/layouts/AppLayout';

// Auth pages
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage';
import { MasterPasswordSetupPage } from '@/features/auth/pages/MasterPasswordSetupPage';
import { VaultUnlockPage } from '@/features/auth/pages/VaultUnlockPage';

// App pages
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { PasswordsPage } from '@/features/passwords/pages/PasswordsPage';
import { NotesPage } from '@/features/notes/pages/NotesPage';
import { CardsPage } from '@/features/cards/pages/CardsPage';
import { BankAccountsPage } from '@/features/bankaccounts/pages/BankAccountsPage';
import { IdentitiesPage } from '@/features/identities/pages/IdentitiesPage';
import { DocumentsPage } from '@/features/documents/pages/DocumentsPage';
import { AttachmentsPage } from '@/features/attachments/pages/AttachmentsPage';
import { WifiPage } from '@/features/wifi/pages/WifiPage';
import { LicensesPage } from '@/features/licenses/pages/LicensesPage';
import { RecoveryCodesPage } from '@/features/recovery-codes/pages/RecoveryCodesPage';
import { DeveloperVaultPage } from '@/features/developer/pages/DeveloperVaultPage';
import { SecurityPage } from '@/features/security/pages/SecurityPage';
import { GeneratorPage } from '@/features/generator/pages/GeneratorPage';
import { SettingsPage } from '@/features/settings/pages/SettingsPage';

// Guards
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAuthLoading } = useAuthStore();
  if (isAuthLoading) return null; // Wait for Firebase to resolve auth state
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RequireUnlocked({ children }: { children: React.ReactNode }) {
  const { isLocked } = useVaultStore();
  const { isAuthenticated, isAuthLoading, settings } = useAuthStore();
  if (isAuthLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (settings && !settings.hasCompletedOnboarding) return <Navigate to="/setup" replace />;
  if (isLocked) return <Navigate to="/unlock" replace />;
  return <>{children}</>;
}

function RequireOnboarding({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAuthLoading, settings } = useAuthStore();
  if (isAuthLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (settings && !settings.hasCompletedOnboarding) return <Navigate to="/setup" replace />;
  return <>{children}</>;
}

function RequireSetup({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAuthLoading, settings } = useAuthStore();
  if (isAuthLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (settings?.hasCompletedOnboarding) return <Navigate to="/app" replace />;
  return <>{children}</>;
}

function GuestOnly({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) return <Navigate to="/app" replace />;
  return <>{children}</>;
}

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<GuestOnly><LoginPage /></GuestOnly>} />
          <Route path="/register" element={<GuestOnly><RegisterPage /></GuestOnly>} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        {/* Master Password setup (after OAuth first login) */}
        <Route
          path="/setup"
          element={<RequireSetup><MasterPasswordSetupPage /></RequireSetup>}
        />

        {/* Vault unlock screen (authenticated but locked) */}
        <Route
          path="/unlock"
          element={<RequireOnboarding><VaultUnlockPage /></RequireOnboarding>}
        />

        {/* Protected app routes (authenticated + unlocked) */}
        <Route
          path="/app"
          element={<RequireUnlocked><AppLayout /></RequireUnlocked>}
        >
          <Route index element={<DashboardPage />} />
          <Route path="passwords" element={<PasswordsPage />} />
          <Route path="notes" element={<div className="p-8"><h1 className="text-2xl font-bold text-white mb-4">Secure Notes</h1><p className="text-surface-400">Coming soon in Phase 3</p></div>} />
          <Route path="cards" element={<CardsPage />} />
          <Route path="bank" element={<BankAccountsPage />} />
          <Route path="identities" element={<IdentitiesPage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="attachments" element={<AttachmentsPage />} />
          <Route path="wifi" element={<WifiPage />} />
          <Route path="licenses" element={<LicensesPage />} />
          <Route path="recovery" element={<RecoveryCodesPage />} />
          <Route path="developer" element={<DeveloperVaultPage />} />
          <Route path="security" element={<SecurityPage />} />
          <Route path="generator" element={<GeneratorPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/app" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
