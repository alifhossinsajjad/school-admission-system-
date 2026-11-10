import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Validates a 17-digit National Birth Registration Number (BRN)
 */
export function isValidBRN(brn: string): boolean {
  return /^\d{17}$/.test(brn.trim());
}

/**
 * Formats a 17-digit BRN with spaces for human readability (e.g. "2005 1234 5678 90123")
 */
export function formatBRN(brn: string): string {
  const clean = brn.replace(/\D/g, '');
  if (clean.length !== 17) return brn;
  return `${clean.slice(0, 4)} ${clean.slice(4, 8)} ${clean.slice(8, 12)} ${clean.slice(12)}`;
}

/**
 * Calculates remaining time until hold expiration
 */
export function getTimeRemaining(expiresAt: string): {
  totalSeconds: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  formatted: string;
} {
  const expiryTime = new Date(expiresAt).getTime();
  const now = Date.now();
  const diffMs = expiryTime - now;

  if (diffMs <= 0 || isNaN(diffMs)) {
    return {
      totalSeconds: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
      formatted: '00:00',
    };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return {
    totalSeconds,
    minutes,
    seconds,
    isExpired: false,
    formatted,
  };
}

/**
 * Formats an ISO date string into human-readable date & time
 */
export function formatDateTime(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

