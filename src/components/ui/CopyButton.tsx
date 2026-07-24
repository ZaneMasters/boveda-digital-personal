import { Check, Copy, User, KeyRound } from 'lucide-react';
import { useClipboard } from '@/hooks/useClipboard';
import { cn } from './Button';

export interface CopyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  iconType?: 'default' | 'user' | 'password';
}

export function CopyButton({ value, iconType = 'default', className, ...props }: CopyButtonProps) {
  const { copiedId, copy } = useClipboard();
  const hasCopied = copiedId === value;

  const Icon = iconType === 'user' ? User : iconType === 'password' ? KeyRound : Copy;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        copy(value, value);
      }}
      className={cn(
        'p-1.5 rounded-md transition-colors text-surface-500 hover:text-surface-200 hover:bg-surface-800 focus:outline-none focus:ring-2 focus:ring-brand-500/50',
        hasCopied && 'text-success-400 hover:text-success-400',
        className
      )}
      title="Copy to clipboard"
      {...props}
    >
      {hasCopied ? (
        <Check className="w-4 h-4" />
      ) : (
        <Icon className="w-4 h-4" />
      )}
    </button>
  );
}
