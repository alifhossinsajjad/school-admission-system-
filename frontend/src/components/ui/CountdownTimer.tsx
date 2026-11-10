import React, { useEffect, useState } from 'react';
import { Timer, AlertTriangle } from 'lucide-react';
import { getTimeRemaining } from '@/utils';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
  expiresAt: string;
  onExpire?: () => void;
  className?: string;
  compact?: boolean;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  expiresAt,
  onExpire,
  className,
  compact = false,
}) => {
  const [time, setTime] = useState(() => getTimeRemaining(expiresAt));

  useEffect(() => {
    const update = () => {
      const remaining = getTimeRemaining(expiresAt);
      setTime(remaining);
      if (remaining.isExpired && onExpire) {
        onExpire();
      }
    };

    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [expiresAt, onExpire]);

  if (time.isExpired) {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-100 text-zinc-600 border border-zinc-200',
          className
        )}
      >
        <AlertTriangle className="w-3.5 h-3.5 text-zinc-500" />
        <span>Reservation Expired</span>
      </div>
    );
  }

  const isUrgent = time.totalSeconds <= 120; // 2 minutes or less

  if (compact) {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-medium border transition-colors',
          isUrgent
            ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
            : 'bg-zinc-50 text-zinc-800 border-zinc-200',
          className
        )}
      >
        <Timer className="w-3.5 h-3.5 text-zinc-600" />
        <span>{time.formatted}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-between p-3 rounded-xl border transition-all',
        isUrgent
          ? 'bg-rose-50/70 border-rose-200/90 text-rose-950'
          : 'bg-zinc-50/90 border-zinc-200/90 text-zinc-900',
        className
      )}
    >
      <div className="flex items-center gap-2.5">
        <div
          className={cn(
            'p-1.5 rounded-lg',
            isUrgent ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-amber-100 text-amber-700'
          )}
        >
          <Timer className="w-4 h-4" />
        </div>
        <div>
          <span className="text-xs font-semibold text-zinc-900 block leading-tight">
            {isUrgent ? 'Action Required: Ending Soon' : 'Seat Reserved Temporarily'}
          </span>
          <span className="text-[11px] text-zinc-500 font-normal">
            Expires in {time.minutes}m {time.seconds}s
          </span>
        </div>
      </div>
      <div className="text-sm font-semibold tracking-tight px-2.5 py-0.5 bg-white text-zinc-900 rounded-lg border border-zinc-200/90 shadow-2xs">
        {time.formatted}
      </div>
    </div>
  );
};
