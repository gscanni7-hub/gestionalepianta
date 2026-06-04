import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar, Building2, BarChart3, Bell, Users, DoorOpen, Clock, Settings, Search, UserCheck,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { UserProfile, Venue, Event, Reservation, ManagedUser } from '../../types';

type PaletteItem = {
  type: 'nav' | 'venue' | 'event' | 'reservation' | 'pr';
  label: string;
  sub?: string;
  icon: React.ReactNode;
  action: () => void;
};

export default function CommandPalette({
  open, onClose, user, venues, events, reservations, managedUsers,
  onOpenVenue, onOpenEvent, onOpenPR, onNav,
}: {
  open: boolean;
  onClose: () => void;
  user: UserProfile;
  venues: Venue[];
  events: Event[];
  reservations: Reservation[];
  managedUsers: ManagedUser[];
  onOpenVenue: (v: Venue) => void;
  onOpenEvent: (e: Event) => void;
  onOpenPR: (pr: ManagedUser) => void;
  onNav: (view: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const navItems: PaletteItem[] = user.role === 'admin' ? [
    { type: 'nav', label: 'Prossimi eventi',  icon: <Calendar size={13}/>,  action: () => onNav('active-events') },
    { type: 'nav', label: 'Club',             icon: <Building2 size={13}/>, action: () => onNav('venues') },
    { type: 'nav', label: 'Prenotazioni',     icon: <BarChart3 size={13}/>, action: () => onNav('reservations') },
    { type: 'nav', label: 'Approvazioni',     icon: <Bell size={13}/>,      action: () => onNav('approvals') },
    { type: 'nav', label: 'I Miei PR',        icon: <Users size={13}/>,     action: () => onNav('pr-management') },
    { type: 'nav', label: 'Ingresso Serata',  icon: <DoorOpen size={13}/>,  action: () => onNav('checkin') },
  ] : user.role === 'pr' ? [
    { type: 'nav', label: 'Eventi',           icon: <Calendar size={13}/>,  action: () => onNav('events') },
    { type: 'nav', label: 'Prenotazioni',     icon: <BarChart3 size={13}/>, action: () => onNav('reservations') },
    { type: 'nav', label: 'Il Mio Storico',   icon: <Clock size={13}/>,     action: () => onNav('history') },
    { type: 'nav', label: 'Il Mio Profilo',   icon: <Settings size={13}/>,  action: () => onNav('profile') },
  ] : [
    { type: 'nav', label: 'Ingresso Serata',  icon: <DoorOpen size={13}/>,  action: () => onNav('checkin') },
  ];

  const q = query.trim().toLowerCase();
  const match = (s: string) => s.toLowerCase().includes(q);

  const results: PaletteItem[] = !q ? navItems : (() => {
    const items: PaletteItem[] = [];

    navItems.forEach(n => {
      if (match(n.label)) items.push(n);
    });

    venues.forEach(v => {
      if (match(v.name) || match(v.address)) {
        items.push({ type: 'venue', label: v.name, sub: v.address, icon: <Building2 size={13}/>, action: () => onOpenVenue(v) });
      }
    });

    events.slice(0, 200).forEach(ev => {
      if (match(ev.name) || match(ev.date)) {
        const v = venues.find(x => x.id === ev.venueId);
        items.push({ type: 'event', label: ev.name, sub: `${v?.name ?? ''} · ${ev.date}`, icon: <Calendar size={13}/>, action: () => onOpenEvent(ev) });
      }
    });

    reservations.slice(0, 300).forEach(r => {
      const inScope = user.role === 'admin' || r.prId === user.id;
      if (!inScope) return;
      if (match(r.customerName) || match(r.tableName ?? '') || match(r.prName)) {
        const ev = events.find(e => e.id === r.eventId);
        items.push({
          type: 'reservation',
          label: r.customerName,
          sub: `Tav. ${r.tableName ?? r.tableId} · ${ev?.name ?? ''} · €${r.actualBudget ?? r.budget}`,
          icon: <UserCheck size={13}/>,
          action: () => { if (ev) onOpenEvent(ev); },
        });
      }
    });

    if (user.role === 'admin') {
      managedUsers.forEach(u => {
        if (u.role !== 'pr') return;
        const full = `${u.displayName} ${u.lastName}`;
        if (match(full) || match(u.email)) {
          items.push({ type: 'pr', label: full, sub: u.email, icon: <Users size={13}/>, action: () => onOpenPR(u) });
        }
      });
    }

    return items.slice(0, 30);
  })();

  useEffect(() => {
    if (idx >= results.length) setIdx(Math.max(0, results.length - 1));
  }, [results.length, idx]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); setIdx(i => Math.min(i + 1, results.length - 1)); }
      else if (e.key === 'ArrowUp')   { e.preventDefault(); setIdx(i => Math.max(i - 1, 0)); }
      else if (e.key === 'Enter') {
        e.preventDefault();
        const item = results[idx];
        if (item) { item.action(); onClose(); }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, results, idx, onClose]);

  const typeLabel: Record<PaletteItem['type'], string> = {
    nav: 'Vai a',
    venue: 'Club',
    event: 'Serata',
    reservation: 'Prenotazione',
    pr: 'PR',
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[12vh] px-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: -16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-xl bg-[#1d1b19] border border-[#2d2a26] shadow-2xl overflow-hidden"
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#1d1b19]">
          <Search size={14} className="text-[#8E8E93] shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setIdx(0); }}
            placeholder="Cerca club, serata, cliente, PR…"
            className="flex-1 bg-transparent outline-none text-sm font-sans text-white placeholder-[#636366]"
          />
          <kbd className="text-[8px] font-mono border border-[#2d2a26] px-1.5 py-0.5 text-[#8E8E93] shrink-0">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-[55vh] overflow-y-auto">
          {results.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-[#8E8E93]">Nessun risultato</p>
            </div>
          ) : (
            <ul>
              {results.map((item, i) => (
                <li key={`${item.type}-${i}`}>
                  <button
                    onClick={() => { item.action(); onClose(); }}
                    onMouseEnter={() => setIdx(i)}
                    className={cn(
                      'w-full flex items-center gap-3 px-5 py-2.5 text-left border-l-2 transition-colors',
                      i === idx ? 'bg-accent/10 border-accent' : 'border-transparent hover:bg-white/[0.02]'
                    )}
                  >
                    <div className={cn('shrink-0', i === idx ? 'text-accent' : 'text-[#8E8E93]')}>{item.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-xs font-sans truncate', i === idx ? 'text-white' : 'text-[#bbb]')}>{item.label}</p>
                      {item.sub && (
                        <p className="text-[9px] font-sans text-[#8E8E93] truncate mt-0.5">{item.sub}</p>
                      )}
                    </div>
                    <span className="text-xs text-[#8E8E93] shrink-0">{typeLabel[item.type]}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer hints */}
        <div className="px-5 py-2.5 border-t border-[#1d1b19] flex items-center justify-between text-xs text-[#8E8E93]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><kbd className="font-mono border border-[#2d2a26] px-1 py-0.5">↑↓</kbd> naviga</span>
            <span className="flex items-center gap-1"><kbd className="font-mono border border-[#2d2a26] px-1 py-0.5">↵</kbd> apri</span>
          </div>
          <span>{results.length} risultati</span>
        </div>
      </motion.div>
    </div>
  );
}
