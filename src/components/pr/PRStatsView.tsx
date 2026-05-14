import React from 'react';
import { BarChart3, TrendingUp, Calendar, CheckCircle2 } from 'lucide-react';
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
    { icon: <BarChart3 size={18} />, value: myRes.length, label: 'Prenotazioni' },
    { icon: <CheckCircle2 size={18} />, value: totalGuests, label: 'Ospiti totali' },
    { icon: <TrendingUp size={18} />, value: `€${totalBudget >= 1000 ? `${(totalBudget / 1000).toFixed(1)}K` : totalBudget}`, label: 'Budget totale' },
    { icon: <Calendar size={18} />, value: `${checkinRate}%`, label: 'Check-in rate' },
  ];

  return (
    <div>
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
        {kpis.map(({ icon, value, label }) => (
          <div key={label} className="border border-[#2a2a2a] bg-[#1a1a1a] px-6 py-6">
            <div className="text-accent mb-4">{icon}</div>
            <div className="hv font-black text-3xl text-white leading-none">{value}</div>
            <div className="text-[9px] font-sans uppercase tracking-[0.3em] text-[#555] mt-3">{label}</div>
          </div>
        ))}
      </div>

      {/* Per-event breakdown */}
      {eventIds.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-[9px] font-sans uppercase tracking-[0.4em] text-[#444]">Nessuna prenotazione ancora</p>
        </div>
      ) : (
        <div>
          <p className="text-[9px] font-sans uppercase tracking-[0.4em] text-[#555] mb-5">Dettaglio per serata</p>
          <div className="space-y-3">
            {eventIds.map(eid => {
              const event = events.find(e => e.id === eid);
              const evRes = myRes.filter(r => r.eventId === eid);
              const evGuests = evRes.reduce((s, r) => s + r.guestsCount, 0);
              const evBudget = evRes.reduce((s, r) => s + (r.actualBudget ?? r.budget), 0);
              const barPct = Math.round((evBudget / maxBudget) * 100);

              return (
                <div key={eid} className="border border-[#2a2a2a] bg-[#1a1a1a] px-5 py-4">
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <div>
                      <p className="hv font-black text-sm uppercase text-white">{event?.name ?? eid}</p>
                      {event && (
                        <p className="text-[9px] font-sans text-[#555] mt-0.5">{event.date}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-5 shrink-0">
                      <div className="text-right">
                        <p className="hv font-black text-lg text-white">{evRes.length}</p>
                        <p className="text-[8px] font-sans uppercase tracking-[0.3em] text-[#555]">pren.</p>
                      </div>
                      <div className="text-right">
                        <p className="hv font-black text-lg text-white">{evGuests}</p>
                        <p className="text-[8px] font-sans uppercase tracking-[0.3em] text-[#555]">ospiti</p>
                      </div>
                      <div className="text-right">
                        <p className="hv font-black text-lg text-accent">€{evBudget >= 1000 ? `${(evBudget / 1000).toFixed(1)}K` : evBudget}</p>
                        <p className="text-[8px] font-sans uppercase tracking-[0.3em] text-[#555]">budget</p>
                      </div>
                    </div>
                  </div>
                  {/* CSS bar chart */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-1.5 bg-[#252525] overflow-hidden">
                      <div
                        className="h-full bg-accent transition-all duration-700"
                        style={{ width: `${barPct}%` }}
                      />
                    </div>
                    <span className="text-[8px] font-mono text-[#555] shrink-0 w-8 text-right">{barPct}%</span>
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
