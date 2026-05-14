import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ── Design tokens — status palette ──────────────────────── */
export const COLORS = {
  accent:  '#D4622A',
  success: '#22C55E',
  warning: '#F59E0B',
  danger:  '#EF4444',
  info:    '#38BDF8',
  neutral: '#2a2a2a',
} as const;

/* ── Motion presets ──────────────────────────────────────── */
export const easeOutQuart = [0.16, 1, 0.3, 1] as const;

export const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
  transition: { duration: 0.32, ease: easeOutQuart },
};

export const slideForward = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit:    { opacity: 0, x: -16 },
  transition: { duration: 0.32, ease: easeOutQuart },
};

export const slideBack = {
  initial: { opacity: 0, x: -24 },
  animate: { opacity: 1, x: 0 },
  exit:    { opacity: 0, x: 16 },
  transition: { duration: 0.32, ease: easeOutQuart },
};

/* Container variants for staggered grids */
export const gridContainer = {
  initial: { opacity: 1 },
  animate: {
    opacity: 1,
    transition: { staggerChildren: 0.045, delayChildren: 0.05 },
  },
};

export const gridItem = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeOutQuart } },
};
