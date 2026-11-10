import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import type { HoldStatus } from '@/types';
import { Clock, CheckCircle2, AlertOctagon, Ban } from 'lucide-react';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-normal transition-colors focus:outline-none',
  {
    variants: {
      variant: {
        default:
          'border-zinc-200 bg-zinc-100 text-zinc-800',
        secondary:
          'border-zinc-200 bg-zinc-50 text-zinc-700',
        destructive:
          'border-rose-200 bg-rose-50 text-rose-700',
        outline:
          'border-zinc-200 bg-white text-zinc-700',
        emerald:
          'border-emerald-200 bg-emerald-50 text-emerald-800',
        amber:
          'border-amber-200 bg-amber-50 text-amber-800',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  status?: HoldStatus | 'AVAILABLE' | 'FULL';
  showIcon?: boolean;
}

const statusConfigs: Record<
  HoldStatus | 'AVAILABLE' | 'FULL',
  { label: string; icon: React.ReactNode; styles: string; pulse?: boolean }
> = {
  HELD: {
    label: 'Hold Active',
    icon: <Clock className="w-3.5 h-3.5 text-amber-600" />,
    styles: 'bg-amber-50 text-amber-800 border-amber-200/90 font-medium',
    pulse: true,
  },
  CONFIRMED: {
    label: 'Admission Confirmed',
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
    styles: 'bg-emerald-50 text-emerald-800 border-emerald-200/90 font-medium',
  },
  EXPIRED: {
    label: 'Hold Expired',
    icon: <AlertOctagon className="w-3.5 h-3.5 text-zinc-500" />,
    styles: 'bg-zinc-100 text-zinc-600 border-zinc-200/80 font-medium',
  },
  CANCELLED: {
    label: 'Hold Cancelled',
    icon: <Ban className="w-3.5 h-3.5 text-rose-500" />,
    styles: 'bg-rose-50 text-rose-700 border-rose-200/80 font-medium',
  },
  AVAILABLE: {
    label: 'Seats Available',
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
    styles: 'bg-emerald-50 text-emerald-800 border-emerald-200/90 font-medium',
  },
  FULL: {
    label: 'Class Full',
    icon: <AlertOctagon className="w-3.5 h-3.5 text-zinc-500" />,
    styles: 'bg-zinc-100 text-zinc-600 border-zinc-200/80 font-medium',
  },
};

function Badge({ className, variant, status, showIcon = true, children, ...props }: BadgeProps) {
  if (status) {
    const config = statusConfigs[status];
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border tracking-normal',
          config.styles,
          className
        )}
        {...props}
      >
        {showIcon && <span className={cn('shrink-0', config.pulse && 'animate-pulse')}>{config.icon}</span>}
        <span>{children || config.label}</span>
      </div>
    );
  }

  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
