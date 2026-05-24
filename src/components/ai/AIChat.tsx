import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Loader2, MessageCircle } from 'lucide-react';
import { UserProfile, Event, Venue, Reservation, ManagedUser } from '../../types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Props {
  user: UserProfile;
  events: Event[];
  venues: Venue[];
  reservations: Reservation[];
  managedUsers: ManagedUser[];
  pendingCount: number;
}

function buildSystemPrompt(
  user: UserProfile,
  events: Event[],
  venues: Venue[],
  reservations: Reservation[],
  managedUsers: ManagedUser[],
  pendingCount: number,
): string {
  const now = new Date();
  const dateStr = now.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

  const activeEvents = events.filter(e => e.status === 'active');
  const activeIds = new Set(activeEvents.map(e => e.id));
  const activeRes = reservations.filter(r => activeIds.has(r.eventId));
  const approvedRes = activeRes.filter(r => r.approvalStatus === 'approved');
  const pendingRes = reservations.filter(r => r.approvalStatus === 'pending');
  const checkedIn = approvedRes.filter(r => r.checkedIn).length;
  const revenueEst = approvedRes.reduce((s, r) => s + (r.actualBudget ?? r.budget), 0);

  const totalTables = activeEvents.reduce((sum, ev) => {
    const venue = venues.find(v => v.id === ev.venueId);
    const fp = venue?.floorPlans.find(f => f.id === ev.floorPlanId) ?? venue?.floorPlans[0];
    return sum + (fp?.tables.filter(t => !t.isFixture).length ?? 0);
  }, 0);
  const occupancy = totalTables > 0 ? Math.round((approvedRes.length / totalTables) * 100) : 0;

  const eventsDetail = activeEvents.map(ev => {
    const venue = venues.find(v => v.id === ev.venueId);
    const evRes = approvedRes.filter(r => r.eventId === ev.id);
    const evPending = pendingRes.filter(r => r.eventId === ev.id);
    const evRevenue = evRes.reduce((s, r) => s + (r.actualBudget ?? r.budget), 0);
    const fp = venue?.floorPlans.find(f => f.id === ev.floorPlanId) ?? venue?.floorPlans[0];
    const tables = fp?.tables.filter(t => !t.isFixture).length ?? 0;
    return `- ${ev.name} @ ${venue?.name ?? '?'} | Tavoli: ${evRes.length}/${tables} (${Math.round((evRes.length / Math.max(tables, 1)) * 100)}%) | In attesa: ${evPending.length} | Incasso est: €${evRevenue} | Check-in: ${evRes.filter(r => r.checkedIn).length}`;
  }).join('\n');

  const prList = managedUsers.filter(u => u.role === 'pr' && u.status === 'approved');
  const prDetail = prList.map(pr => {
    const prRes = approvedRes.filter(r => r.prId === pr.id);
    const prRevenue = prRes.reduce((s, r) => s + (r.actualBudget ?? r.budget), 0);
    return `- ${pr.displayName} ${pr.lastName}: ${prRes.length} tavoli approvati, €${prRevenue} stimato`;
  }).join('\n');

  const pendingDetail = pendingRes.slice(0, 10).map(r => {
    const ev = events.find(e => e.id === r.eventId);
    return `- ${r.customerName} → ${r.tableName ?? r.tableId} (PR: ${r.prName}, ${r.guestsCount} pers., €${r.budget})${ev ? ` [${ev.name}]` : ''}`;
  }).join('\n');

  return `Sei l'assistente AI di Nightplan Management, la piattaforma di gestione tavoli per locali notturni.
Stai parlando con ${user.displayName}, admin del sistema.
Data e ora: ${dateStr}, ${timeStr}.

SITUAZIONE ATTUALE:
- Serate attive: ${activeEvents.length}
- Tavoli prenotati (approvati): ${approvedRes.length}/${totalTables} (${occupancy}% occupancy)
- Check-in effettuati: ${checkedIn}
- Incasso stimato totale: €${revenueEst.toLocaleString('it-IT')}
- Prenotazioni in attesa di approvazione: ${pendingCount}

SERATE ATTIVE:
${eventsDetail || '(nessuna serata attiva)'}

TEAM PR:
${prDetail || '(nessun PR attivo)'}

PRENOTAZIONI IN ATTESA (prime 10):
${pendingDetail || '(nessuna prenotazione in attesa)'}

ISTRUZIONI:
- Rispondi SEMPRE in italiano, in modo conciso e diretto.
- Usa i dati qui sopra per rispondere con numeri precisi.
- Se l'utente chiede qualcosa che non puoi sapere dai dati forniti, dillo chiaramente.
- Non inventare dati che non hai.
- Sei un assistente operativo: risposte brevi, dirette, utili. Niente formalismi.`;
}

