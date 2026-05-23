import React, { useState } from 'react';
import { CheckCircle2, XCircle, CheckCheck } from 'lucide-react';
import { Reservation, ManagedUser } from '../../types';
import { cn } from '../../lib/utils';

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

  // Conferma a due step: il primo click "arma", il secondo esegue. id univoco per riga, 'all' per il bulk.
  const [confirmReject, setConfirmReject] = useState<string | null>(null);
  const [confirmAll, setConfirmAll] = useState(false);

  const armOrReject = (id: string, action: () => void) => {
    if (confirmReject === id) { action(); setConfirmReject(null); }
    else setConfirmReject(id);
  };
  const armOrApproveAll = () => {
    if (confirmAll) { pendingResv.forEach(r => onApproveReservation(r.id)); setConfirmAll(false); }
    else setConfirmAll(true);
  };

  if (totalPending === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
        <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 flex items-center justify-center rounded-2xl">
          <CheckCheck size={28} className="text-green-400" />
        </div>
        <p className="font-bold text-2xl text-white">Tutto in ordine</p>
        <p className="text-sm text-[#8E8E93]">Nessun elemento in attesa di approvazione</p>
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
              <span className="bg-accent text-black text-[8px] hv font-black px-2 py-0.5 leading-none rounded-full">
                {pendingResv.length}
              </span>
            </div>
            <button
              onClick={armOrApproveAll}
              onBlur={() => setConfirmAll(false)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors',
                confirmAll
                  ? 'bg-white text-black ring-2 ring-accent'
                  : 'bg-accent text-black hover:bg-white'
              )}
            >
              <CheckCheck size={12} /> {confirmAll ? `Confermi? (${pendingResv.length})` : 'Approva tutte'}
            </button>
          </div>
          <div className="space-y-2">
            {pendingResv.map(r => (
              <div
                key={r.id}
                className="flex items-center justify-between p-5 bg-[#1C1C1E] border border-[#2C2C2E] hover:border-[#48484A] transition-colors gap-4 rounded-xl"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-semibold text-white text-sm">{r.customerName}</span>
                    <span className="text-xs font-medium text-[#AEAEB2] border border-[#3A3A3C] rounded-full px-2 py-0.5">
                      Tav. {r.tableName ?? r.tableId}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    <p className="text-[9px] font-sans text-[#8E8E93]">PR: {r.prName}</p>
                    <p className="text-[9px] font-sans text-[#8E8E93]">{r.guestsCount} pax</p>
                    <p className="text-[9px] font-sans text-accent">€{r.budget}</p>
                    {r.bottles && <p className="text-[9px] font-sans text-[#636366]">{r.bottles}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onApproveReservation(r.id)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-semibold hover:bg-green-500/20 transition-colors"
                  >
                    <CheckCircle2 size={12} /> Approva
                  </button>
                  <button
                    onClick={() => armOrReject(`res_${r.id}`, () => onRejectReservation(r.id))}
                    onBlur={() => setConfirmReject(null)}
                    className={cn(
                      'flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-semibold transition-colors',
                      confirmReject === `res_${r.id}`
                        ? 'bg-red-500/25 text-red-300 border-red-500/50'
                        : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                    )}
                  >
                    <XCircle size={12} /> {confirmReject === `res_${r.id}` ? 'Confermi?' : 'Rifiuta'}
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
                className="flex items-center justify-between p-5 bg-[#1C1C1E] border border-[#2C2C2E] hover:border-[#48484A] transition-colors gap-4 rounded-xl"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-9 h-9 bg-[#2C2C2E] border border-[#3A3A3C] flex items-center justify-center shrink-0 rounded-xl">
                    <span className="hv font-black text-[#AEAEB2] text-xs">
                      {u.displayName.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-white text-[13px]">{u.displayName} {u.lastName}</p>
                    <p className="text-[9px] font-sans text-[#AEAEB2] mt-0.5">{u.email}</p>
                    <p className="text-xs text-[#636366] mt-0.5">
                      {new Date(u.createdAt).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onApproveUser(u.id)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-semibold hover:bg-green-500/20 transition-colors"
                  >
                    <CheckCircle2 size={12} /> Approva
                  </button>
                  <button
                    onClick={() => armOrReject(`user_${u.id}`, () => onRejectUser(u.id))}
                    onBlur={() => setConfirmReject(null)}
                    className={cn(
                      'flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-semibold transition-colors',
                      confirmReject === `user_${u.id}`
                        ? 'bg-red-500/25 text-red-300 border-red-500/50'
                        : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                    )}
                  >
                    <XCircle size={12} /> {confirmReject === `user_${u.id}` ? 'Confermi?' : 'Rifiuta'}
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
