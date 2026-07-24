// src/app/Providers.tsx
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { queryClient } from '@/lib/queryClient';
import { auth } from '@/firebase/auth';
import { db } from '@/firebase/firestore';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import type { UserSettings } from '@/types/user.types';

function AuthObserver({ children }: { children: React.ReactNode }) {
  const { setFirebaseUser, setSettings, setAuthLoading } = useAuthStore();
  const { setTheme } = useUIStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);

      if (user) {
        // Load user settings
        try {
          const settingsRef = doc(db, 'users', user.uid, 'private', 'settings');
          const saltRef = doc(db, 'users', user.uid, 'private', 'salt');
          
          const [settingsSnap, saltSnap] = await Promise.all([
            getDoc(settingsRef),
            getDoc(saltRef)
          ]);

          if (settingsSnap.exists()) {
            const settings = settingsSnap.data() as UserSettings;
            // Force false if salt is missing, regardless of what settings says
            if (!saltSnap.exists()) {
              settings.hasCompletedOnboarding = false;
            }
            setSettings(settings);
            setTheme(settings.theme);
          } else {
            setSettings({ hasCompletedOnboarding: false } as UserSettings);
          }
        } catch {
          // Fallback if permission denied before setup
          setSettings({ hasCompletedOnboarding: false } as UserSettings);
        }
      } else {
        setSettings(null);
      }

      setAuthLoading(false);
    });

    return unsubscribe;
  }, [setFirebaseUser, setSettings, setAuthLoading, setTheme]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthObserver>
        {children}
      </AuthObserver>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
