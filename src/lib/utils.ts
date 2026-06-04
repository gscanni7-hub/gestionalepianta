import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Event, Table, Venue, ManagedUser, Reservation, PrCommission } from '../types';

/* ── Commissioni PR ───────────────────────────────────────── */

export const DEFAULT_COMMISSION: PrCommission = {
  percentage: 10,
  fixedPerTable: 0,
  fixedPerEvent: 0,
};

export function getPrCommission(pr: ManagedUser): PrCommission {
  return pr.commission ?? DEFAULT_COMMISSION;
}

/* Calcola il saldo del PR per una specifica serata.
   Considera solo le prenotazioni con check-in effettivo. */
export function calculatePrPayout(
  pr: ManagedUser,
  eventId: string,
  reservations: Reservation[],
): {
  tables: number;
  revenue: number;
  fromPercentage: number;
  fromPerTable: number;
  fromPerEvent: number;
  total: number;
} {
  const c = getPrCommission(pr);
  const prRes = reservations.filter(
    r => r.eventId === eventId && r.prId === pr.id && r.checkedIn,
  );
  const tables = prRes.length;
  const revenue = prRes.reduce((s, r) => s + (r.actualBudget ?? r.budget), 0);
  const fromPercentage = Math.round(revenue * c.percentage) / 100;
  const fromPerTable = tables * c.fixedPerTable;
  const fromPerEvent = tables > 0 ? c.fixedPerEvent : 0;
  return {
    tables, revenue,
    fromPercentage, fromPerTable, fromPerEvent,
    total: Math.round(fromPercentage + fromPerTable + fromPerEvent),
  };
}

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

/* ── Tavolo lookup + budget effettivo (oltre capacità) ────── */
export function findTable(
  res: { tableId: string; eventId: string },
  events: Event[],
  venues: Venue[],
): Table | null {
  const event = events.find(e => e.id === res.eventId);
  if (!event) return null;
  const venue = venues.find(v => v.id === event.venueId);
  if (!venue) return null;
  const fp = venue.floorPlans.find(f => f.id === event.floorPlanId) ?? venue.floorPlans[0];
  return fp?.tables.find(t => t.id === res.tableId) ?? null;
}

export function calcActualBudget(
  reservedBudget: number,
  actualPeople: number,
  table: Table | null,
): number {
  if (!table) return reservedBudget;
  const { capacity, minSpend } = table;
  const perPersonRate = capacity > 0 ? minSpend / capacity : 0;
  const base = Math.max(reservedBudget, minSpend);
  if (actualPeople <= capacity) return base;
  return Math.round(base + (actualPeople - capacity) * perPersonRate);
}

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
