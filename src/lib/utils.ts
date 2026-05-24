import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Event } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ── Visibilità eventi per ruolo ─────────────────────────────
   L'admin sceglie quali eventi mostrare ai PR (per id) e quando
   attivarli all'ingresso (host). Retro-compatibilità: un campo
   undefined = visibile (vale per i dati creati prima di questa logica).
   - assignedPrIds undefined  → visibile a tutti i PR ("Tutti")
   - assignedPrIds []         → nessun PR
   - assignedPrIds [ids]      → solo quei PR
   - visibleToHost undefined  → visibile (legacy); false = nascosto all'ingresso */
export function isEventVisibleToPr(event: Event, prId: string): boolean {
  return event.assignedPrIds === undefined || event.assignedPrIds.includes(prId);
}

export function isEventVisibleToHost(event: Event): boolean {
  return event.visibleToHost !== false;
}

/* Datetime di fine serata. Se l'orario di fine è <= inizio, la serata
   scavalca la mezzanotte → fine il giorno dopo. null se manca l'orario di fine. */
export function eventEndDateTime(event: Event): Date | null {
  if (!event.endTime || !event.date) return null;
  const start = event.time ?? '00:00';
  const end = new Date(`${event.date}T${event.endTime}:00`);
  if (isNaN(end.getTime())) return null;
  if (event.endTime <= start) end.setDate(end.getDate() + 1);
  return end;
}

/* ── Design tokens — status palette ──────────────────────── */
export const COLORS = {
  accent:  '#D4622A',
  success: '#22C55E',
  warning: '#F59E0B',
  danger:  '#EF4444',
  info:    '#38BDF8',
  neutral: '#2d2a26',
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
