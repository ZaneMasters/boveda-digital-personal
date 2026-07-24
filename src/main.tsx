// src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { Providers } from './app/Providers';
import { Router } from './app/Router';

// Initialize dark mode immediately (before render) to prevent flash
const storedUI = localStorage.getItem('vaultone-ui');
if (storedUI) {
  try {
    const { state } = JSON.parse(storedUI) as { state: { theme: string } };
    const theme = state?.theme ?? 'dark';
    const isDark =
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', isDark);
  } catch {
    document.documentElement.classList.add('dark');
  }
} else {
  document.documentElement.classList.add('dark');
}

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

createRoot(root).render(
  <StrictMode>
    <Providers>
      <Router />
    </Providers>
  </StrictMode>
);
