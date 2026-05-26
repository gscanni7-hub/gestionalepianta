import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bell, DoorOpen, ChevronRight, BarChart3, Clock, Info, X
} from 'lucide-react';
import { UserProfile, Event, Venue, Reservation, ManagedUser } from '../../types';
import { cn, isEventVisibleToPr, isEventVisibleToHost } from '../../lib/utils';

interface Props {
  user: UserProfile;
  events: Event[];
  venues: Venue[];
  reservations: Reservation[];
  managedUsers: ManagedUser[];
  pendingCount: number;
  prPendingCount: number;
  onNav: (view: string) => void;
  onOpenEvent: (event: Event) => void;
}

export default function Dashboard({ user, events, venues, reservations, managedUsers, pendingCount, prPendingCount, onNav, onOpenEvent }: Props) {
  if (user.role === 'admin') return <AdminDashboard user={user} events={events} venues={venues} reservations={reservations} managedUsers={managedUsers} pendingCount={pendingCount} onNav={onNav} onOpenEvent={onOpenEvent} />;
  if (user.role === 'pr')    return <PRDashboard user={user} events={events} venues={venues} reservations={reservations} prPendingCount={prPendingCount} onNav={onNav} onOpenEvent={onOpenEvent} />;
  return <HostDashboard user={user} events={events} venues={venues} reservations={reservations} onNav={onNav} />;
}

