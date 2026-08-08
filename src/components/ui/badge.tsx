import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'free' | 'recommended' | 'reasoning' | 'fast' | 'context' | 'outline';
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-muted text-textMuted border border-border',
    free: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold',
    recommended: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    reasoning: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    fast: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    context: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
    outline: 'border border-border text-textDark',
  };

  return (
    <div
      className={twMerge(
        clsx(
          'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium transition-colors select-none',
          variants[variant],
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={twMerge(clsx('animate-pulse rounded-md bg-muted/60', className))}
      {...props}
    />
  );
}
