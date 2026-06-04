import React, { useState, useRef } from 'react';
import {
  ChevronRight, ChevronDown, Pencil, Trash2, Plus, Users, ArrowLeft,
  Eye, EyeOff, Clock, Calendar, CheckCircle2, X, Search,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, getPrCommission } from '../../lib/utils';
import { UserProfile, ManagedUser, Reservation, Event, PrGroup, PrCommission } from '../../types';
import { Field, GroupEditorModal } from '../modals/EntityModals';
import { EmptyState, PageTitle } from '../layout/AppShell';
import PRRankingView from './PRRankingView';

/* ── PRProfile ───────────────────────────────────────────── */
export function PRProfile({ user, onSave }: {
  user: UserProfile;
  onSave: (u: { displayName: string; lastName: string; profileImage?: string }) => void;
}) {
  const [firstName, setFirstName]   = useState(user.displayName);
  const [lastName,  setLastName]    = useState(user.lastName ?? '');
  const [image,     setImage]       = useState(user.profileImage ?? '');
  const [saved,     setSaved]       = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ displayName: firstName.trim(), lastName: lastName.trim(), profileImage: image || undefined });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const initials = (firstName.substring(0, 1) + (lastName.substring(0, 1) || '')).toUpperCase();

  return (
    <div className="max-w-md">
      <form onSubmit={handleSave} className="space-y-8">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-4">
          <button type="button" onClick={() => fileRef.current?.click()}
            className="relative group w-24 h-24 bg-[#2d2a26] border border-[#3b3733] overflow-hidden hover:border-accent/40 transition-colors rounded-2xl">
            {image
              ? <img src={image} alt="" className="w-full h-full object-cover" />
              : <span className="hv font-black text-accent text-2xl">{initials}</span>
            }
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-xs font-medium text-white">Cambia</span>
            </div>
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
          <p className="text-xs text-[#636366]">Clicca per cambiare foto</p>
        </div>

        {/* Fields */}
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nome">
              <input required value={firstName} onChange={e => setFirstName(e.target.value)}
                className="w-full bg-bg border border-[#3b3733] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-accent/40 transition-colors font-sans" />
            </Field>
            <Field label="Cognome">
              <input value={lastName} onChange={e => setLastName(e.target.value)}
                className="w-full bg-bg border border-[#3b3733] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-accent/40 transition-colors font-sans" />
            </Field>
          </div>
          <Field label="Email">
            <input disabled value={user.email}
              className="w-full bg-[#0a0908] border border-[#1d1b19] rounded-xl px-4 py-3 text-sm text-[#636366] outline-none font-sans cursor-not-allowed" />
          </Field>
        </div>

        <motion.button type="submit" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
          className={cn(
            'w-full py-4 text-sm font-semibold rounded-xl transition-colors',
            saved ? 'bg-green-500 text-black' : 'btn-primary'
          )}>
          {saved ? 'Salvato ✓' : 'Salva Modifiche'}
        </motion.button>
      </form>
    </div>
  );
}

