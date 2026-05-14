import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Map, Users, Link2, Copy, Check, Calendar, Clock,
  ChevronDown, CheckCircle2, XCircle, ArrowLeft, ExternalLink
} from 'lucide-react';
import { Event, Venue, Reservation, Registration } from '../../types';
import { getRegistrationsByEvent } from '../../lib/registrationService';
import { cn } from '../../lib/utils';

interface Props {
  event: Event;
  venue: Venue;
  reservations: Reservation[];
  onOpenPlan: () => void;
  onBack: () => void;
}

export default function EventDetailView({ event, venue, reservations, onOpenPlan, onBack }: Props) {
  const [tab, setTab] = useState<'tavoli' | 'registrazioni'>('tavoli');
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loadingReg, setLoadingReg] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const genericLink = event.registrationToken
    ? `${window.location.origin}/r/${event.registrationToken}`
    : null;

  useEffect(() => {
    if (tab !== 'registrazioni') return;
    setLoadingReg(true);
    getRegistrationsByEvent(event.id)
      .then(setRegistrations)
      .catch(() => setRegistrations([]))
      .finally(() => setLoadingReg(false));
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
        className="flex items-center gap-2 text-[#666] hover:text-accent transition-colors text-[10px] font-sans uppercase tracking-widest mb-6"
      >
        <ArrowLeft size={11} /> Torna agli eventi
      </button>

      {/* Cover image */}
      {event.coverImage && (
        <div className="h-40 overflow-hidden border border-[#2a2a2a] mb-6">
          <img src={event.coverImage} alt="" className="w-full h-full object-cover opacity-70" />
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-[#D4622A] mb-1">{venue.name}</p>
        <h1 className="hv font-black text-3xl uppercase text-white leading-tight">{event.name}</h1>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-1.5 text-[#555] text-[10px] font-mono capitalize">
            <Calendar size={11} /> {formattedDate}
          </div>
          {event.time && (
            <div className="flex items-center gap-1.5 text-[#555] text-[10px] font-mono">
              <Clock size={11} /> {event.time}
            </div>
          )}
          {event.maxCapacity && (
            <div className="flex items-center gap-1.5 text-[#555] text-[10px] font-mono">
              <Users size={11} /> Max {event.maxCapacity}
            </div>
          )}
        </div>
        {event.description && (
          <p className="text-[#555] text-xs mt-2">{event.description}</p>
        )}
      </div>

      {/* Link registrazione */}
      {genericLink && (
        <div className="border border-[#2a2a2a] bg-[#1a1a1a] p-4 mb-6 flex items-center gap-3">
          <Link2 size={13} className="text-[#D4622A] shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[8px] font-mono uppercase tracking-widest text-[#555] mb-0.5">Link registrazione generico</p>
            <p className="text-[9px] font-mono text-[#666] truncate">{genericLink}</p>
          </div>
          <button onClick={handleCopyLink}
            className={cn('p-2 border transition-colors shrink-0',
              copiedLink ? 'border-[#22C55E]/40 text-[#22C55E]' : 'border-[#2a2a2a] text-[#666] hover:text-white'
            )}>
            {copiedLink ? <Check size={13} /> : <Copy size={13} />}
          </button>
          <a href={genericLink} target="_blank" rel="noopener noreferrer"
            className="p-2 border border-[#2a2a2a] text-[#666] hover:text-white transition-colors shrink-0">
            <ExternalLink size={13} />
          </a>
        </div>
      )}

      {/* CTA pianta */}
      <button
        onClick={onOpenPlan}
        className="w-full flex items-center justify-center gap-2 bg-[#D4622A] text-black py-3.5 font-black uppercase tracking-widest text-xs hover:bg-white transition-colors mb-6"
        style={{ fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif' }}
      >
        <Map size={14} /> Apri Pianta
      </button>

      {/* Tabs */}
      <div className="flex border border-[#2a2a2a] mb-5">
        {(['tavoli', 'registrazioni'] as const).map(t => (
          <button key={t}
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 py-3 text-[9px] hv font-black uppercase tracking-widest transition-colors relative',
              tab === t ? 'bg-[#D4622A] text-black' : 'text-[#555] hover:text-white'
            )}
          >
            {t === 'tavoli' ? `Tavoli (${approvedRes.length})` : `Registrazioni (${registrations.length})`}
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
              { label: 'In attesa', value: pendingRes.length, color: pendingRes.length > 0 ? 'text-[#F59E0B]' : 'text-[#555]' },
              { label: 'Entrati', value: checkedInRes.length, color: 'text-[#22C55E]' },
            ].map(s => (
              <div key={s.label} className="border border-[#2a2a2a] bg-[#1a1a1a] p-3 text-center">
                <div className={cn('hv font-black text-2xl leading-none', s.color)}>{s.value}</div>
                <div className="text-[8px] font-mono uppercase tracking-widest text-[#555] mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {approvedRes.length === 0 && pendingRes.length === 0 ? (
            <div className="py-16 text-center border border-[#2a2a2a]">
              <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-[#444]">Nessuna prenotazione</p>
            </div>
          ) : (
            <div className="border border-[#2a2a2a] overflow-hidden">
              {[...approvedRes, ...pendingRes].map(res => (
                <div key={res.id} className="flex items-center gap-4 px-4 py-3 border-b border-[#1e1e1e] last:border-0">
                  <div className={cn('w-2 h-2 rounded-full shrink-0',
                    res.checkedIn ? 'bg-[#22C55E]' : res.approvalStatus === 'approved' ? 'bg-[#D4622A]' : 'bg-[#F59E0B]'
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{res.customerName}</p>
                    <p className="text-[9px] font-mono text-[#555]">
                      Tav. {res.tableName ?? res.tableId} · PR {res.prName} · {res.guestsCount} pers.
                    </p>
                  </div>
                  <p className="text-[9px] font-mono text-[#555] shrink-0">€{res.actualBudget ?? res.budget}</p>
                </div>
              ))}
            </div>
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
          ) : (
            <>
              {/* Mini stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Totale', value: registrations.length, color: 'text-white' },
                  { label: 'Da PR', value: regFromPr.length, color: 'text-[#D4622A]' },
                  { label: 'Entrati', value: regCheckedIn.length, color: 'text-[#22C55E]' },
                ].map(s => (
                  <div key={s.label} className="border border-[#2a2a2a] bg-[#1a1a1a] p-3 text-center">
                    <div className={cn('hv font-black text-2xl leading-none', s.color)}>{s.value}</div>
                    <div className="text-[8px] font-mono uppercase tracking-widest text-[#555] mt-1">{s.label}</div>
                  </div>
                ))}
              </div>

              {registrations.length === 0 ? (
                <div className="py-16 text-center border border-[#2a2a2a]">
                  <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-[#444]">Nessuna registrazione ancora</p>
                </div>
              ) : (
                <div className="border border-[#2a2a2a] overflow-hidden">
                  {registrations.map(reg => (
                    <div key={reg.id} className="flex items-center gap-4 px-4 py-3 border-b border-[#1e1e1e] last:border-0">
                      <div className={cn('w-2 h-2 rounded-full shrink-0', reg.checkedIn ? 'bg-[#22C55E]' : 'bg-[#2e2e2e]')} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">
                          {reg.firstName} {reg.lastName}
                        </p>
                        <p className="text-[9px] font-mono text-[#555]">
                          {reg.guestsCount} pers.
                          {reg.prName ? ` · PR ${reg.prName}` : ' · Link generico'}
                          {reg.checkedIn && <span className="text-[#22C55E] ml-1">· Entrato</span>}
                        </p>
                      </div>
                      <div className={cn('text-[8px] font-mono uppercase shrink-0',
                        reg.prId ? 'text-[#D4622A]' : 'text-[#555]'
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
    </div>
  );
}
