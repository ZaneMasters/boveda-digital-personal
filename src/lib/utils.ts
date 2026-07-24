// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge class names with TailwindCSS conflict resolution.
 * Use this everywhere instead of template literals for Tailwind classes.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a date relative to now (e.g., "2 hours ago")
 */
export function timeAgo(date: Date | number): string {
  const now = Date.now();
  const diff = now - (typeof date === 'number' ? date : date.getTime());
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

/**
 * Truncate a string with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '…';
}

/**
 * Get initials from a name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

/**
 * Mask sensitive text (e.g., card number, password)
 */
export function mask(value: string, visibleChars = 4): string {
  if (value.length <= visibleChars) return '••••';
  return '••••' + value.slice(-visibleChars);
}

/**
 * Format card number with spaces
 */
export function formatCardNumber(value: string): string {
  return value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
}

/**
 * Get a favicon URL from a website URL
 */
export function getFaviconUrl(website: string): string {
  try {
    const url = website.startsWith('http') ? website : `https://${website}`;
    const { hostname } = new URL(url);
    return `https://www.google.com/s2/favicons?sz=64&domain=${hostname}`;
  } catch {
    return '';
  }
}