/* ── PRManagementPage ────────────────────────────────────── */
export function PRManagementPage({ managedUsers, reservations, events, prGroups, selectedPR, onSelectPR, onBack, onUpdateStatus, onUpdateCommission, onSaveGroup, onDeleteGroup }: {
  managedUsers: ManagedUser[];
  reservations: Reservation[];
  events: Event[];
  prGroups: PrGroup[];
  selectedPR: ManagedUser | null;
  onSelectPR: (pr: ManagedUser) => void;
  onBack: () => void;
  onUpdateStatus: (id: string, status: 'approved' | 'rejected') => void;
  onUpdateCommission: (id: string, commission: PrCommission) => void;
  onSaveGroup: (g: PrGroup) => void;
  onDeleteGroup: (id: string) => void;
}) {
  const prUsers = managedUsers.filter(u => u.role === 'pr');
  const approvedPrs = prUsers.filter(u => u.status === 'approved');
  const [editingGroup, setEditingGroup] = useState<PrGroup | 'new' | null>(null);
  const [confirmDeleteGroup, setConfirmDeleteGroup] = useState<string | null>(null);
  const [prSearch, setPrSearch] = useState('');
  const prQuery = prSearch.trim().toLowerCase();
  const filteredPrs = prQuery
    ? prUsers.filter(u => `${u.displayName} ${u.lastName} ${u.email}`.toLowerCase().includes(prQuery))
    : prUsers;

  const prStats = (prId: string) => {
    const res = reservations.filter(r => r.prId === prId);
    const approved = res.filter(r => r.approvalStatus === 'approved').length;
    const budget = res.reduce((s, r) => s + r.budget, 0);
    const rate = res.length > 0 ? Math.round((approved / res.length) * 100) : 0;
    const eventCount = new Set(res.map(r => r.eventId)).size;
    return { total: res.length, budget, rate, eventCount };
  };

  const statusBadge = (s: string) => {
    if (s === 'approved') return <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-green-500/10 text-green-400 border border-green-500/20">Attivo</span>;
    if (s === 'rejected') return <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-red-500/10 text-red-400 border border-red-500/20">Rifiutato</span>;
    return <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-[#1d1b19] text-[#8E8E93] border border-[#2d2a26]">In attesa</span>;
  };

  if (selectedPR) {
    return <PRDetailView pr={selectedPR} reservations={reservations} events={events} onBack={onBack} onUpdateStatus={onUpdateStatus} onUpdateCommission={onUpdateCommission} statusBadge={statusBadge} />;
  }

  return (
    <div>
      <PageTitle title="I Miei PR" sub={`${prUsers.length} professionisti registrati`} />

      {/* PR Ranking */}
      {prUsers.length > 0 && (
        <div className="mb-10">
          <PRRankingView managedUsers={managedUsers} reservations={reservations} />
        </div>
      )}

      {/* Gruppi PR */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-medium text-[#8E8E93]">Gruppi PR</p>
          <button onClick={() => setEditingGroup('new')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl btn-primary text-xs font-semibold">
            <Plus size={12} /> Crea gruppo
          </button>
        </div>
        {prGroups.length === 0 ? (
          <p className="text-xs text-[#636366] border border-[#2d2a26] rounded-xl px-4 py-5 text-center">
            Nessun gruppo. Crea un gruppo per assegnare più PR a un evento con un tap.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {prGroups.map(g => (
              <div key={g.id} className="border border-[#2d2a26] bg-white/[0.018] rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{g.name}</p>
                  <p className="text-[10px] text-[#8E8E93] mt-0.5">{g.prIds.length} PR</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => setEditingGroup(g)}
                    className="w-8 h-8 flex items-center justify-center text-[#8E8E93] hover:text-white rounded-lg hover:bg-white/[0.04] transition-colors" title="Modifica">
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirmDeleteGroup === g.id) { onDeleteGroup(g.id); setConfirmDeleteGroup(null); }
                      else setConfirmDeleteGroup(g.id);
                    }}
                    onBlur={() => setConfirmDeleteGroup(null)}
                    className={cn('w-8 h-8 flex items-center justify-center rounded-lg transition-colors',
                      confirmDeleteGroup === g.id ? 'text-red-500 bg-red-500/10' : 'text-[#8E8E93] hover:text-red-500 hover:bg-white/[0.04]')}
                    title={confirmDeleteGroup === g.id ? 'Confermi?' : 'Elimina'}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editingGroup && (
        <GroupEditorModal
          group={editingGroup === 'new' ? null : editingGroup}
          prUsers={approvedPrs}
          onClose={() => setEditingGroup(null)}
          onSave={(g) => { onSaveGroup(g); setEditingGroup(null); }}
        />
      )}

      {prUsers.length === 0 ? (
        <EmptyState icon={<Users size={28}/>} label="Nessun PR registrato." />
      ) : (
        <>
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a8278]">Tutti i PR · {filteredPrs.length}</p>
            <div className="relative w-full sm:w-64">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a8278]" />
              <input value={prSearch} onChange={e => setPrSearch(e.target.value)} placeholder="Cerca nome o email…"
                className="w-full bg-white/[0.018] border border-white/[0.07] rounded-xl pl-9 pr-8 py-2.5 text-sm text-white placeholder-[#8a8278] outline-none focus:border-[#D4622A]/40 transition-colors" />
              {prSearch && <button onClick={() => setPrSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a8278] hover:text-white"><X size={13} /></button>}
            </div>
          </div>
          {filteredPrs.length === 0 ? (
            <div className="py-12 text-center border border-white/[0.07] rounded-2xl">
              <p className="text-sm text-[#8a8278]">Nessun PR trovato per "{prSearch}"</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredPrs.map(pr => {
            const stats = prStats(pr.id);
            return (
              <div key={pr.id} className="border border-[#2d2a26] bg-white/[0.018] p-6 flex flex-col gap-5 hover:border-[#3a3a3a] transition-colors rounded-xl">
                {/* Header */}
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-[#1d1b19] border border-[#2d2a26] flex items-center justify-center shrink-0 overflow-hidden rounded-xl">
                    {pr.profileImage
                      ? <img src={pr.profileImage} alt="" className="w-full h-full object-cover" />
                      : <span className="hv font-black text-accent text-sm">{pr.displayName.slice(0,2).toUpperCase()}</span>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-white truncate">{pr.displayName} {pr.lastName}</p>
                    <p className="text-[10px] font-sans text-[#8E8E93] truncate mt-0.5">{pr.email}</p>
                  </div>
                  {statusBadge(pr.status)}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 border-t border-[#1d1b19] pt-5">
                  <div>
                    <p className="hv font-black text-xl text-white">{stats.total}</p>
                    <p className="text-xs text-[#8E8E93] mt-1">Tavoli</p>
                  </div>
                  <div>
                    <p className="hv font-black text-xl text-white">€{stats.budget >= 1000 ? `${(stats.budget/1000).toFixed(1)}K` : stats.budget}</p>
                    <p className="text-xs text-[#8E8E93] mt-1">Budget</p>
                  </div>
                  <div>
                    <p className="hv font-black text-xl text-white">{stats.rate}<span className="text-sm text-[#8E8E93]">%</span></p>
                    <p className="text-xs text-[#8E8E93] mt-1">Approv.</p>
                  </div>
                </div>

                {/* CTA */}
                <button onClick={() => onSelectPR(pr)}
                  className="w-full py-2.5 text-sm font-medium rounded-xl border border-[#2d2a26] text-[#636366] hover:border-accent/40 hover:text-accent transition-colors flex items-center justify-center gap-2">
                  Apri Scheda <ChevronRight size={11} />
                </button>
              </div>
            );
          })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ── PRDetailView ────────────────────────────────────────── */
export function PRDetailView({ pr, reservations, events, onBack, onUpdateStatus, onUpdateCommission, statusBadge }: {
  pr: ManagedUser;
  reservations: Reservation[];
  events: Event[];
  onBack: () => void;
  onUpdateStatus: (id: string, status: 'approved' | 'rejected') => void;
  onUpdateCommission: (id: string, commission: PrCommission) => void;
  statusBadge: (s: string) => React.ReactNode;
}) {
  const [showPwd, setShowPwd] = useState(false);
  const initialCommission = getPrCommission(pr);
  const [commission, setCommission] = useState<PrCommission>(initialCommission);
  const commissionDirty =
    commission.percentage !== initialCommission.percentage ||
    commission.fixedPerTable !== initialCommission.fixedPerTable ||
    commission.fixedPerEvent !== initialCommission.fixedPerEvent;
  const myRes = reservations.filter(r => r.prId === pr.id);
  const myEventIds = [...new Set(myRes.map(r => r.eventId))];
  const approved = myRes.filter(r => r.approvalStatus === 'approved').length;
  const totalBudget = myRes.reduce((s, r) => s + (r.actualBudget ?? r.budget), 0);
  const approvalRate = myRes.length > 0 ? Math.round((approved / myRes.length) * 100) : 0;

  return (
    <div>
      {/* Back */}
      <button onClick={onBack}
        className="flex items-center gap-2 text-[#8E8E93] hover:text-accent transition-colors text-xs mb-8">
        <ArrowLeft size={11} /> Tutti i PR
      </button>

      {/* Header */}
      <div className="flex items-center gap-5 mb-8">
        <div className="w-16 h-16 bg-[#1d1b19] border border-[#2d2a26] flex items-center justify-center shrink-0 overflow-hidden rounded-2xl">
          {pr.profileImage
            ? <img src={pr.profileImage} alt="" className="w-full h-full object-cover" />
            : <span className="hv font-black text-accent text-xl">{pr.displayName.slice(0,2).toUpperCase()}</span>}
        </div>
        <div>
          <h2 className="font-bold text-3xl text-white">{pr.displayName} {pr.lastName}</h2>
          <div className="flex items-center gap-3 mt-2">
            {statusBadge(pr.status)}
            <span className="text-xs text-[#8E8E93]">dal {pr.createdAt?.slice(0,10) ?? '—'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: info + actions */}
        <div className="space-y-4">
          {/* Info card */}
          <div className="border border-[#2d2a26] bg-white/[0.018] p-5 space-y-4 rounded-xl">
            <p className="text-xs text-[#8E8E93] mb-1">Informazioni</p>
            {[
              { label: 'Email', value: pr.email },
              { label: 'Telefono', value: pr.phone || '—' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-[#8E8E93]">{label}</p>
                <p className="text-sm text-white font-sans mt-1">{value}</p>
              </div>
            ))}
            <div>
              <p className="text-xs text-[#8E8E93]">Password</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-white font-sans font-mono">{showPwd ? pr.password : '••••••••'}</p>
                <button onClick={() => setShowPwd(v => !v)}
                  className="text-[#636366] hover:text-accent transition-colors">
                  {showPwd ? <EyeOff size={13}/> : <Eye size={13}/>}
                </button>
              </div>
            </div>
          </div>

          {/* Compenso */}
          <div className="border border-[#2d2a26] bg-white/[0.018] p-5 space-y-3 rounded-xl">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-[#8E8E93]">Compenso</p>
              <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#3b3733]">per serata</span>
            </div>
            <CommissionRow
              label="% sull'incasso"
              suffix="%"
              value={commission.percentage}
              onChange={v => setCommission(c => ({ ...c, percentage: v }))}
            />
            <CommissionRow
              label="Fisso a tavolo"
              prefix="€"
              value={commission.fixedPerTable}
              onChange={v => setCommission(c => ({ ...c, fixedPerTable: v }))}
            />
            <CommissionRow
              label="Fisso a serata"
              prefix="€"
              value={commission.fixedPerEvent}
              onChange={v => setCommission(c => ({ ...c, fixedPerEvent: v }))}
            />
            {commissionDirty && (
              <button
                onClick={() => onUpdateCommission(pr.id, commission)}
                className="w-full mt-2 py-2.5 text-[11px] hv font-black uppercase tracking-widest rounded-xl btn-primary">
                Salva compenso
              </button>
            )}
          </div>

          {/* Actions */}
          {pr.status !== 'approved' && (
            <button onClick={() => onUpdateStatus(pr.id, 'approved')}
              className="w-full py-3 text-sm font-medium rounded-xl bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-colors">
              Approva Account
            </button>
          )}
          {pr.status !== 'rejected' && (
            <button onClick={() => onUpdateStatus(pr.id, 'rejected')}
              className="w-full py-3 text-sm font-medium rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors">
              Disabilita Account
            </button>
          )}
        </div>

        {/* Right: stats + history */}
        <div className="lg:col-span-2 space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Tavoli', value: myRes.length },
              { label: 'Budget', value: `€${totalBudget >= 1000 ? `${(totalBudget/1000).toFixed(1)}K` : totalBudget}` },
              { label: 'Serate', value: myEventIds.length },
              { label: 'Approv.', value: `${approvalRate}%` },
            ].map(({ label, value }) => (
              <div key={label} className="border border-[#2d2a26] bg-white/[0.018] px-4 py-4 rounded-xl">
                <p className="hv font-black text-2xl text-white">{value}</p>
                <p className="text-xs text-[#8E8E93] mt-2">{label}</p>
              </div>
            ))}
          </div>

          {/* Barra approvazione */}
          {myRes.length > 0 && (
            <div className="border border-[#2d2a26] bg-white/[0.018] px-5 py-4 rounded-xl">
              <div className="flex justify-between mb-2">
                <span className="text-xs text-[#8E8E93]">Tasso approvazione</span>
                <span className="text-[9px] hv font-black text-accent">{approvalRate}%</span>
              </div>
              <div className="h-1 bg-[#1d1b19] rounded-full overflow-hidden">
                <motion.div className="h-full bg-accent" initial={{ width: 0 }} animate={{ width: `${approvalRate}%` }} transition={{ duration: 1, ease: 'easeOut' }} />
              </div>
            </div>
          )}

          {/* Event history */}
          {myEventIds.length === 0 ? (
            <EmptyState icon={<Clock size={24}/>} label="Nessuna prenotazione ancora." />
          ) : (
            <div className="space-y-3">
              {myEventIds.map(eventId => {
                const event = events.find(e => e.id === eventId);
                if (!event) return null;
                const eventRes = myRes.filter(r => r.eventId === eventId);
                const eventApproved = eventRes.filter(r => r.approvalStatus === 'approved').length;
                const eventBudget = eventRes.reduce((s, r) => s + (r.actualBudget ?? r.budget), 0);
                return (
                  <HistoryEventRow key={eventId} event={event} venueName="—"
                    reservations={eventRes} approvedCount={eventApproved} totalBudget={eventBudget} />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── CommissionRow ───────────────────────────────────────── */
function CommissionRow({ label, prefix, suffix, value, onChange }: {
  label: string;
  prefix?: string;
  suffix?: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <label className="text-[12px] text-[#cfc7bc] flex-1">{label}</label>
      <div className="relative w-24 shrink-0">
        {prefix && <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#636366] text-xs">{prefix}</span>}
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step={prefix ? 1 : 0.5}
          value={value || ''}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          placeholder="0"
          className={cn(
            'w-full bg-bg border border-[#2d2a26] rounded-lg py-1.5 text-sm text-white text-right outline-none focus:border-accent/40 transition-colors tabular-nums',
            prefix ? 'pl-6 pr-2.5' : 'pl-2.5 pr-6',
          )}
        />
        {suffix && <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#636366] text-xs">{suffix}</span>}
      </div>
    </div>
  );
}

/* ── HistoryEventRow ─────────────────────────────────────── */
export function HistoryEventRow({ event, venueName, reservations, approvedCount, totalBudget }: {
  event: Event; venueName: string; reservations: Reservation[];
  approvedCount: number; totalBudget: number;
}) {
  const [open, setOpen] = useState(false);
  const rejected = reservations.filter(r => r.approvalStatus === 'rejected').length;
  const statusColor = rejected > 0 ? '#EF4444' : approvedCount === reservations.length ? '#22C55E' : '#3b3733';

  const approvalBadge = (s: string) => {
    if (s === 'approved') return <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-green-500/10 text-green-400 border border-green-500/20">Approvata</span>;
    if (s === 'rejected') return <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-red-500/10 text-red-400 border border-red-500/20">Rifiutata</span>;
    return <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-[#1d1b19] text-[#8E8E93] border border-[#2d2a26]">In attesa</span>;
  };

  return (
    <div className="border border-[#2d2a26] bg-white/[0.018] overflow-hidden rounded-xl">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full px-6 py-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors text-left"
      >
        <div className="flex items-center gap-5 min-w-0">
          <div className="w-10 h-10 bg-[#1d1b19] flex items-center justify-center shrink-0 rounded-xl border"
            style={{ borderColor: statusColor + '66' }}>
            <Calendar size={14} style={{ color: statusColor === '#3b3733' ? '#D4622A' : statusColor }} />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-white truncate">{event.name}</p>
            <p className="text-xs text-[#636366] mt-0.5">{venueName} · {event.date}</p>
          </div>
        </div>
        <div className="flex items-center gap-6 shrink-0 ml-4">
          <div className="text-right hidden sm:block">
            <p className="hv font-black text-sm text-white">{reservations.length} <span className="text-[#8E8E93] font-normal text-xs">tavoli</span></p>
            <p className="text-[9px] font-sans text-[#8E8E93] mt-0.5">€{totalBudget.toLocaleString('it-IT')}</p>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-xs text-[#8E8E93]">{approvedCount}/{reservations.length} approvate</p>
          </div>
          <ChevronDown size={14} className={cn('text-[#8E8E93] transition-transform duration-200', open && 'rotate-180')} />
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-[#2d2a26] divide-y divide-[#2d2a26]">
              {reservations.map(r => (
                <div key={r.id} className="px-6 py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={cn(
                      'w-7 h-7 border flex items-center justify-center shrink-0 rounded-lg',
                      r.checkedIn ? 'bg-green-500/10 border-green-500/30' : 'bg-[#121110] border-[#1d1b19]'
                    )}>
                      <span className={cn('text-[9px] hv font-black', r.checkedIn ? 'text-green-400' : 'text-accent')}>
                        {r.tableName ?? '—'}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-white font-sans truncate">{r.customerName}</p>
                      <p className="text-[9px] font-sans text-[#8E8E93] mt-0.5">
                        {r.checkedIn ? `${r.actualPeople ?? r.guestsCount} entrati` : `${r.guestsCount} ospiti`}
                        {' · '}
                        <span className="text-accent">€{r.checkedIn && r.actualBudget ? r.actualBudget : r.budget}</span>
                        {r.checkedIn && r.actualBudget && r.actualBudget > r.budget && (
                          <span className="text-green-400 ml-1">+€{r.actualBudget - r.budget}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                    {r.checkedIn && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                        <CheckCircle2 size={9}/> Entrato
                      </span>
                    )}
                    {approvalBadge(r.approvalStatus)}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
