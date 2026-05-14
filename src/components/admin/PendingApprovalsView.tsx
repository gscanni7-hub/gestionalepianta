import React from 'react';
import { CheckCircle2, XCircle, CheckCheck } from 'lucide-react';
import { Reservation, ManagedUser } from '../../types';

interface Props {
  reservations: Reservation[];
  managedUsers: ManagedUser[];
  onApproveReservation: (id: string) => void;
  onRejectReservation: (id: string) => void;
  onApproveUser: (id: string) => void;
  onRejectUser: (id: string) => void;
}

export default function PendingApprovalsView({
  reservations,
  managedUsers,
  onApproveReservation,
  onRejectReservation,
  onApproveUser,
  onRejectUser,
}: Props) {
  const pendingResv = reservations.filter(r => r.approvalStatus === 'pending');
  const pendingUsers = managedUsers.filter(u => u.status === 'pending');
  const totalPending = pendingResv.length + pendingUsers.length;

  if (totalPending === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
        <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 flex items-center justify-center">
          <CheckCheck size={28} className="text-green-400" />
        </div>
        <p className="hv font-black text-2xl uppercase text-white tracking-tight">Tutto in ordine</p>
        <p className="text-[9px] font-sans uppercase tracking-[0.4em] text-[#555]">Nessun elemento in attesa di approvazione</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Prenotazioni tavolo in attesa */}
      {pendingResv.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-sans uppercase tracking-[0.4em] text-accent font-bold">
                Prenotazioni tavolo in attesa
              </span>
              <span className="bg-accent text-black text-[8px] hv font-black px-2 py-0.5 leading-none">
                {pendingResv.length}
              </span>
            </div>
            <button
              onClick={() => pendingResv.forEach(r => onApproveReservation(r.id))}
              className="flex items-center gap-2 px-4 py-2 bg-accent text-black text-[9px] hv font-black uppercase tracking-widest hover:bg-white transition-colors"
            >
              <CheckCheck size={12} /> Approva tutte
            </button>
          </div>
          <div className="space-y-2">
            {pendingResv.map(r => (
              <div
                key={r.id}
                className="flex items-center justify-between p-5 bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#333] transition-colors gap-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="hv font-black uppercase text-white text-sm">{r.customerName}</span>
                    <span className="text-[8px] font-sans uppercase tracking-widest text-[#888] border border-[#383838] px-2 py-0.5">
                      Tav. {r.tableName ?? r.tableId}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    <p className="text-[9px] font-sans text-[#777]">PR: {r.prName}</p>
                    <p className="text-[9px] font-sans text-[#777]">{r.guestsCount} pax</p>
                    <p className="text-[9px] font-sans text-accent">€{r.budget}</p>
                    {r.bottles && <p className="text-[9px] font-sans text-[#666]">{r.bottles}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onApproveReservation(r.id)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-green-500/10 text-green-400 border border-green-500/20 text-[9px] hv font-black uppercase tracking-widest hover:bg-green-500/20 transition-colors"
                  >
                    <CheckCircle2 size={12} /> Approva
                  </button>
                  <button
                    onClick={() => onRejectReservation(r.id)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 text-[9px] hv font-black uppercase tracking-widest hover:bg-red-500/20 transition-colors"
                  >
                    <XCircle size={12} /> Rifiuta
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Account PR in attesa */}
      {pendingUsers.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[9px] font-sans uppercase tracking-[0.4em] text-accent font-bold">
              Account PR in attesa
            </span>
            <span className="bg-accent text-black text-[8px] hv font-black px-2 py-0.5 leading-none">
              {pendingUsers.length}
            </span>
          </div>
          <div className="space-y-2">
            {pendingUsers.map(u => (
              <div
                key={u.id}
                className="flex items-center justify-between p-5 bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#333] transition-colors gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-9 h-9 bg-[#2a2a2a] border border-[#383838] flex items-center justify-center shrink-0">
                    <span className="hv font-black text-[#888] text-xs">
                      {u.displayName.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="hv font-black uppercase text-white text-[11px]">{u.displayName} {u.lastName}</p>
                    <p className="text-[9px] font-sans text-[#888] mt-0.5">{u.email}</p>
                    <p className="text-[8px] font-sans text-[#666] uppercase tracking-widest mt-0.5">
                      {new Date(u.createdAt).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onApproveUser(u.id)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-green-500/10 text-green-400 border border-green-500/20 text-[9px] hv font-black uppercase tracking-widest hover:bg-green-500/20 transition-colors"
                  >
                    <CheckCircle2 size={12} /> Approva
                  </button>
                  <button
                    onClick={() => onRejectUser(u.id)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 text-[9px] hv font-black uppercase tracking-widest hover:bg-red-500/20 transition-colors"
                  >
                    <XCircle size={12} /> Rifiuta
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
