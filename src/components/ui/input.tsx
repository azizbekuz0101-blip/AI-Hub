import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={twMerge(
          clsx(
            'flex h-9 w-full rounded-lg border border-border bg-card px-3 py-1 text-sm text-textMain shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-textDark focus-visible:outline-none focus-visible:border-accent disabled:cursor-not-allowed disabled:opacity-50',
            className
          )
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
