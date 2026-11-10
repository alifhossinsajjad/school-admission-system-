import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none active:scale-[0.99]',
  {
    variants: {
      variant: {
        default:
          'bg-orange-600 text-white shadow-xs hover:bg-orange-700 active:bg-orange-800',
        primary:
          'bg-orange-600 text-white shadow-xs hover:bg-orange-700 active:bg-orange-800',
        destructive:
          'bg-rose-600 text-white shadow-xs hover:bg-rose-700 active:bg-rose-800',
        danger:
          'bg-rose-600 text-white shadow-xs hover:bg-rose-700 active:bg-rose-800',
        outline:
          'border border-zinc-200/90 bg-white text-zinc-800 shadow-2xs hover:bg-zinc-50 hover:text-zinc-950 hover:border-zinc-300',
        secondary:
          'bg-zinc-100 text-zinc-800 hover:bg-zinc-200/70 border border-zinc-200/50',
        ghost:
          'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900',
        link:
          'text-orange-600 underline-offset-4 hover:underline font-semibold',
        emerald:
          'bg-emerald-600 text-white shadow-xs hover:bg-emerald-700 active:bg-emerald-800',
      },
      size: {
        default: 'h-10 px-4 py-2',
        md: 'h-10 px-4 py-2',
        sm: 'h-8.5 rounded-lg px-3 text-xs gap-1.5',
        lg: 'h-11 rounded-xl px-6 text-sm gap-2.5',
        icon: 'h-9 w-9 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading = false, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
