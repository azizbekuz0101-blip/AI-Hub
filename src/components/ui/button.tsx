import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50 select-none rounded-lg';

    const variants = {
      primary: 'bg-accent hover:bg-accent-hover text-white shadow-sm',
      secondary: 'bg-muted hover:bg-[#252525] text-textMain border border-border',
      outline: 'border border-border hover:bg-muted text-textMain',
      ghost: 'hover:bg-muted text-textMuted hover:text-textMain',
      danger: 'bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-500/30',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-9 px-4 text-sm',
      lg: 'h-11 px-6 text-base',
      icon: 'h-9 w-9 p-0',
    };

    return (
      <button
        ref={ref}
        className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
