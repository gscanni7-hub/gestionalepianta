import { useState } from 'react';
import { CheckCircle2, ChevronDown, LogIn, DoorOpen, Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, findTable, calcActualBudget, isEventVisibleToHost } from '../../lib/utils';
import { UserProfile, Reservation, Event, Venue } from '../../types';
import IngressiView from './IngressiView';
import FloorPlanViewer from '../floorplan/FloorPlanViewer';

/* ── CheckinRow ──────────────────────────────────────────── */
function CheckinRow({ res, events, venues, onCheckIn, onUndoCheckIn, onUpdatePeople }: {
  res: Reservation;
  events: Event[];
  venues: Venue[];
  onCheckIn: (id: string, n: number) => void;
  onUndoCheckIn: (id: string) => void;
  onUpdatePeople: (id: string, n: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [people, setPeople] = useState(res.actualPeople ?? res.guestsCount);
  const [flash, setFlash] = useState(false);
  const isIn = res.checkedIn;
  const table = findTable(res, events, venues);
  const previewBudget = calcActualBudget(res.budget, people, table);
  const budgetDiff = previewBudget - res.budget;
  const peopleChanged = people !== (res.actualPeople ?? res.guestsCount);

  return (
    <div
      className="border-b border-[#1d1b19] last:border-0"
      style={{
        backgroundColor: flash ? 'rgba(34,197,94,0.14)' : isIn ? 'rgba(34,197,94,0.03)' : 'transparent',
        transition: 'background-color 0.35s',
      }}
    >
      {/* Main row — always visible */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className={cn('w-2.5 h-2.5 rounded-full shrink-0 transition-colors', isIn ? 'bg-green-500' : 'bg-[#2d2a26]')} />
        <div className="flex-1 min-w-0">
          <p className={cn('font-semibold text-base truncate transition-colors', isIn ? 'text-[#aaa]' : 'text-white')}>
            {res.customerName}
          </p>
          <p className="text-[9px] font-sans text-[#8E8E93] mt-0.5 truncate">
            Tav. {res.tableName ?? res.tableId}{table?.area ? ` · ${table.area}` : ''} · PR {res.prName}
            {isIn && <span className="text-green-500 ml-2">· {res.actualPeople ?? res.guestsCount} entrati · €{res.actualBudget ?? res.budget}</span>}
          </p>
        </div>
        {isIn
          ? <CheckCircle2 size={16} className="text-green-500 shrink-0" />
          : <ChevronDown size={14} className={cn('text-[#8E8E93] shrink-0 transition-transform duration-200', open && 'rotate-180')} />
        }
      </button>

      {/* Expanded panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1 border-t border-[#1d1b19]">
              {/* People counter */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-[#8E8E93]">Persone entrate</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => setPeople(p => Math.max(1, p - 1))}
                    className="w-8 h-8 border border-[#3b3733] text-[#AEAEB2] hover:text-white hover:border-[#8E8E93] transition-colors text-xl leading-none flex items-center justify-center rounded-xl">−</button>
                  <span className="hv font-black text-2xl text-white w-8 text-center">{people}</span>
                  <button onClick={() => setPeople(p => p + 1)}
                    className="w-8 h-8 border border-[#3b3733] text-[#AEAEB2] hover:text-white hover:border-[#8E8E93] transition-colors text-xl leading-none flex items-center justify-center rounded-xl">+</button>
                </div>
              </div>

              {/* Budget preview */}
              <div className="flex items-center justify-between mb-5 py-3 border-t border-b border-[#1d1b19]">
                <span className="text-xs text-[#8E8E93]">Incasso</span>
                <div className="flex items-center gap-2">
                  {people !== res.guestsCount && <span className="text-[9px] font-sans text-[#636366] line-through">€{res.budget}</span>}
                  <span className="hv font-black text-lg text-accent">€{previewBudget}</span>
                  {budgetDiff > 0 && <span className="text-[9px] font-sans text-green-400">+€{budgetDiff}</span>}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {!isIn ? (
                  <button
                    onClick={() => {
                      setFlash(true);
                      setTimeout(() => { onCheckIn(res.id, people); setOpen(false); }, 560);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 text-black text-sm font-semibold rounded-xl"
                    style={{
                      backgroundColor: flash ? '#22C55E' : '#D4622A',
                      transition: 'background-color 0.3s',
                    }}
                  >
                    {flash ? <CheckCircle2 size={12} /> : <LogIn size={12} />}
                    {flash ? 'Entrato!' : 'Segna Entrata'}
                  </button>
                ) : (
                  <>
                    {peopleChanged && (
                      <button
                        onClick={() => { onUpdatePeople(res.id, people); setOpen(false); }}
                        className="flex-1 py-2.5 rounded-xl btn-primary text-xs font-semibold"
                      >
                        Aggiorna
                      </button>
                    )}
                    <button
                      onClick={() => { onUndoCheckIn(res.id); setOpen(false); }}
                      className="flex-1 py-2.5 rounded-xl border border-[#3b3733] text-[#636366] text-xs font-medium hover:border-red-500/40 hover:text-red-400 transition-colors"
                    >
                      Annulla Entrata
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── HostCheckinView ─────────────────────────────────────── */
export default function HostCheckinView({ reservations, events, venues, userRole, currentUser, onCheckIn, onUndoCheckIn, onUpdatePeople, onExport }: {
  reservations: Reservation[];
  events: Event[];
  venues: Venue[];
  userRole: string;
  currentUser: UserProfile;
  onCheckIn: (id: string, actualPeople: number) => void;
  onUndoCheckIn: (id: string) => void;
  onUpdatePeople: (id: string, actualPeople: number) => void;
  onExport?: (eventId: string) => void;
}) {
  const [search, setSearch] = useState('');
  const [showEntered, setShowEntered] = useState(false);
  const [tab, setTab] = useState<'lista' | 'pianta' | 'ingressi'>('lista');

  // Host: solo eventi attivati per l'ingresso. Admin (check-in globale): tutti.
  const activeEvents = events.filter(e =>
    e.status === 'active' && (userRole === 'host' ? isEventVisibleToHost(e) : true)
  );
  const [selectedEventId, setSelectedEventId] = useState<string>('');

  // Keep selectedEventId in sync with available events
  const activeEventId = selectedEventId || activeEvents[0]?.id || '';
  const activeEvent = activeEvents.find(e => e.id === activeEventId) ?? activeEvents[0] ?? null;

  const approvedRes = reservations.filter(r =>
    r.approvalStatus === 'approved' && (activeEvent ? r.eventId === activeEvent.id : true)
  );
  const total = approvedRes.length;
  const checkedInCount = approvedRes.filter(r => r.checkedIn).length;
  const pct = total > 0 ? Math.round((checkedInCount / total) * 100) : 0;

  const q = search.trim().toLowerCase();
  const filtered = approvedRes.filter(r =>
    !q || r.customerName.toLowerCase().includes(q) ||
    (r.tableName ?? '').toLowerCase().includes(q) ||
    r.prName.toLowerCase().includes(q)
  );

  const pending = filtered.filter(r => !r.checkedIn).sort((a, b) => a.customerName.localeCompare(b.customerName));
  const entered = filtered.filter(r => r.checkedIn).sort((a, b) => a.customerName.localeCompare(b.customerName));

  if (activeEvents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <DoorOpen size={32} className="text-[#3b3733]" />
        <p className="text-sm text-[#8E8E93]">Nessun evento attivo stasera</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="mb-5 max-w-xl mx-auto w-full">
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-bold text-2xl text-white">Ingresso</h1>
          {onExport && activeEvent && (
            <button
              onClick={() => onExport(activeEvent.id)}
              className="flex items-center gap-1.5 border border-white/[0.14] rounded-xl px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#cfc7bc] hover:text-white hover:border-[#D4622A]/50 transition-colors"
              title="Esporta lista ospiti"
            >
              <Download size={12} /> Esporta
            </button>
          )}
        </div>

        {/* Multi-event selector */}
        {activeEvents.length > 1 && (
          <div className="flex gap-1.5 mt-4 flex-wrap">
            {activeEvents.map(ev => (
              <button
                key={ev.id}
                onClick={() => setSelectedEventId(ev.id)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium transition-colors border rounded-full',
                  activeEventId === ev.id
                    ? 'bg-[#D4622A]/15 text-[#e8915f] border-[#D4622A]/40'
                    : 'border-white/[0.1] text-[#8a8278] hover:text-white hover:border-[#48484A]'
                )}
              >
                {ev.name}
              </button>
            ))}
          </div>
        )}

        {/* Hero entrati */}
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a8278] mt-6">Persone entrate</p>
        <p className="hv font-black text-[56px] leading-none text-white tabular-nums mt-2.5">
          {checkedInCount}<span className="text-[#5a544c] text-3xl">/{total}</span>
        </p>
        <div className="mt-4 h-1.5 bg-white/[0.07] overflow-hidden rounded-full">
          <motion.div className="h-full bg-[#22C55E]" initial={{ width: 0 }}
            animate={{ width: `${pct}%` }} transition={{ duration: 0.6, ease: 'easeOut' }} />
        </div>
        <p className="text-[13px] text-[#8a8278] mt-2.5">{pct}% · {total - checkedInCount} ancora attesi</p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-0 mb-5 max-w-xl mx-auto w-full border border-[#2d2a26] rounded-xl overflow-hidden">
        {(['lista', 'ingressi', 'pianta'] as const).map(t => (
          <button key={t}
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 py-2.5 text-xs font-medium transition-colors',
              tab === t ? 'bg-accent text-black' : 'text-[#8E8E93] hover:text-white'
            )}>
            {t === 'lista' ? 'Tavoli' : t === 'ingressi' ? 'Da Link' : 'Pianta'}
          </button>
        ))}
      </div>

      {tab === 'ingressi' && (
        <IngressiView activeEvent={activeEvent} />
      )}

      {tab === 'lista' && (
        <div className="max-w-xl mx-auto w-full">
          {/* Search */}
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Cerca cliente, tavolo, PR…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#1d1b19] border border-[#2d2a26] rounded-xl px-4 py-3 text-sm font-sans text-white placeholder-[#636366] outline-none focus:border-accent/40 transition-colors"
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E8E93] hover:text-white transition-colors">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Da fare */}
          {pending.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-[#8E8E93] mb-2 px-1">
                Da fare — {pending.length}
              </p>
              <div className="border border-[#2d2a26] bg-white/[0.018] overflow-hidden rounded-xl">
                {pending.map(res => (
                  <CheckinRow key={res.id} res={res} events={events} venues={venues}
                    onCheckIn={onCheckIn} onUndoCheckIn={onUndoCheckIn} onUpdatePeople={onUpdatePeople} />
                ))}
              </div>
            </div>
          )}

          {/* Entrati */}
          {entered.length > 0 && (
            <div>
              <button
                onClick={() => setShowEntered(o => !o)}
                className="flex items-center gap-2 text-xs text-[#8E8E93] hover:text-[#AEAEB2] transition-colors mb-2 px-1 w-full"
              >
                <ChevronDown size={11} className={cn('transition-transform duration-200', showEntered && 'rotate-180')} />
                Entrati — {entered.length}
              </button>
              <AnimatePresence>
                {showEntered && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                    <div className="border border-[#2d2a26] bg-white/[0.018] overflow-hidden rounded-xl">
                      {entered.map(res => (
                        <CheckinRow key={res.id} res={res} events={events} venues={venues}
                          onCheckIn={onCheckIn} onUndoCheckIn={onUndoCheckIn} onUpdatePeople={onUpdatePeople} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-sm text-[#8E8E93]">Nessun risultato</p>
            </div>
          )}
        </div>
      )}

      {tab === 'pianta' && (() => {
        if (!activeEvent) return null;
        const venue = venues.find(v => v.id === activeEvent.venueId);
        const fp = venue?.floorPlans.find(f => f.id === activeEvent.floorPlanId) ?? venue?.floorPlans[0];
        if (!venue || !fp) return (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <p className="text-sm text-[#8E8E93]">Nessuna pianta disponibile</p>
          </div>
        );
        return (
          <div className="flex-1 min-h-0">
            <FloorPlanViewer
              event={activeEvent}
              floorPlan={fp}
              reservations={reservations}
              currentUser={currentUser}
              onReservationAdded={() => {}}
              onReservationUpdated={() => {}}
              onReservationRemoved={() => {}}
              hostMode={true}
            />
          </div>
        );
      })()}

    </div>
  );
}
