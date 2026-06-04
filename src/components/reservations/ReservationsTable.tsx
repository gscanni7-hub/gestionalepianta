import { Pencil, Trash2, CheckCircle2, Download } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Event, Reservation } from '../../types';

export default function ReservationsTable({ reservations, userRole, events, onDelete, onEdit }: {
  reservations: Reservation[];
  userRole: string;
  events: Event[];
  onDelete?: (id: string) => void;
  onEdit?: (r: Reservation) => void;
}) {
  const approvalBadge = (s: string) => {
    if (s === 'approved') return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full bg-green-500/10 text-green-400 border border-green-500/20">Approvata</span>;
    if (s === 'rejected') return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full bg-red-500/10 text-red-400 border border-red-500/20">Rifiutata</span>;
    return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full bg-[#2d2a26] text-[#AEAEB2] border border-[#3b3733]">In attesa</span>;
  };

  // Group reservations by event, sorted alphabetically within each group
  const groups: { event: Event | undefined; eventId: string; rows: Reservation[] }[] =
    Object.entries(
      reservations.reduce<Record<string, Reservation[]>>((acc, r) => {
        (acc[r.eventId] ??= []).push(r);
        return acc;
      }, {})
    ).map(([eventId, rows]) => ({
      eventId,
      event: events.find(e => e.id === eventId),
      rows: [...rows].sort((a, b) => a.customerName.localeCompare(b.customerName)),
    }));

  const exportEventCSV = (rows: Reservation[], eventName: string) => {
    const headers = ['Tavolo', 'Cliente', 'PR', 'PAX', 'Budget €', 'Bottiglie'];
    const data = rows.map(r => [
      r.tableName ?? r.tableId,
      r.customerName,
      r.prName,
      r.guestsCount,
      r.budget,
      r.bottles,
    ]);
    const csv = [headers, ...data]
      .map(row => row.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${eventName.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white/[0.018] border border-white/[0.07] overflow-hidden rounded-2xl">
      <div className="px-7 py-5 border-b border-white/[0.07]">
        <h2 className="font-bold text-xl text-white">Prenotazioni</h2>
      </div>

      {reservations.length === 0 ? (
        <div className="px-7 py-24 text-center">
          <p className="text-sm text-[#8a8278]">Nessuna prenotazione</p>
        </div>
      ) : (
        <div className="space-y-0">
          {groups.map(({ event, eventId, rows }) => (
            <div key={eventId}>
              {/* Event header */}
              <div className="px-7 py-3 bg-[#121110] border-b border-[#2d2a26] flex items-center gap-4 flex-wrap">
                <span className="font-semibold text-sm text-white">
                  {event?.name ?? eventId}
                </span>
                {event && (
                  <span className="font-mono text-[9px] text-[#8E8E93]">{event.date}</span>
                )}
                <span className="text-xs text-[#8E8E93]">
                  {rows.length} {rows.length === 1 ? 'prenotazione' : 'prenotazioni'}
                </span>
                {rows.some(r => r.checkedIn) && (
                  <span className="flex items-center gap-1 text-xs font-medium rounded-full text-green-400 border border-green-500/20 bg-green-500/5 px-2.5 py-0.5">
                    <CheckCircle2 size={10} /> {rows.filter(r => r.checkedIn).length} entrati
                  </span>
                )}
                {userRole === 'admin' && (
                  <button
                    onClick={() => exportEventCSV(rows, event?.name ?? eventId)}
                    className="ml-auto flex items-center gap-1.5 text-[#8E8E93] hover:text-accent transition-colors text-xs">
                    <Download size={11} /> Scarica
                  </button>
                )}
              </div>

              {/* Mobile cards */}
              <div className="sm:hidden divide-y divide-[#2d2a26]">
                {rows.map(res => (
                  <div key={res.id} className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0',
                          res.status === 'confirmed' ? 'bg-accent blink' : 'bg-[#3b3733]'
                        )} />
                        <span className={cn('text-xs font-medium',
                          res.status === 'confirmed' ? 'text-accent' : 'text-[#AEAEB2]'
                        )}>{res.status}</span>
                      </div>
                      <span className="hv font-black text-accent text-lg">€{res.budget}</span>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="hv font-bold text-sm uppercase text-white truncate">{res.customerName}</p>
                        {userRole === 'admin' && <p className="text-[9px] font-sans text-[#AEAEB2] uppercase tracking-widest mt-0.5">{res.prName}</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="hv font-bold text-sm text-white">{res.tableName ?? res.tableId}</p>
                        <p className="text-[9px] font-sans text-[#AEAEB2] mt-0.5">{res.guestsCount} pax</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[640px]">
                  <thead>
                    <tr className="border-b border-[#2d2a26]">
                      {['Tavolo', 'Cliente', ...(userRole === 'admin' ? ['PR'] : []), 'Pax', 'Budget', 'Stato', ''].map((h, i) => (
                        <th key={i} className="px-6 py-3 text-xs font-medium text-[#8E8E93]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(res => (
                      <tr key={res.id} className="border-b border-[#1d1b19] hover:bg-white/[0.015] transition-colors group">
                        <td className="px-6 py-3.5">
                          <span className="hv font-black text-sm text-white">{res.tableName ?? res.tableId}</span>
                        </td>
                        <td className="px-6 py-3.5">
                          <p className="text-sm text-white font-sans">{res.customerName}</p>
                          {res.customerPhone && <p className="text-[9px] font-sans text-[#8E8E93] mt-0.5">{res.customerPhone}</p>}
                        </td>
                        {userRole === 'admin' && (
                          <td className="px-6 py-3.5">
                            <span className="text-[10px] font-sans text-[#8E8E93]">{res.prName}</span>
                          </td>
                        )}
                        <td className="px-6 py-3.5">
                          <span className="text-sm font-sans text-[#aaa]">{res.guestsCount}</span>
                        </td>
                        <td className="px-6 py-3.5">
                          {res.checkedIn && res.actualBudget && res.actualBudget !== res.budget ? (
                            <div>
                              <span className="hv font-black text-sm text-accent">€{res.actualBudget}</span>
                              <span className="text-[9px] font-sans text-green-400 ml-1">+€{res.actualBudget - res.budget}</span>
                            </div>
                          ) : (
                            <span className="hv font-black text-sm text-accent">€{res.budget}</span>
                          )}
                        </td>
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            {approvalBadge(res.approvalStatus)}
                            {res.checkedIn && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                                <CheckCircle2 size={9}/> Entrato{res.actualPeople ? ` · ${res.actualPeople}` : ''}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-3.5">
                          {userRole === 'pr' && res.approvalStatus === 'pending' && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => onEdit?.(res)}
                                className="w-7 h-7 flex items-center justify-center text-[#8E8E93] hover:text-accent transition-colors">
                                <Pencil size={12} />
                              </button>
                              <button onClick={() => onDelete?.(res.id)}
                                className="w-7 h-7 flex items-center justify-center text-[#8E8E93] hover:text-red-400 transition-colors">
                                <Trash2 size={12} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
