import React from 'react';
import { Reservation, Event } from '../../types';

interface Props {
  prId: string;
  reservations: Reservation[];
  events: Event[];
}

export default function PRStatsView({ prId, reservations, events }: Props) {
  const myRes = reservations.filter(r => r.prId === prId);
  const approved = myRes.filter(r => r.approvalStatus === 'approved');
  const totalGuests = myRes.reduce((s, r) => s + r.guestsCount, 0);
  const totalBudget = myRes.reduce((s, r) => s + (r.actualBudget ?? r.budget), 0);
  const checkedIn = myRes.filter(r => r.checkedIn).length;
  const checkinRate = myRes.length > 0 ? Math.round((checkedIn / myRes.length) * 100) : 0;

  const eventIds = [...new Set(myRes.map(r => r.eventId))];
  const maxBudget = Math.max(...eventIds.map(eid => {
    const evRes = myRes.filter(r => r.eventId === eid);
    return evRes.reduce((s, r) => s + (r.actualBudget ?? r.budget), 0);
  }), 1);

  const kpis = [
    { value: myRes.length, label: 'Prenotazioni' },
    { value: totalGuests, label: 'Ospiti totali' },
    { value: `€${totalBudget >= 1000 ? `${(totalBudget / 1000).toFixed(1)}K` : totalBudget}`, label: 'Budget totale' },
    { value: `${checkinRate}%`, label: 'Tasso ingressi' },
  ];

  return (
    <div>
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
        {kpis.map(({ value, label }) => (
          <div key={label} className="border border-white/[0.07] bg-white/[0.018] rounded-2xl px-5 py-5">
            <div className="hv font-black text-3xl text-white leading-none tabular-nums">{value}</div>
            <div className="text-[11px] uppercase tracking-[0.14em] text-[#8a8278] mt-3">{label}</div>
          </div>
        ))}
      </div>

      {/* Per-event breakdown */}
      {eventIds.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-[#8a8278]">Nessuna prenotazione ancora</p>
        </div>
      ) : (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a8278] mb-4">Dettaglio per serata</p>
          <div className="border border-white/[0.07] bg-white/[0.018] rounded-2xl overflow-hidden">
            {eventIds.map(eid => {
              const event = events.find(e => e.id === eid);
              const evRes = myRes.filter(r => r.eventId === eid);
              const evGuests = evRes.reduce((s, r) => s + r.guestsCount, 0);
              const evBudget = evRes.reduce((s, r) => s + (r.actualBudget ?? r.budget), 0);
              const barPct = Math.round((evBudget / maxBudget) * 100);

              return (
                <div key={eid} className="px-5 py-4 border-t border-white/[0.05] first:border-t-0">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-[15px] text-white truncate">{event?.name ?? eid}</p>
                      {event && <p className="text-xs text-[#8a8278] mt-0.5">{event.date}</p>}
                    </div>
                    <div className="flex items-center gap-5 shrink-0">
                      <div className="text-right"><p className="hv font-black text-lg text-white tabular-nums">{evRes.length}</p><p className="text-[10px] text-[#8a8278]">pren.</p></div>
                      <div className="text-right"><p className="hv font-black text-lg text-white tabular-nums">{evGuests}</p><p className="text-[10px] text-[#8a8278]">ospiti</p></div>
                      <div className="text-right"><p className="hv font-black text-lg text-[#D4622A] tabular-nums">€{evBudget >= 1000 ? `${(evBudget / 1000).toFixed(1)}K` : evBudget}</p><p className="text-[10px] text-[#8a8278]">budget</p></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex-1 h-1.5 bg-white/[0.07] overflow-hidden rounded-full">
                      <div className="h-full bg-[#D4622A] transition-all duration-700" style={{ width: `${barPct}%` }} />
                    </div>
                    <span className="text-[9px] font-mono text-[#8a8278] shrink-0 w-8 text-right">{barPct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
