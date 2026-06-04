import React, { useState } from 'react';
import { X, Plus, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Event, Reservation, Venue, FloorPlan, ManagedUser, PrGroup, BottleMenuItem } from '../../types';

/* ── Micro helper ────────────────────────────────────────── */
export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-[#8E8E93]">{label}</label>
      {children}
    </div>
  );
}

/* ── BottleMenuModal ─────────────────────────────────────── */
export function BottleMenuModal({ menu, onClose, onSave }: {
  menu: BottleMenuItem[];
  onClose: () => void;
  onSave: (m: BottleMenuItem[]) => void;
}) {
  const [items, setItems] = useState<BottleMenuItem[]>(() => menu.map(m => ({ ...m })));
  const update = (id: string, patch: Partial<BottleMenuItem>) =>
    setItems(prev => prev.map(it => it.id === id ? { ...it, ...patch } : it));
  const remove = (id: string) => setItems(prev => prev.filter(it => it.id !== id));
  const add = () => setItems(prev => [...prev, { id: `b_${Date.now()}`, name: '', price: 0 }]);
  const inp = "bg-bg border border-[#2d2a26] rounded-xl px-3 py-2.5 text-sm font-sans text-white placeholder-[#636366] outline-none focus:border-[#D4622A] transition-colors";

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="relative w-full sm:max-w-md bg-[#1d1b19]/80 backdrop-blur-2xl border-t border-x sm:border border-white/10 overflow-hidden rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
        <div className="h-[2px] bg-accent shrink-0" />
        <div className="px-6 sm:px-8 py-5 border-b border-[#2d2a26] flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-bold text-xl text-white">Listino bottiglie</h3>
            <p className="text-[11px] text-[#8E8E93] mt-0.5">Prezzi usati nelle prenotazioni</p>
          </div>
          <button onClick={onClose} className="text-[#AEAEB2] hover:text-white transition-colors p-1"><X size={18} /></button>
        </div>
        <div className="p-6 sm:p-8 space-y-2 overflow-y-auto">
          {items.length === 0 && (
            <p className="text-xs text-[#636366] text-center py-6 border border-[#2d2a26] rounded-xl">Nessuna bottiglia. Aggiungine una.</p>
          )}
          {items.map(it => (
            <div key={it.id} className="flex items-center gap-2">
              <input className={cn(inp, 'flex-1')} placeholder="Nome bottiglia"
                value={it.name} onChange={e => update(it.id, { name: e.target.value })} />
              <div className="relative w-24 shrink-0">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#636366] text-sm">€</span>
                <input type="number" min={0} className={cn(inp, 'w-full pl-7 tabular-nums')} placeholder="0"
                  value={it.price || ''} onChange={e => update(it.id, { price: parseInt(e.target.value) || 0 })} />
              </div>
              <button type="button" onClick={() => remove(it.id)}
                className="text-[#8E8E93] hover:text-red-500 transition-colors p-1 shrink-0"><X size={14} /></button>
            </div>
          ))}
          <button type="button" onClick={add}
            className="flex items-center gap-2 w-full py-2.5 border border-dashed border-[#2d2a26] text-[#8E8E93] hover:border-accent/50 hover:text-accent transition-colors text-[9px] hv font-black uppercase tracking-widest justify-center mt-1">
            <Plus size={11} /> Aggiungi bottiglia
          </button>
        </div>
        <div className="px-6 sm:px-8 py-4 border-t border-[#2d2a26] flex gap-3 shrink-0">
          <button type="button" onClick={onClose}
            className="flex-1 py-3 text-sm font-medium rounded-xl border border-[#2d2a26] text-[#8E8E93] hover:text-white hover:border-[#48484A] transition-all">Annulla</button>
          <button type="button" onClick={() => onSave(items.filter(it => it.name.trim()))}
            className="flex-1 py-3 text-sm font-semibold rounded-xl btn-primary">Salva listino</button>
        </div>
      </motion.div>
    </div>
  );
}