async function callClaude(messages: Message[], systemPrompt: string): Promise<string> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('Chiave VITE_ANTHROPIC_API_KEY non configurata nel file .env');

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `Errore API ${res.status}`);
  }

  const data = await res.json();
  return data.content[0]?.text ?? '';
}

const SUGGESTIONS = [
  'Com\'è la situazione stasera?',
  'Quante prenotazioni in attesa?',
  'Chi sono i PR più attivi?',
  'Qual è l\'incasso stimato?',
];

export default function AIChat({ user, events, venues, reservations, managedUsers, pendingCount }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 120);
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setInput('');
    setError(null);

    const newMessages: Message[] = [...messages, { role: 'user', content: trimmed }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const systemPrompt = buildSystemPrompt(user, events, venues, reservations, managedUsers, pendingCount);
      const reply = await callClaude(newMessages, systemPrompt);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err: any) {
      setError(err.message ?? 'Errore durante la risposta');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3 pointer-events-none">

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="pointer-events-auto w-[340px] flex flex-col bg-[#161412]/85 backdrop-blur-2xl border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.7)]"
            style={{ maxHeight: '480px', borderRadius: 12 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#1d1b19] shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 flex items-center justify-center bg-accent/10 rounded-md">
                  <Sparkles size={12} className="text-accent" />
                </div>
                <div>
                  <p className="text-[11px] font-black hv uppercase tracking-widest text-white">Assistente AI</p>
                  <p className="text-[8px] font-sans text-[#636366] uppercase tracking-widest -mt-0.5">Nightplan</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-6 h-6 flex items-center justify-center text-[#636366] hover:text-white transition-colors"
              >
                <X size={13} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0" style={{ maxHeight: 320 }}>
              {isEmpty && (
                <div className="space-y-4">
                  <p className="text-[10px] font-sans text-[#636366] text-center uppercase tracking-widest">
                    Ciao {user.displayName}, come posso aiutarti?
                  </p>
                  <div className="space-y-1.5">
                    {SUGGESTIONS.map(s => (
                      <button
                        key={s}
                        onClick={() => sendMessage(s)}
                        className="w-full text-left px-3 py-2 border border-[#1d1b19] hover:border-[#D4622A]/30 hover:bg-[#D4622A]/5 text-[10px] font-sans text-[#8E8E93] hover:text-white transition-all"
                        style={{ borderRadius: 6 }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] px-3 py-2 text-[11px] font-sans leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-accent text-black font-medium'
                        : 'bg-[#1d1b19] text-[#AEAEB2] border border-[#2d2a26]'
                    }`}
                    style={{ borderRadius: m.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px' }}
                  >
                    {m.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-[#1d1b19] border border-[#2d2a26] px-3 py-2 flex items-center gap-2" style={{ borderRadius: '12px 12px 12px 4px' }}>
                    <Loader2 size={10} className="text-accent animate-spin" />
                    <span className="text-[10px] font-sans text-[#636366]">Analisi in corso…</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-900/20 border border-red-500/20 px-3 py-2 text-[10px] font-sans text-red-400" style={{ borderRadius: 6 }}>
                  {error}
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="flex items-center gap-2 px-3 py-3 border-t border-[#1d1b19] shrink-0">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Chiedi qualcosa…"
                disabled={loading}
                className="flex-1 bg-[#1d1b19] border border-[#2d2a26] px-3 py-2 text-[11px] font-sans text-white placeholder-[#48484A] outline-none focus:border-[#3b3733] transition-colors disabled:opacity-50"
                style={{ borderRadius: 8 }}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="w-8 h-8 flex items-center justify-center bg-accent text-black hover:bg-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                style={{ borderRadius: 8 }}
              >
                <Send size={12} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileTap={{ scale: 0.92 }}
        className="pointer-events-auto w-12 h-12 flex items-center justify-center bg-accent text-black shadow-[0_8px_24px_rgba(212,98,42,0.4)] hover:bg-white transition-colors"
        style={{ borderRadius: 14 }}
        title="Assistente AI"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X size={18} />
            </motion.span>
          ) : (
            <motion.span key="s" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MessageCircle size={20} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
