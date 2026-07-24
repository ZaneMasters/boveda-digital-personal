// src/components/ui/Input.tsx
import { forwardRef } from 'react';
import { cn } from './Button';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, icon, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-500">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'input-base',
            icon && 'pl-10',
            error && 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs text-danger-400">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
