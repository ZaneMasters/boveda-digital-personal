// src/components/ui/Badge.tsx
import { cn } from './Button';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'brand' | 'success' | 'warning' | 'danger' | 'neutral';
}

export function Badge({ className, variant = 'neutral', ...props }: BadgeProps) {
  const variants = {
    brand: 'badge-brand',
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    neutral: 'bg-surface-800 text-surface-300 border border-surface-700',
  };

  return (
    <span className={cn('badge', variants[variant], className)} {...props} />
  );
}
