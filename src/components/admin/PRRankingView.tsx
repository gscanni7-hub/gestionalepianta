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
      const res = reservations.filter(r => r.prId === pr.id);
      const totalPren = res.length;
      const totalPersone = res.reduce((s, r) => s + r.guestsCount, 0);
      const totalIncasso = res.reduce((s, r) => s + (r.actualBudget ?? r.budget), 0);
      return { pr, totalPren, totalPersone, totalIncasso };
    })
    .sort((a, b) => b.totalIncasso - a.totalIncasso);

  if (ranked.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-[9px] font-sans uppercase tracking-[0.4em] text-[#555]">Nessun PR attivo</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-[9px] font-sans uppercase tracking-[0.4em] text-[#555] mb-5">Ranking PR — per incasso</p>
      <div className="border border-[#2a2a2a] overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[40px_1fr_80px_80px_100px] gap-0 px-5 py-3 bg-[#141414] border-b border-[#2a2a2a]">
          <span className="text-[8px] font-sans uppercase tracking-[0.3em] text-[#555]">#</span>
          <span className="text-[8px] font-sans uppercase tracking-[0.3em] text-[#555]">Nome</span>
          <span className="text-[8px] font-sans uppercase tracking-[0.3em] text-[#555] text-right">Pren.</span>
          <span className="text-[8px] font-sans uppercase tracking-[0.3em] text-[#555] text-right">Persone</span>
          <span className="text-[8px] font-sans uppercase tracking-[0.3em] text-[#555] text-right">Incasso</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-[#1e1e1e]">
          {ranked.map(({ pr, totalPren, totalPersone, totalIncasso }, idx) => {
            const rank = idx + 1;
            const medalColor = MEDAL_COLORS[rank];
            const isTop3 = rank <= 3;

            return (
              <div
                key={pr.id}
                className={`grid grid-cols-[40px_1fr_80px_80px_100px] gap-0 px-5 py-4 items-center transition-colors ${
                  isTop3 ? 'bg-[#1a1a1a]' : 'bg-[#111]'
                } hover:bg-white/[0.02]`}
                style={isTop3 ? { borderLeft: `2px solid ${medalColor}40` } : {}}
              >
                {/* Rank */}
                <div
                  className="hv font-black text-base leading-none"
                  style={{ color: medalColor ?? '#333' }}
                >
                  {rank}
                </div>

                {/* Name */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-8 h-8 flex items-center justify-center shrink-0 overflow-hidden"
                    style={{ border: `1px solid ${medalColor ? medalColor + '40' : '#2a2a2a'}` }}
                  >
                    {pr.profileImage
                      ? <img src={pr.profileImage} alt="" className="w-full h-full object-cover" />
                      : <span className="hv font-black text-xs" style={{ color: medalColor ?? '#D4622A' }}>
                          {pr.displayName.slice(0, 2).toUpperCase()}
                        </span>
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="hv font-black text-[11px] uppercase text-white truncate">
                      {pr.displayName} {pr.lastName}
                    </p>
                    <p className="text-[8px] font-sans text-[#555] truncate">{pr.email}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="text-right">
                  <span className="hv font-black text-sm text-white">{totalPren}</span>
                </div>
                <div className="text-right">
                  <span className="hv font-black text-sm text-white">{totalPersone}</span>
                </div>
                <div className="text-right">
                  <span className="hv font-black text-sm" style={{ color: medalColor ?? '#D4622A' }}>
                    €{totalIncasso >= 1000 ? `${(totalIncasso / 1000).toFixed(1)}K` : totalIncasso}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