/* ── Admin ─────────────────────────────────────────────────── */
function AdminDashboard({ user, events, venues, reservations, managedUsers, pendingCount, onNav, onOpenEvent }: {
  user: UserProfile; events: Event[]; venues: Venue[]; reservations: Reservation[];
  managedUsers: ManagedUser[]; pendingCount: number;
  onNav: (v: string) => void; onOpenEvent: (e: Event) => void;
}) {
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Buongiorno' : hour < 18 ? 'Buon pomeriggio' : 'Buonasera';
  const dateStr = now.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });

  const activeEvents = events.filter(e => e.status === 'active');
  const activeIds = new Set(activeEvents.map(e => e.id));
  const activeRes = reservations.filter(r => activeIds.has(r.eventId) && r.approvalStatus === 'approved');
  const checkedIn = activeRes.filter(r => r.checkedIn);
  const revenueEst = activeRes.reduce((s, r) => s + (r.actualBudget ?? r.budget), 0);

  const totalTables = activeEvents.reduce((sum, ev) => {
    const venue = venues.find(v => v.id === ev.venueId);
    const fp = venue?.floorPlans.find(f => f.id === ev.floorPlanId) ?? venue?.floorPlans[0];
    return sum + (fp?.tables.filter(t => !t.isFixture).length ?? 0);
  }, 0);
  const occupancy = totalTables > 0 ? Math.round((activeRes.length / totalTables) * 100) : 0;

  return (
    <div>
      {/* Greeting */}
      <p className="text-xs font-medium text-[#8a8278] capitalize">{dateStr}</p>
      <h1 className="font-bold text-3xl text-white leading-tight mt-1">
        {greeting},<br />{user.displayName}
      </h1>

      {/* Hero incasso */}
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a8278] mt-9">Incasso stimato</p>
      <p className="hv font-black text-[52px] leading-none text-white tracking-tight tabular-nums mt-2.5">
        {revenueEst >= 1000 ? `€${(revenueEst / 1000).toFixed(1)}K` : `€${revenueEst}`}
      </p>
      <p className="text-[13px] text-[#8a8278] mt-2.5">{activeRes.length} tavoli su {totalTables} · {occupancy}% occupazione</p>

      <div className="h-px bg-white/[0.07] my-7" />

      {/* Card Stasera */}
      <div className="border border-white/[0.07] bg-white/[0.018] rounded-2xl p-5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a8278]">Stasera</span>
        <div className="mt-3">
          <button onClick={() => onNav('approvals')} className="w-full flex items-center justify-between py-2.5 text-left">
            <span className="flex items-center gap-2.5 text-sm text-[#cfc7bc]"><span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />Da approvare</span>
            <span className={cn('text-sm font-semibold tabular-nums', pendingCount > 0 ? 'text-[#F59E0B]' : 'text-white')}>{pendingCount}</span>
          </button>
          <div className="flex items-center justify-between py-2.5 border-t border-white/[0.05]">
            <span className="flex items-center gap-2.5 text-sm text-[#cfc7bc]"><span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />Entrati</span>
            <span className="text-sm font-semibold text-white tabular-nums">{checkedIn.length} / {activeRes.length}</span>
          </div>
          <div className="flex items-center justify-between py-2.5 border-t border-white/[0.05]">
            <span className="flex items-center gap-2.5 text-sm text-[#cfc7bc]"><span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />Serate attive</span>
            <span className="text-sm font-semibold text-white tabular-nums">{activeEvents.length}</span>
          </div>
        </div>
      </div>

      {/* Serate in corso */}
      {activeEvents.length > 0 && (
        <>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a8278] mt-7 mb-3">Serate in corso</p>
          <div className="border border-white/[0.07] bg-white/[0.018] rounded-2xl overflow-hidden">
            {activeEvents.map(ev => {
              const venue = venues.find(v => v.id === ev.venueId);
              const evRes = activeRes.filter(r => r.eventId === ev.id);
              return (
                <button
                  key={ev.id}
                  onClick={() => onOpenEvent(ev)}
                  className="w-full flex items-center gap-3.5 px-5 py-4 text-left border-t border-white/[0.05] first:border-t-0 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[#D4622A] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-[15px] truncate">{ev.name}</p>
                    <p className="text-xs text-[#8a8278] mt-0.5">{venue?.name ?? ''} · {evRes.length} tavoli</p>
                  </div>
                  <ChevronRight size={15} className="text-[#5a544c] shrink-0" />
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Operazioni */}
      <div className="grid grid-cols-2 gap-2.5 mt-7">
        <button onClick={() => onNav('approvals')}
          className="relative flex items-center justify-center gap-2 py-3.5 rounded-xl btn-secondary text-sm font-medium">
          <Bell size={14} /> Approva
          {pendingCount > 0 && (
            <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#F59E0B] text-black text-[9px] font-black flex items-center justify-center">{pendingCount}</span>
          )}
        </button>
        <button onClick={() => onNav('checkin')}
          className="flex items-center justify-center gap-2 py-3.5 rounded-xl btn-secondary text-sm font-medium">
          <DoorOpen size={14} /> Ingresso
        </button>
      </div>
    </div>
  );
}

/* ── PR ────────────────────────────────────────────────────── */
function PRDashboard({ user, events, venues, reservations, prPendingCount, onNav, onOpenEvent }: {
  user: UserProfile; events: Event[]; venues: Venue[]; reservations: Reservation[];
  prPendingCount: number; onNav: (v: string) => void; onOpenEvent: (e: Event) => void;
}) {
  const activeEvents = events.filter(e => e.status === 'active' && isEventVisibleToPr(e, user.id));
  const myRes = reservations.filter(r => r.prId === user.id);
  const myActiveRes = myRes.filter(r => activeEvents.some(e => e.id === r.eventId));
  const myApproved = myActiveRes.filter(r => r.approvalStatus === 'approved');
  const myBudget = myApproved.reduce((s, r) => s + (r.actualBudget ?? r.budget), 0);

  const activeWithToken = activeEvents.filter(e => e.registrationToken);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 18 ? 'Ciao' : 'Buonasera';

  const [hintSeen, setHintSeen] = useState(() => {
    try { return localStorage.getItem('nightplan_pr_hint') === '1'; } catch { return false; }
  });
  const dismissHint = () => {
    setHintSeen(true);
    try { localStorage.setItem('nightplan_pr_hint', '1'); } catch { /* storage non disponibile */ }
  };

  return (
    <div>
      {/* Greeting */}
      <p className="text-xs font-medium text-[#8a8278] capitalize">
        {now.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}
      </p>
      <h1 className="font-bold text-3xl text-white leading-tight mt-1">
        {greeting},<br />{user.displayName}
      </h1>

      {/* Hint primo-uso */}
      {!hintSeen && activeWithToken.length > 0 && (
        <div className="border border-[#D4622A]/25 bg-[#D4622A]/[0.05] rounded-2xl p-4 flex items-start gap-3 mt-7">
          <Info size={15} className="text-[#D4622A] shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">Come funziona</p>
            <p className="text-xs text-[#8a8278] mt-1 leading-relaxed">
              Copia il tuo link personale e condividilo con i clienti: ogni registrazione viene conteggiata a te e la ritrovi nelle tue statistiche.
            </p>
          </div>
          <button onClick={dismissHint} className="text-[#8a8278] hover:text-white transition-colors shrink-0" aria-label="Chiudi">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Hero budget */}
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a8278] mt-9">Budget generato stasera</p>
      <p className="hv font-black text-[52px] leading-none text-white tracking-tight tabular-nums mt-2.5">
        {myBudget >= 1000 ? `€${(myBudget / 1000).toFixed(1)}K` : `€${myBudget}`}
      </p>
      <p className="text-[13px] text-[#8a8278] mt-2.5">{myApproved.length} approvate · {myActiveRes.length} totali stasera</p>

      <div className="h-px bg-white/[0.07] my-7" />

      {/* Card Stasera */}
      <div className="border border-white/[0.07] bg-white/[0.018] rounded-2xl p-5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a8278]">Stasera</span>
        <div className="mt-3">
          <div className="flex items-center justify-between py-2.5">
            <span className="flex items-center gap-2.5 text-sm text-[#cfc7bc]"><span className="w-1.5 h-1.5 rounded-full bg-[#5a544c]" />Prenotate</span>
            <span className="text-sm font-semibold text-white tabular-nums">{myActiveRes.length}</span>
          </div>
          <div className="flex items-center justify-between py-2.5 border-t border-white/[0.05]">
            <span className="flex items-center gap-2.5 text-sm text-[#cfc7bc]"><span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />Approvate</span>
            <span className="text-sm font-semibold text-white tabular-nums">{myApproved.length}</span>
          </div>
          <div className="flex items-center justify-between py-2.5 border-t border-white/[0.05]">
            <span className="flex items-center gap-2.5 text-sm text-[#cfc7bc]"><span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />In attesa</span>
            <span className={cn('text-sm font-semibold tabular-nums', prPendingCount > 0 ? 'text-[#F59E0B]' : 'text-white')}>{prPendingCount}</span>
          </div>
        </div>
      </div>

      {/* Serate attive */}
      {activeEvents.length > 0 && (
        <>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a8278] mt-7 mb-3">Serate attive</p>
          <div className="border border-white/[0.07] bg-white/[0.018] rounded-2xl overflow-hidden">
            {activeEvents.map(ev => {
              const venue = venues.find(v => v.id === ev.venueId);
              return (
                <button key={ev.id} onClick={() => onOpenEvent(ev)}
                  className="w-full flex items-center gap-3.5 px-5 py-4 text-left border-t border-white/[0.05] first:border-t-0 hover:bg-white/[0.02] transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4622A] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-[15px] truncate">{ev.name}</p>
                    <p className="text-xs text-[#8a8278] mt-0.5">{venue?.name ?? ''}</p>
                  </div>
                  <ChevronRight size={15} className="text-[#5a544c] shrink-0" />
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Il mio link */}
      {activeWithToken.length > 0 && (
        <>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a8278] mt-7 mb-3">Il tuo link</p>
          <div className="space-y-2.5">
            {activeWithToken.map(ev => {
              const link = `${window.location.origin}/r/${ev.registrationToken}?pr=${user.id}`;
              return (
                <div key={ev.id} className="border border-white/[0.07] bg-white/[0.018] rounded-2xl p-4">
                  <p className="font-semibold text-white text-sm">{ev.name}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex-1 bg-[#0a0706] border border-white/[0.08] px-3 py-2 overflow-hidden rounded-lg">
                      <p className="text-[10px] font-mono text-[#8a8278] truncate">{link}</p>
                    </div>
                    <button onClick={() => navigator.clipboard.writeText(link)}
                      className="shrink-0 px-4 py-2 rounded-lg btn-primary text-xs font-semibold">
                      Copia
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Azioni rapide */}
      <div className="grid grid-cols-2 gap-2.5 mt-7">
        <button onClick={() => onNav('reservations')}
          className="relative flex items-center justify-center gap-2 py-3.5 rounded-xl btn-secondary text-sm font-medium">
          <BarChart3 size={14} /> Prenotazioni
          {prPendingCount > 0 && (
            <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#F59E0B] text-black text-[9px] font-black flex items-center justify-center">{prPendingCount}</span>
          )}
        </button>
        <button onClick={() => onNav('history')}
          className="flex items-center justify-center gap-2 py-3.5 rounded-xl btn-secondary text-sm font-medium">
          <Clock size={14} /> Storico
        </button>
      </div>
    </div>
  );
}

/* ── Host ───────────────────────────────────────────────────── */
function HostDashboard({ user, events, venues, reservations, onNav }: {
  user: UserProfile; events: Event[]; venues: Venue[];
  reservations: Reservation[]; onNav: (v: string) => void;
}) {
  const activeEvents = events.filter(e => e.status === 'active' && isEventVisibleToHost(e));
  const activeEvent = activeEvents[0] ?? null;
  const venue = activeEvent ? venues.find(v => v.id === activeEvent.venueId) : null;
  const approved = reservations.filter(r => r.approvalStatus === 'approved' && activeEvents.some(e => e.id === r.eventId));
  const checkedIn = approved.filter(r => r.checkedIn);
  const pct = approved.length > 0 ? Math.round((checkedIn.length / approved.length) * 100) : 0;

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 18 ? 'Ciao' : 'Buonasera';

  return (
    <div>
      {/* Greeting */}
      <p className="text-xs font-medium text-[#8a8278] capitalize">
        {now.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}
      </p>
      <h1 className="font-bold text-3xl text-white leading-tight mt-1">
        {greeting},<br />{user.displayName}
      </h1>

      {!activeEvent ? (
        <div className="py-20 text-center border border-white/[0.07] rounded-2xl mt-8">
          <DoorOpen size={32} className="text-[#5a544c] mx-auto mb-3" />
          <p className="text-sm text-[#8a8278]">Nessun evento attivo stasera</p>
        </div>
      ) : (
        <>
          {/* Evento in corso */}
          <div className="mt-8">
            <p className="text-xs text-[#8a8278]">{venue?.name ?? ''}</p>
            <p className="font-bold text-white text-xl mt-0.5">{activeEvent.name}</p>
          </div>

          {/* Hero entrati */}
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a8278] mt-9">Persone entrate</p>
          <p className="hv font-black text-[72px] leading-none text-white tabular-nums mt-3">
            {checkedIn.length}<span className="text-[#5a544c] text-4xl">/{approved.length}</span>
          </p>
          <div className="mt-5 h-1.5 bg-white/[0.07] overflow-hidden rounded-full">
            <motion.div
              className="h-full bg-[#22C55E]"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          <p className="text-[13px] text-[#8a8278] mt-2.5">{pct}% · {approved.length - checkedIn.length} ancora attesi</p>

          {/* CTA principale */}
          <button
            onClick={() => onNav('checkin')}
            className="w-full flex items-center justify-center gap-3 btn-primary py-4 text-sm font-semibold rounded-xl mt-8"
          >
            <DoorOpen size={18} />
            Vai all'ingresso
          </button>
        </>
      )}
    </div>
  );
}
