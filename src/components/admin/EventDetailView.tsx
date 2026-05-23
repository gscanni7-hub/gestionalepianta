import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Map, Users, Link2, Copy, Check, Calendar, Clock,
  ChevronDown, CheckCircle2, XCircle, ArrowLeft, ExternalLink, AlertCircle
} from 'lucide-react';
import { Event, Venue, Reservation, Registration, ManagedUser } from '../../types';
import { getRegistrationsByEvent } from '../../lib/registrationService';
import { cn } from '../../lib/utils';
import IngressiView from '../host/IngressiView';

interface Props {
  event: Event;
  venue: Venue;
  reservations: Reservation[];
  prUsers: ManagedUser[];
  onApproveReservation: (id: string) => void;
  onRejectReservation: (id: string) => void;
  onUpdateEvent: (patch: Partial<Event>) => void;
  onOpenPlan: () => void;
  onBack: () => void;
}

export default function EventDetailView({ event, venue, reservations, prUsers, onApproveReservation, onRejectReservation, onUpdateEvent, onOpenPlan, onBack }: Props) {
  const [tab, setTab] = useState<'tavoli' | 'approva' | 'registrazioni' | 'ingresso'>('tavoli');
  const [confirmReject, setConfirmReject] = useState<string | null>(null);
  const [showVisibility, setShowVisibility] = useState(false);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loadingReg, setLoadingReg] = useState(false);
  const [regError, setRegError] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const genericLink = event.registrationToken
    ? `${window.location.origin}/r/${event.registrationToken}`
    : null;

  const loadRegistrations = () => {
    setLoadingReg(true);
    setRegError(false);
    getRegistrationsByEvent(event.id)
      .then(setRegistrations)
      .catch(() => { setRegistrations([]); setRegError(true); })
      .finally(() => setLoadingReg(false));
  };

  useEffect(() => {
    if (tab !== 'registrazioni') return;
    loadRegistrations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, event.id]);

  const handleCopyLink = () => {
    if (!genericLink) return;
    navigator.clipboard.writeText(genericLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const formattedDate = new Date(event.date).toLocaleDateString('it-IT', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const approvedRes = reservations.filter(r => r.eventId === event.id && r.approvalStatus === 'approved');
  const pendingRes = reservations.filter(r => r.eventId === event.id && r.approvalStatus === 'pending');
  const checkedInRes = approvedRes.filter(r => r.checkedIn);

  const regCheckedIn = registrations.filter(r => r.checkedIn);
  const regGeneric = registrations.filter(r => !r.prId);
  const regFromPr = registrations.filter(r => r.prId);

  return (
    <div>
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-[#636366] hover:text-accent transition-colors text-sm font-medium mb-6"
      >
        <ArrowLeft size={11} /> Torna agli eventi
      </button>

      {/* Cover image */}
      {event.coverImage && (
        <div className="h-40 overflow-hidden border border-[#2C2C2E] mb-6 rounded-xl">
          <img src={event.coverImage} alt="" className="w-full h-full object-cover opacity-70" />
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-[#D4622A] mb-1">{venue.name}</p>
        <h1 className="font-bold text-3xl text-white leading-tight">{event.name}</h1>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-1.5 text-[#8E8E93] text-[10px] font-mono capitalize">
            <Calendar size={11} /> {formattedDate}
          </div>
          {event.time && (
            <div className="flex items-center gap-1.5 text-[#8E8E93] text-[10px] font-mono">
              <Clock size={11} /> {event.time}
            </div>
          )}
          {event.maxCapacity && (
            <div className="flex items-center gap-1.5 text-[#8E8E93] text-[10px] font-mono">
              <Users size={11} /> Max {event.maxCapacity}
            </div>
          )}
        </div>
        {event.description && (
          <p className="text-[#8E8E93] text-xs mt-2">{event.description}</p>
        )}
      </div>

      {/* Link registrazione */}
      {genericLink && (
        <div className="border border-[#2C2C2E] bg-[#1C1C1E] p-4 mb-6 flex items-center gap-3 rounded-xl">
          <Link2 size={13} className="text-[#D4622A] shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-[#8E8E93] mb-0.5">Link registrazione generico</p>
            <p className="text-[9px] font-mono text-[#636366] truncate">{genericLink}</p>
          </div>
          <button onClick={handleCopyLink}
            className={cn('p-2 border transition-colors shrink-0 rounded-lg',
              copiedLink ? 'border-[#22C55E]/40 text-[#22C55E]' : 'border-[#2C2C2E] text-[#636366] hover:text-white'
            )}>
            {copiedLink ? <Check size={13} /> : <Copy size={13} />}
          </button>
          <a href={genericLink} target="_blank" rel="noopener noreferrer"
            className="p-2 border border-[#2C2C2E] text-[#636366] hover:text-white transition-colors shrink-0 rounded-lg">
            <ExternalLink size={13} />
          </a>
        </div>
      )}

      {/* CTA pianta */}
      <button
        onClick={onOpenPlan}
        className="w-full flex items-center justify-center gap-2 bg-[#D4622A] text-black py-3.5 text-sm font-semibold rounded-xl hover:bg-white transition-colors mb-6"
      >
        <Map size={14} /> Apri Pianta
      </button>

      {/* Visibilità — richiudibile, modifiche immediate */}
      <div className="border border-[#2C2C2E] rounded-xl mb-6 overflow-hidden">
        <button
          onClick={() => setShowVisibility(o => !o)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors text-left"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Users size={14} className="text-[#D4622A] shrink-0" />
            <span className="text-sm font-semibold text-white shrink-0">Visibilità</span>
            <span className="text-[10px] text-[#636366] truncate">
              {event.visibleToHost !== false ? 'Ingresso attivo' : 'Ingresso spento'}
              {' · '}
              {event.assignedPrIds === undefined ? 'Tutti i PR' : `${event.assignedPrIds.length} PR`}
            </span>
          </div>
          <ChevronDown size={14} className={cn('text-[#8E8E93] shrink-0 transition-transform', showVisibility && 'rotate-180')} />
        </button>
        <AnimatePresence>
          {showVisibility && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
              <div className="px-4 pb-4 pt-1 space-y-3 border-t border-[#1C1C1E]">
                {/* Host */}
                <label className="flex items-center justify-between bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl px-4 py-3 cursor-pointer">
                  <span className="text-sm text-white">Attiva per l'ingresso</span>
                  <input type="checkbox" checked={event.visibleToHost !== false}
                    onChange={e => onUpdateEvent({ visibleToHost: e.target.checked })}
                    className="w-4 h-4 accent-[#D4622A]" />
                </label>

                {/* PR */}
                <label className="flex items-center justify-between bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl px-4 py-3 cursor-pointer">
                  <span className="text-sm text-white">Tutti i PR</span>
                  <input type="checkbox" checked={event.assignedPrIds === undefined}
                    onChange={e => onUpdateEvent({ assignedPrIds: e.target.checked ? undefined : [] })}
                    className="w-4 h-4 accent-[#D4622A]" />
                </label>
                {event.assignedPrIds !== undefined && (
                  <div className="space-y-1 max-h-44 overflow-y-auto border border-[#2C2C2E] rounded-xl p-2">
                    {prUsers.length === 0 ? (
                      <p className="text-xs text-[#636366] px-2 py-3 text-center">Nessun PR approvato</p>
                    ) : (
                      prUsers.map(pr => {
                        const ids = event.assignedPrIds ?? [];
                        const checked = ids.includes(pr.id);
                        return (
                          <label key={pr.id} className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/[0.03] cursor-pointer">
                            <input type="checkbox" checked={checked}
                              onChange={() => onUpdateEvent({ assignedPrIds: checked ? ids.filter(x => x !== pr.id) : [...ids, pr.id] })}
                              className="w-4 h-4 accent-[#D4622A]" />
                            <span className="text-sm text-[#AEAEB2]">{pr.displayName} {pr.lastName}</span>
                          </label>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tabs */}
      <div className="flex border border-[#2C2C2E] mb-5 rounded-xl overflow-x-auto">
        {(['tavoli', 'approva', 'registrazioni', 'ingresso'] as const).map(t => (
          <button key={t}
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 min-w-[84px] py-3 text-xs sm:text-sm font-semibold transition-colors relative whitespace-nowrap',
              tab === t ? 'bg-[#D4622A] text-black' : 'text-[#8E8E93] hover:text-white'
            )}
          >
            {t === 'tavoli'
              ? `Tavoli (${approvedRes.length})`
              : t === 'approva'
              ? `Approva${pendingRes.length > 0 ? ` (${pendingRes.length})` : ''}`
              : t === 'registrazioni'
              ? `Registrazioni (${registrations.length})`
              : 'Ingresso'}
            {t === 'approva' && pendingRes.length > 0 && tab !== 'approva' && (
              <span className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
            )}
          </button>
        ))}
      </div>

      {/* Tab: Tavoli */}
      {tab === 'tavoli' && (
        <div className="space-y-4">
          {/* Mini stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Prenotati', value: approvedRes.length, color: 'text-white' },
              { label: 'In attesa', value: pendingRes.length, color: pendingRes.length > 0 ? 'text-[#F59E0B]' : 'text-[#8E8E93]' },
              { label: 'Entrati', value: checkedInRes.length, color: 'text-[#22C55E]' },
            ].map(s => (
              <div key={s.label} className="border border-[#2C2C2E] bg-[#1C1C1E] p-3 text-center rounded-xl">
                <div className={cn('hv font-black text-2xl leading-none', s.color)}>{s.value}</div>
                <div className="text-xs text-[#8E8E93] mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {approvedRes.length === 0 && pendingRes.length === 0 ? (
            <div className="py-16 text-center border border-[#2C2C2E] rounded-xl">
              <p className="text-sm text-[#636366]">Nessuna prenotazione</p>
            </div>
          ) : (
            <div className="border border-[#2C2C2E] overflow-hidden">
              {[...approvedRes, ...pendingRes].map(res => (
                <div key={res.id} className="flex items-center gap-4 px-4 py-3 border-b border-[#1C1C1E] last:border-0">
                  <div className={cn('w-2 h-2 rounded-full shrink-0',
                    res.checkedIn ? 'bg-[#22C55E]' : res.approvalStatus === 'approved' ? 'bg-[#D4622A]' : 'bg-[#F59E0B]'
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{res.customerName}</p>
                    <p className="text-[9px] font-mono text-[#8E8E93]">
                      Tav. {res.tableName ?? res.tableId} · PR {res.prName} · {res.guestsCount} pers.
                    </p>
                  </div>
                  <p className="text-[9px] font-mono text-[#8E8E93] shrink-0">€{res.actualBudget ?? res.budget}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Approva */}
      {tab === 'approva' && (
        <div className="space-y-2">
          {pendingRes.length === 0 ? (
            <div className="py-16 text-center border border-[#2C2C2E] rounded-xl flex flex-col items-center gap-3">
              <CheckCircle2 size={28} className="text-[#22C55E]" />
              <p className="text-sm text-[#8E8E93]">Nessuna prenotazione da approvare</p>
            </div>
          ) : (
            pendingRes.map(r => (
              <div key={r.id}
                className="flex items-center justify-between p-4 bg-[#1C1C1E] border border-[#2C2C2E] hover:border-[#48484A] transition-colors gap-4 rounded-xl">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-semibold text-white text-sm">{r.customerName}</span>
                    <span className="text-xs font-medium text-[#AEAEB2] border border-[#3A3A3C] rounded-full px-2 py-0.5">
                      Tav. {r.tableName ?? r.tableId}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                    <p className="text-[10px] text-[#8E8E93]">PR: {r.prName}</p>
                    <p className="text-[10px] text-[#8E8E93]">{r.guestsCount} pax</p>
                    <p className="text-[10px] text-[#D4622A]">€{r.budget}</p>
                    {r.bottles && <p className="text-[10px] text-[#636366]">{r.bottles}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onApproveReservation(r.id)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-semibold hover:bg-green-500/20 transition-colors">
                    <CheckCircle2 size={12} /> Approva
                  </button>
                  <button
                    onClick={() => {
                      if (confirmReject === r.id) { onRejectReservation(r.id); setConfirmReject(null); }
                      else setConfirmReject(r.id);
                    }}
                    onBlur={() => setConfirmReject(null)}
                    className={cn(
                      'flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-semibold transition-colors',
                      confirmReject === r.id
                        ? 'bg-red-500/25 text-red-300 border-red-500/50'
                        : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                    )}>
                    <XCircle size={12} /> {confirmReject === r.id ? 'Confermi?' : 'Rifiuta'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Registrazioni */}
      {tab === 'registrazioni' && (
        <div className="space-y-4">
          {loadingReg ? (
            <div className="py-12 flex justify-center">
              <div className="w-5 h-5 border-2 border-[#D4622A] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : regError ? (
            <div className="py-16 text-center flex flex-col items-center gap-4">
              <AlertCircle size={28} className="text-[#EF4444]" />
              <p className="text-sm text-[#8E8E93]">Impossibile caricare le registrazioni</p>
              <button onClick={loadRegistrations}
                className="px-5 py-2.5 rounded-xl bg-[#D4622A] text-black text-sm font-semibold hover:bg-white transition-colors">
                Riprova
              </button>
            </div>
          ) : (
            <>
              {/* Mini stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Totale', value: registrations.length, color: 'text-white' },
                  { label: 'Da PR', value: regFromPr.length, color: 'text-[#D4622A]' },
                  { label: 'Entrati', value: regCheckedIn.length, color: 'text-[#22C55E]' },
                ].map(s => (
                  <div key={s.label} className="border border-[#2C2C2E] bg-[#1C1C1E] p-3 text-center rounded-xl">
                    <div className={cn('hv font-black text-2xl leading-none', s.color)}>{s.value}</div>
                    <div className="text-xs text-[#8E8E93] mt-1">{s.label}</div>
                  </div>
                ))}
              </div>

              {registrations.length === 0 ? (
                <div className="py-16 text-center border border-[#2C2C2E] rounded-xl">
                  <p className="text-sm text-[#636366]">Nessuna registrazione ancora</p>
                </div>
              ) : (
                <div className="border border-[#2C2C2E] overflow-hidden rounded-xl">
                  {registrations.map(reg => (
                    <div key={reg.id} className="flex items-center gap-4 px-4 py-3 border-b border-[#1C1C1E] last:border-0">
                      <div className={cn('w-2 h-2 rounded-full shrink-0', reg.checkedIn ? 'bg-[#22C55E]' : 'bg-[#2C2C2E]')} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">
                          {reg.firstName} {reg.lastName}
                        </p>
                        <p className="text-[9px] font-mono text-[#8E8E93]">
                          {reg.guestsCount} pers.
                          {reg.prName ? ` · PR ${reg.prName}` : ' · Link generico'}
                          {reg.checkedIn && <span className="text-[#22C55E] ml-1">· Entrato</span>}
                        </p>
                      </div>
                      <div className={cn('text-[8px] font-mono uppercase shrink-0',
                        reg.prId ? 'text-[#D4622A]' : 'text-[#8E8E93]'
                      )}>
                        {reg.prId ? 'PR' : 'Gen.'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Tab: Ingresso */}
      {tab === 'ingresso' && (
        <IngressiView activeEvent={event} />
      )}
    </div>
  );
}
