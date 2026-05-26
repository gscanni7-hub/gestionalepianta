import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Users, TrendingUp, DoorOpen, MapPin } from 'lucide-react';
import { Event, Venue, Reservation, UserProfile } from '../../types';
import FloorPlanViewer from '../floorplan/FloorPlanViewer';

interface Props {
  event: Event;
  venue: Venue;
  reservations: Reservation[];
  currentUser: UserProfile;
  onClose: () => void;
}

/* Vista "regia" a tutto schermo per la serata in corso: KPI grandi e
   leggibili da lontano + pianta che si colora in tempo reale man mano
   che la gente entra. Pensata per un secondo schermo / tablet alla consolle. */
export default function LiveControlRoom({ event, venue, reservations, currentUser, onClose }: Props) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const fp = venue.floorPlans.find(f => f.id === event.floorPlanId) ?? venue.floorPlans[0];
  const totalTables = fp?.tables.filter(t => !t.isFixture).length ?? 0;

  const evRes = reservations.filter(r => r.eventId === event.id && r.approvalStatus === 'approved');
  const checkedIn = evRes.filter(r => r.checkedIn);
  const peopleIn = checkedIn.reduce((s, r) => s + (r.actualPeople ?? r.guestsCount), 0);
  const incasso = checkedIn.reduce((s, r) => s + (r.actualBudget ?? r.budget), 0);
  const freeTables = Math.max(0, totalTables - evRes.length);
  const occupancy = totalTables > 0 ? Math.round((evRes.length / totalTables) * 100) : 0;
  const eur = (n: number) => n >= 1000 ? `€${(n / 1000).toFixed(1)}K` : `€${n}`;

  const kpis = [
    { icon: <DoorOpen size={16} />, value: `${checkedIn.length}`, sub: `/ ${evRes.length} tavoli`, label: 'Entrati', color: '#22C55E' },
    { icon: <Users size={16} />, value: `${peopleIn}`, sub: 'persone dentro', label: 'Affluenza', color: '#38BDF8' },
    { icon: <TrendingUp size={16} />, value: eur(incasso), sub: 'incasso reale', label: 'Incasso', color: '#D4622A' },
    { icon: <MapPin size={16} />, value: `${freeTables}`, sub: `${occupancy}% occupato`, label: 'Tavoli liberi', color: '#AEAEB2' },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex flex-col" style={{ background: 'radial-gradient(120% 80% at 50% -10%, rgba(212,98,42,.06), transparent 55%), #0b0a09' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] shrink-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] blink" />
            <p className="text-[10px] font-sans uppercase tracking-[0.3em] text-[#22C55E]">Regia · in diretta</p>
          </div>
          <h1 className="font-bold text-2xl text-white leading-tight mt-1 truncate">{event.name}</h1>
          <p className="text-xs text-[#8E8E93] mt-0.5">{venue.name}</p>
        </div>
        <div className="flex items-center gap-5 shrink-0">
          <div className="text-right hidden sm:block">
            <div className="hv font-black text-2xl text-white tabular-nums leading-none">
              {now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <p className="text-[9px] font-sans uppercase tracking-widest text-[#636366] mt-1">ora</p>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 flex items-center justify-center text-[#8E8E93] hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.06] shrink-0">
        {kpis.map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="px-6 py-5"
            style={{ background: '#0b0a09' }}
          >
            <div className="flex items-center gap-2 mb-3" style={{ color: k.color }}>
              {k.icon}
              <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#8E8E93]">{k.label}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="hv font-black text-4xl xl:text-5xl tabular-nums leading-none" style={{ color: k.color }}>{k.value}</span>
              <span className="text-xs text-[#636366]">{k.sub}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Live floor plan */}
      <div className="flex-1 min-h-0 p-5 overflow-auto">
        {fp ? (
          <FloorPlanViewer
            event={event}
            floorPlan={fp}
            reservations={reservations}
            currentUser={currentUser}
            onReservationAdded={() => {}}
            onReservationUpdated={() => {}}
            onReservationRemoved={() => {}}
            hostMode
          />
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-[#636366]">
            Nessuna pianta associata a questa serata.
          </div>
        )}
      </div>
    </div>
  );
}