/* ── GroupEditorModal ────────────────────────────────────── */
export function GroupEditorModal({ group, prUsers, onClose, onSave }: {
  group: PrGroup | null;
  prUsers: ManagedUser[];
  onClose: () => void;
  onSave: (g: PrGroup) => void;
}) {
  const [name, setName] = useState(group?.name ?? '');
  const [prIds, setPrIds] = useState<string[]>(group?.prIds ?? []);
  const toggle = (id: string) =>
    setPrIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const canSave = name.trim().length > 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="relative w-full sm:max-w-md bg-[#1d1b19]/80 backdrop-blur-2xl border-t border-x sm:border border-white/10 overflow-hidden rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
        <div className="h-[2px] bg-accent shrink-0" />
        <div className="px-6 sm:px-8 py-5 border-b border-[#2d2a26] flex items-center justify-between shrink-0">
          <h3 className="font-bold text-xl text-white">{group ? 'Modifica gruppo' : 'Nuovo gruppo'}</h3>
          <button onClick={onClose} className="text-[#AEAEB2] hover:text-white transition-colors p-1"><X size={18} /></button>
        </div>
        <form className="p-6 sm:p-8 space-y-5 overflow-y-auto"
          onSubmit={(e) => { e.preventDefault(); if (!canSave) return; onSave({ id: group?.id ?? `g_${Date.now()}`, name: name.trim(), prIds }); }}>
          <Field label="Nome gruppo">
            <input required autoFocus placeholder="Es. Team Sabato"
              className="w-full bg-bg border border-[#3b3733] rounded-xl px-4 py-3 text-sm text-white placeholder-[#8E8E93] outline-none focus:border-[#D4622A] transition-colors"
              value={name} onChange={e => setName(e.target.value)} />
          </Field>
          <Field label={`Membri (${prIds.length})`}>
            {prUsers.length === 0 ? (
              <p className="text-xs text-[#636366] px-2 py-3 text-center border border-[#2d2a26] rounded-xl">Nessun PR approvato</p>
            ) : (
              <div className="space-y-1 max-h-60 overflow-y-auto border border-[#2d2a26] rounded-xl p-2">
                {prUsers.map(pr => (
                  <label key={pr.id} className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/[0.03] cursor-pointer">
                    <input type="checkbox" checked={prIds.includes(pr.id)} onChange={() => toggle(pr.id)}
                      className="w-4 h-4 accent-[#D4622A]" />
                    <span className="text-sm text-[#AEAEB2]">{pr.displayName} {pr.lastName}</span>
                  </label>
                ))}
              </div>
            )}
          </Field>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3.5 text-sm font-medium rounded-xl border border-[#2d2a26] text-[#8E8E93] hover:text-white hover:border-[#48484A] transition-all">
              Annulla
            </button>
            <button type="submit" disabled={!canSave}
              className={cn('flex-1 py-3.5 text-sm font-semibold rounded-xl transition-colors',
                canSave ? 'btn-primary' : 'bg-[#2d2a26] text-[#8E8E93] cursor-not-allowed')}>
              {group ? 'Salva' : 'Crea gruppo'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

/* ── ReservationQuickEditModal ───────────────────────────── */
export function ReservationQuickEditModal({ reservation, onClose, onSave }: {
  reservation: Reservation;
  onClose: () => void;
  onSave: (r: Reservation) => void;
}) {
  const [guests, setGuests] = useState(reservation.guestsCount);
  const [budget, setBudget] = useState(reservation.budget);
  const [bottles, setBottles] = useState(reservation.bottles);
  const [notes, setNotes] = useState(reservation.notes);

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
        className="relative w-full sm:max-w-md bg-[#1d1b19]/80 backdrop-blur-2xl border-t border-x sm:border border-white/10 overflow-hidden rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
        <div className="h-[2px] bg-accent shrink-0" />
        <div className="px-6 py-5 border-b border-[#2d2a26] flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-bold text-lg text-white">Modifica Prenotazione</h3>
            <p className="text-sm text-[#8E8E93] mt-0.5">{reservation.tableName} · {reservation.customerName}</p>
          </div>
          <button onClick={onClose} className="text-[#8E8E93] hover:text-white transition-colors"><X size={16} /></button>
        </div>
        <form className="p-6 space-y-4 overflow-y-auto" onSubmit={e => { e.preventDefault(); onSave({ ...reservation, guestsCount: guests, budget, bottles, notes }); }}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#636366] mb-2">N. Ospiti</label>
              <input type="number" min={1} value={guests} onChange={e => setGuests(Number(e.target.value))}
                className="w-full bg-[#121110] border border-[#3b3733] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-accent/40 transition-colors font-sans" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#636366] mb-2">Budget €</label>
              <input type="number" min={0} value={budget} onChange={e => setBudget(Number(e.target.value))}
                className="w-full bg-[#121110] border border-[#3b3733] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-accent/40 transition-colors font-sans" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#636366] mb-2">Bottiglie</label>
            <input value={bottles} onChange={e => setBottles(e.target.value)}
              placeholder="es. 2 vodka, 1 champagne"
              className="w-full bg-[#121110] border border-[#3b3733] px-4 py-3 text-sm text-white placeholder-[#636366] outline-none focus:border-accent/40 transition-colors font-sans" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#636366] mb-2">Note</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
              className="w-full bg-[#121110] border border-[#3b3733] rounded-xl px-4 py-3 text-sm text-white placeholder-[#636366] outline-none focus:border-accent/40 transition-colors font-sans resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 text-sm font-medium rounded-xl border border-[#2d2a26] text-[#8E8E93] hover:border-[#8E8E93] transition-colors">
              Annulla
            </button>
            <button type="submit"
              className="flex-1 py-3 text-sm font-semibold rounded-xl btn-primary">
              Salva
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

/* ── NewEventModal ───────────────────────────────────────── */
export function NewEventModal({ venue, floorPlans, prUsers, prGroups, onClose, onSubmit, initialData, prefill }: {
  venue: Venue;
  floorPlans: FloorPlan[];
  prUsers: ManagedUser[];
  prGroups: PrGroup[];
  onClose: () => void;
  onSubmit: (d: { name: string; date: string; time: string; endTime: string; description: string; coverImage: string; maxCapacity: number | undefined; floorPlanId: string; assignedPrIds: string[] | undefined; visibleToHost: boolean }, token?: string) => void;
  initialData?: Event;
  prefill?: Event;
}) {
  const isEdit = !!initialData;
  const seed = initialData ?? prefill;
  const today = new Date().toISOString().slice(0, 10);
  const minDate = initialData?.date && initialData.date < today ? initialData.date : today;
  const [form, setForm] = useState({
    name: initialData?.name ?? (prefill ? `${prefill.name} (copia)` : ''),
    date: initialData?.date ?? today,
    time: seed?.time ?? '22:00',
    endTime: seed?.endTime ?? '04:00',
    description: seed?.description ?? '',
    coverImage: seed?.coverImage ?? '',
    maxCapacity: seed?.maxCapacity ? String(seed.maxCapacity) : '',
    floorPlanId: seed?.floorPlanId ?? floorPlans[0]?.id ?? '',
  });
  const [assignAll, setAssignAll] = useState(seed ? seed.assignedPrIds === undefined : false);
  const [assignedPrIds, setAssignedPrIds] = useState<string[]>(seed?.assignedPrIds ?? []);
  const [visibleToHost, setVisibleToHost] = useState<boolean>(seed?.visibleToHost ?? isEdit);
  const togglePr = (id: string) =>
    setAssignedPrIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleGroup = (g: PrGroup) => {
    const allIn = g.prIds.length > 0 && g.prIds.every(id => assignedPrIds.includes(id));
    setAssignedPrIds(prev => allIn ? prev.filter(id => !g.prIds.includes(id)) : [...new Set([...prev, ...g.prIds])]);
  };
  const [createdLink, setCreatedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!createdLink) return;
    navigator.clipboard.writeText(createdLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="relative w-full sm:max-w-md bg-[#1d1b19]/80 backdrop-blur-2xl border-t border-x sm:border border-white/10 overflow-hidden rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
      >
        <div className="h-[2px] bg-accent shrink-0" />
        <div className="px-6 sm:px-8 py-5 sm:py-6 border-b border-[#2d2a26] flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-bold text-xl text-white">{isEdit ? 'Modifica Evento' : 'Nuovo Evento'}</h3>
            <p className="text-sm text-[#8E8E93] mt-1">{venue.name}</p>
          </div>
          <button onClick={onClose} className="text-[#AEAEB2] hover:text-white transition-colors p-1"><X size={18} /></button>
        </div>

        {createdLink && (
          <div className="px-6 sm:px-8 py-6 flex flex-col items-center gap-4 overflow-y-auto">
            <div className="w-12 h-12 rounded-full bg-[#22C55E]/10 flex items-center justify-center">
              <CheckCircle2 size={24} className="text-[#22C55E]" />
            </div>
            <div className="text-center">
              <p className="font-bold text-white text-lg">Evento creato</p>
              <p className="text-[#636366] text-xs mt-1">Copia il link di registrazione e condividilo</p>
            </div>
            <div className="w-full bg-[#121110] border border-[#2d2a26] px-4 py-3">
              <p className="text-[9px] font-mono text-[#8E8E93] break-all">{createdLink}</p>
            </div>
            <button
              onClick={handleCopy}
              className="w-full py-3.5 text-sm font-semibold rounded-xl btn-primary flex items-center justify-center gap-2"
            >
              {copied ? <><CheckCircle2 size={13} /> Copiato!</> : 'Copia link'}
            </button>
            <button onClick={onClose} className="text-[#8E8E93] text-xs hover:text-white transition-colors">
              Chiudi
            </button>
          </div>
        )}

        {!createdLink && (
          <form className="p-6 sm:p-8 space-y-5 overflow-y-auto" onSubmit={(e) => {
            e.preventDefault();
            const token = isEdit ? undefined : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
            onSubmit({
              ...form,
              maxCapacity: form.maxCapacity ? parseInt(form.maxCapacity) : undefined,
              assignedPrIds: assignAll ? undefined : assignedPrIds,
              visibleToHost,
            }, token);
            if (!isEdit && token) {
              setCreatedLink(`${window.location.origin}/r/${token}`);
            } else if (isEdit) {
              onClose();
            }
          }}>
            <Field label="Nome Evento">
              <input required placeholder="ES. TECHNO FRIDAY"
                className="w-full bg-bg border border-[#3b3733] rounded-xl px-4 py-3 text-sm text-white placeholder-[#8E8E93] outline-none transition-colors"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </Field>

            <Field label="Data">
              <input required type="date" min={minDate}
                className="w-full bg-bg border border-[#3b3733] px-4 py-3 text-xs font-sans text-white outline-none transition-colors [color-scheme:dark]"
                value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Inizio">
                <input type="time"
                  className="w-full bg-bg border border-[#3b3733] px-4 py-3 text-xs font-sans text-white outline-none transition-colors [color-scheme:dark]"
                  value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
              </Field>
              <Field label="Fine">
                <input type="time"
                  className="w-full bg-bg border border-[#3b3733] px-4 py-3 text-xs font-sans text-white outline-none transition-colors [color-scheme:dark]"
                  value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} />
              </Field>
            </div>
            <p className="text-[10px] text-[#636366] -mt-3">Se la fine è prima dell'inizio (es. 04:00) si intende la notte successiva. A fine serata l'evento si archivia da solo.</p>

            <Field label="Immagine di copertina (URL)">
              <input placeholder="https://..."
                className="w-full bg-bg border border-[#3b3733] px-4 py-3 text-xs font-sans text-white placeholder-[#636366] outline-none transition-colors"
                value={form.coverImage} onChange={e => setForm({ ...form, coverImage: e.target.value })} />
              {form.coverImage && (
                <div className="mt-2 h-20 overflow-hidden border border-[#2d2a26]">
                  <img src={form.coverImage} alt="" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
                </div>
              )}
            </Field>

            <Field label="Capacità massima (opzionale)">
              <input type="number" min="1" step={1} placeholder="Es. 200"
                className="w-full bg-bg border border-[#3b3733] px-4 py-3 text-xs font-sans text-white placeholder-[#636366] outline-none transition-colors"
                value={form.maxCapacity} onChange={e => setForm({ ...form, maxCapacity: e.target.value })} />
            </Field>

            <Field label="Descrizione (opzionale)">
              <textarea rows={2} placeholder="DETTAGLI..."
                className="w-full bg-bg border border-[#3b3733] rounded-xl px-4 py-3 text-sm text-white placeholder-[#8E8E93] outline-none transition-colors resize-none"
                value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </Field>

            {floorPlans.length > 0 && (
              <Field label="Pianta">
                <select
                  className="w-full bg-bg border border-[#3b3733] rounded-xl px-4 py-3 text-sm text-white outline-none transition-colors [color-scheme:dark]"
                  value={form.floorPlanId}
                  onChange={e => setForm({ ...form, floorPlanId: e.target.value })}>
                  {floorPlans.map(fp => (
                    <option key={fp.id} value={fp.id}>{fp.name}</option>
                  ))}
                </select>
              </Field>
            )}

            <Field label="Ingresso">
              <label className="flex items-center justify-between bg-bg border border-[#3b3733] rounded-xl px-4 py-3 cursor-pointer">
                <span className="text-sm text-white">Attiva per l'ingresso</span>
                <input type="checkbox" checked={visibleToHost}
                  onChange={e => setVisibleToHost(e.target.checked)}
                  className="w-4 h-4 accent-[#D4622A]" />
              </label>
              <p className="text-[10px] text-[#636366] mt-1">Quando è attivo, lo staff all'ingresso vede l'evento per il check-in.</p>
            </Field>

            <Field label="Chi può lavorarlo (PR)">
              <label className="flex items-center justify-between bg-bg border border-[#3b3733] rounded-xl px-4 py-3 cursor-pointer">
                <span className="text-sm text-white">Tutti i PR</span>
                <input type="checkbox" checked={assignAll}
                  onChange={e => setAssignAll(e.target.checked)}
                  className="w-4 h-4 accent-[#D4622A]" />
              </label>
              {!assignAll && (
                <>
                  {prGroups.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {prGroups.map(g => {
                        const allIn = g.prIds.length > 0 && g.prIds.every(id => assignedPrIds.includes(id));
                        return (
                          <button type="button" key={g.id} onClick={() => toggleGroup(g)}
                            className={cn('px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                              allIn ? 'bg-accent text-black border-accent' : 'border-[#3b3733] text-[#AEAEB2] hover:border-[#48484A]')}>
                            {g.name} <span className="opacity-60">({g.prIds.length})</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  <div className="mt-2 space-y-1 max-h-44 overflow-y-auto border border-[#2d2a26] rounded-xl p-2">
                    {prUsers.length === 0 ? (
                      <p className="text-xs text-[#636366] px-2 py-3 text-center">Nessun PR approvato</p>
                    ) : (
                      prUsers.map(pr => (
                        <label key={pr.id} className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/[0.03] cursor-pointer">
                          <input type="checkbox" checked={assignedPrIds.includes(pr.id)}
                            onChange={() => togglePr(pr.id)}
                            className="w-4 h-4 accent-[#D4622A]" />
                          <span className="text-sm text-[#AEAEB2]">{pr.displayName} {pr.lastName}</span>
                        </label>
                      ))
                    )}
                  </div>
                </>
              )}
            </Field>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose}
                className="flex-1 py-3.5 text-sm font-medium rounded-xl border border-[#2d2a26] text-[#8E8E93] hover:text-white hover:border-[#48484A] transition-all">
                Annulla
              </button>
              <button type="submit"
                className="flex-1 py-3.5 text-sm font-semibold rounded-xl btn-primary">
                {isEdit ? 'Salva Modifiche' : 'Crea Evento'}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}

/* ── NewClubModal ────────────────────────────────────────── */
export function NewClubModal({ onClose, onSubmit, initialData }: {
  onClose: () => void;
  onSubmit: (d: { name: string; address: string }) => void;
  initialData?: { name: string; address: string };
}) {
  const isEdit = !!initialData;
  const [form, setForm] = useState({ name: initialData?.name ?? '', address: initialData?.address ?? '' });

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="relative w-full sm:max-w-md bg-[#1d1b19]/80 backdrop-blur-2xl border-t border-x sm:border border-white/10 overflow-hidden rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
      >
        <div className="h-[2px] bg-accent shrink-0" />
        <div className="px-6 sm:px-8 py-5 sm:py-6 border-b border-[#2d2a26] flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-bold text-xl text-white">{isEdit ? 'Modifica Club' : 'Nuovo Club'}</h3>
            <p className="text-sm text-[#8E8E93] mt-1">{isEdit ? 'Aggiorna nome e indirizzo' : 'Crea il locale e poi la sua piantina'}</p>
          </div>
          <button onClick={onClose} className="text-[#AEAEB2] hover:text-white transition-colors p-1"><X size={18} /></button>
        </div>

        <form className="p-6 sm:p-8 space-y-5 overflow-y-auto" onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}>
          <Field label="Nome del Club">
            <input required placeholder="Es. Amnesia Club"
              className="w-full bg-bg border border-[#3b3733] rounded-xl px-4 py-3 text-sm font-sans text-white placeholder-[#636366] outline-none focus:border-accent/40 transition-colors"
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Città / Indirizzo">
            <input placeholder="Es. Milano"
              className="w-full bg-bg border border-[#3b3733] rounded-xl px-4 py-3 text-sm font-sans text-white placeholder-[#636366] outline-none focus:border-accent/40 transition-colors"
              value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
          </Field>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3.5 text-sm font-medium rounded-xl border border-[#2d2a26] text-[#8E8E93] hover:text-white hover:border-[#48484A] transition-all">
              Annulla
            </button>
            <button type="submit"
              className="flex-1 py-3.5 text-sm font-semibold rounded-xl btn-primary">
              {isEdit ? 'Salva Modifiche' : 'Avanti'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

/* ── NewFloorPlanModal ───────────────────────────────────── */
export function NewFloorPlanModal({ venues, onClose, onSubmit }: {
  venues: Venue[];
  onClose: () => void;
  onSubmit: (venueId: string, name: string) => void;
}) {
  const [venueId, setVenueId] = useState(venues[0]?.id ?? '');
  const [name, setName] = useState('');

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="relative w-full sm:max-w-md bg-[#1d1b19]/80 backdrop-blur-2xl border-t border-x sm:border border-white/10 overflow-hidden rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
        <div className="h-[2px] bg-accent shrink-0" />
        <div className="px-6 sm:px-8 py-5 sm:py-6 border-b border-[#2d2a26] flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-bold text-xl text-white">Nuova Pianta</h3>
            <p className="text-sm text-[#8E8E93] mt-1">Dai un nome e scegli il locale</p>
          </div>
          <button onClick={onClose} className="text-[#AEAEB2] hover:text-white transition-colors p-1"><X size={18} /></button>
        </div>
        <form className="p-6 sm:p-8 space-y-5 overflow-y-auto" onSubmit={(e) => { e.preventDefault(); if (venueId && name.trim()) onSubmit(venueId, name.trim()); }}>
          <Field label="Nome Pianta">
            <input required placeholder="Es. Piano Terra, VIP Room..."
              className="w-full bg-bg border border-[#3b3733] rounded-xl px-4 py-3 text-sm font-sans text-white placeholder-[#636366] outline-none focus:border-accent/40 transition-colors"
              value={name} onChange={e => setName(e.target.value)} />
          </Field>
          <Field label="Locale">
            <select required
              className="w-full bg-bg border border-[#3b3733] rounded-xl px-4 py-3 text-sm font-sans text-white outline-none focus:border-accent/40 transition-colors [color-scheme:dark]"
              value={venueId} onChange={e => setVenueId(e.target.value)}>
              {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </Field>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3.5 text-sm font-medium rounded-xl border border-[#2d2a26] text-[#8E8E93] hover:text-white hover:border-[#48484A] transition-all">
              Annulla
            </button>
            <button type="submit"
              className="flex-1 py-3.5 text-sm font-semibold rounded-xl btn-primary">
              Avanti
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

/* ── FloorPlanMetaModal ──────────────────────────────────── */
export function FloorPlanMetaModal({ fp, onClose, onSubmit }: {
  fp: FloorPlan;
  onClose: () => void;
  onSubmit: (name: string) => void;
}) {
  const [name, setName] = useState(fp.name);

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="relative w-full sm:max-w-md bg-[#1d1b19]/80 backdrop-blur-2xl border-t border-x sm:border border-white/10 overflow-hidden rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
        <div className="h-[2px] bg-accent shrink-0" />
        <div className="px-6 sm:px-8 py-5 sm:py-6 border-b border-[#2d2a26] flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-bold text-xl text-white">Modifica Pianta</h3>
            <p className="text-sm text-[#8E8E93] mt-1">Aggiorna il nome della pianta</p>
          </div>
          <button onClick={onClose} className="text-[#AEAEB2] hover:text-white transition-colors p-1"><X size={18} /></button>
        </div>
        <form className="p-6 sm:p-8 space-y-5 overflow-y-auto" onSubmit={(e) => { e.preventDefault(); onSubmit(name); }}>
          <Field label="Nome Pianta">
            <input required
              className="w-full bg-bg border border-[#3b3733] rounded-xl px-4 py-3 text-sm font-sans text-white placeholder-[#636366] outline-none focus:border-accent/40 transition-colors"
              value={name} onChange={e => setName(e.target.value)} />
          </Field>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3.5 text-sm font-medium rounded-xl border border-[#2d2a26] text-[#8E8E93] hover:text-white hover:border-[#48484A] transition-all">
              Annulla
            </button>
            <button type="submit"
              className="flex-1 py-3.5 text-sm font-semibold rounded-xl btn-primary">
              Salva Modifiche
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
