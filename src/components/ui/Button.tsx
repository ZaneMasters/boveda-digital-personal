// src/components/ui/Button.tsx
import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'brand' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'brand', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium transition-all outline-none disabled:opacity-60 disabled:cursor-not-allowed';
    
    const variants = {
      brand: 'btn-brand', // Uses our CSS definition for gradient + shadow
      secondary: 'btn-secondary',
      danger: 'bg-danger-500/10 text-danger-500 border border-danger-500/20 hover:bg-danger-500/20 hover:border-danger-500/30 rounded-[0.875rem]',
      ghost: 'bg-transparent text-surface-400 hover:text-surface-200 hover:bg-surface-800 rounded-lg',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-6 py-3 text-base',
      icon: 'p-2', // For icon-only buttons
    };

    // If variant is brand or secondary, size padding might be overridden by the CSS class,
    // so we handle it gracefully or rely on twMerge.
    const isCustomVariant = variant === 'danger' || variant === 'ghost';
    
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          variants[variant],
          isCustomVariant && sizes[size],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
