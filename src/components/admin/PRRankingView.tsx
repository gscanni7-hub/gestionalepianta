import React from 'react';
import { ManagedUser, Reservation } from '../../types';

interface Props {
  managedUsers: ManagedUser[];
  reservations: Reservation[];
}

const MEDAL_COLORS: Record<number, string> = {
  1: '#FFD700',
  2: '#C0C0C0',
  3: '#CD7F32',
};

export default function PRRankingView({ managedUsers, reservations }: Props) {
  const prUsers = managedUsers.filter(u => u.role === 'pr' && u.status === 'approved');

  const ranked = prUsers
    .map(pr => {
      // Solo prenotazioni approvate: pending/rifiutate non devono gonfiare incasso e classifica.
      const res = reservations.filter(r => r.prId === pr.id && r.approvalStatus === 'approved');
      const totalPren = res.length;
      const totalPersone = res.reduce((s, r) => s + r.guestsCount, 0);
      const totalIncasso = res.reduce((s, r) => s + (r.actualBudget ?? r.budget), 0);
      return { pr, totalPren, totalPersone, totalIncasso };
    })
    .sort((a, b) => b.totalIncasso - a.totalIncasso);

  if (ranked.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-[9px] font-sans uppercase tracking-[0.4em] text-[#8E8E93]">Nessun PR attivo</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a8278] mb-4">Ranking PR · per incasso</p>
      <div className="border border-white/[0.07] bg-white/[0.018] overflow-hidden rounded-2xl">
        {/* Header */}
        <div className="grid grid-cols-[36px_1fr_64px_72px_92px] gap-0 px-5 py-3 border-b border-white/[0.07]">
          <span className="text-[10px] uppercase tracking-widest text-[#8a8278]">#</span>
          <span className="text-[10px] uppercase tracking-widest text-[#8a8278]">Nome</span>
          <span className="text-[10px] uppercase tracking-widest text-[#8a8278] text-right">Pren.</span>
          <span className="text-[10px] uppercase tracking-widest text-[#8a8278] text-right">Persone</span>
          <span className="text-[10px] uppercase tracking-widest text-[#8a8278] text-right">Incasso</span>
        </div>

        {/* Rows */}
        {ranked.map(({ pr, totalPren, totalPersone, totalIncasso }, idx) => {
          const rank = idx + 1;
          const medalColor = MEDAL_COLORS[rank];
          return (
            <div
              key={pr.id}
              className="grid grid-cols-[36px_1fr_64px_72px_92px] gap-0 px-5 py-4 items-center border-t border-white/[0.04] first:border-t-0 hover:bg-white/[0.02] transition-colors"
            >
              <div className="hv font-black text-base leading-none" style={{ color: medalColor ?? '#5a544c' }}>{rank}</div>

              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 flex items-center justify-center shrink-0 overflow-hidden rounded-xl"
                  style={{ border: `1px solid ${medalColor ? medalColor + '55' : 'rgba(255,255,255,.1)'}` }}>
                  {pr.profileImage
                    ? <img src={pr.profileImage} alt="" className="w-full h-full object-cover" />
                    : <span className="hv font-black text-xs" style={{ color: medalColor ?? '#D4622A' }}>{pr.displayName.slice(0, 2).toUpperCase()}</span>}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-[14px] text-white truncate">{pr.displayName} {pr.lastName}</p>
                  <p className="text-[10px] text-[#8a8278] truncate">{pr.email}</p>
                </div>
              </div>

              <div className="text-right"><span className="hv font-black text-sm text-white tabular-nums">{totalPren}</span></div>
              <div className="text-right"><span className="hv font-black text-sm text-white tabular-nums">{totalPersone}</span></div>
              <div className="text-right"><span className="hv font-black text-sm tabular-nums" style={{ color: medalColor ?? '#D4622A' }}>€{totalIncasso >= 1000 ? `${(totalIncasso / 1000).toFixed(1)}K` : totalIncasso}</span></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
