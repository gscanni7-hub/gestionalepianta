import React from 'react';
import {
  TrendingUp, Calendar, BarChart3, Users, Building2, DoorOpen, Clock, Settings, LogOut,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn, easeOutQuart } from '../../lib/utils';
import { UserProfile } from '../../types';

/* ── SidebarContent ──────────────────────────────────────── */
export function SidebarContent({ user, view, onNav, onLogout, occupancyPct = 0, revenueEst = 0, pendingCount = 0, prPendingCount = 0 }: {
  user: UserProfile; view: string;
  onNav: (v: string) => void;
  onLogout: () => void;
  occupancyPct?: number;
  revenueEst?: number;
  pendingCount?: number;
  prPendingCount?: number;
}) {
  const revenueDisplay = revenueEst >= 1000
    ? `€${(revenueEst / 1000).toFixed(1)}K`
    : `€${revenueEst}`;

  return (
    <>
      {/* Brand */}
      <div className="px-5 py-4 border-b border-[#2d2a26] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 shrink-0 flex items-center justify-center">
            <img src="/Logo.png" alt="Nightplan" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col justify-center items-end">
            <span className="hv font-black text-[13px] text-white leading-tight">Nightplan</span>
            <span className="text-[9px] font-sans text-accent uppercase tracking-[0.3em] -mr-[0.3em]">Management</span>
          </div>
        </div>
      </div>

      {/* KPIs — admin only */}
      {user.role === 'admin' && (
        <div className="px-5 py-4 border-b border-[#2d2a26] flex items-center gap-4 shrink-0">
          <div className="flex-1">
            <div className="flex items-baseline gap-1">
              <span className="hv font-black text-[22px] text-white leading-none">{occupancyPct}</span>
              <span className="text-xs text-[#8E8E93]">%</span>
            </div>
            <p className="text-[9px] text-[#8E8E93] mt-0.5">Occupazione</p>
          </div>
          <div className="w-px h-8 bg-[#2d2a26]" />
          <div className="flex-1">
            <div className="hv font-black text-[22px] text-accent leading-none">{revenueDisplay}</div>
            <p className="text-[9px] text-[#8E8E93] mt-0.5">Incasso</p>
          </div>
          <div className="w-1 h-10 bg-[#2d2a26] rounded-full overflow-hidden">
            <motion.div className="w-full bg-accent rounded-full"
              initial={{ height: '0%' }} animate={{ height: `${occupancyPct}%` }}
              transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
              style={{ marginTop: `${100 - occupancyPct}%` }} />
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
        {user.role === 'admin' ? (
          <>
            <NavSection label="Panoramica">
              <NavLink icon={<TrendingUp size={14}/>} label="Dashboard"
                active={view==='dashboard'}
                onClick={() => onNav('dashboard')} />
            </NavSection>
            <NavSection label="Serate">
              <NavLink icon={<Calendar size={14}/>} label="Serate"
                active={view==='active-events'||view==='plan'||view==='event-detail'||view==='approvals'||view==='checkin'}
                onClick={() => onNav('active-events')}
                badge={pendingCount} />
              <NavLink icon={<BarChart3 size={14}/>} label="Prenotazioni"
                active={view==='reservations'}
                onClick={() => onNav('reservations')} />
            </NavSection>
            <NavSection label="Gestione">
              <NavLink icon={<Users size={14}/>} label="Team PR"
                active={view==='pr-management'}
                onClick={() => onNav('pr-management')} />
              <NavLink icon={<Building2 size={14}/>} label="Club"
                active={view==='venues'||view==='venue-events'||view==='editor'}
                onClick={() => onNav('venues')} />
            </NavSection>
          </>
        ) : user.role === 'host' ? (
          <NavSection label="Menu">
            <NavLink icon={<TrendingUp size={14}/>} label="Dashboard"
              active={view==='dashboard'}
              onClick={() => onNav('dashboard')} />
            <NavLink icon={<DoorOpen size={14}/>} label="Ingresso"
              active={view==='checkin'}
              onClick={() => onNav('checkin')} />
          </NavSection>
        ) : (
          <NavSection label="Menu">
            <NavLink icon={<TrendingUp size={14}/>} label="Dashboard"
              active={view==='dashboard'}
              onClick={() => onNav('dashboard')} />
            <NavLink icon={<Calendar size={14}/>} label="Serate"
              active={view==='events'||view==='plan'}
              onClick={() => onNav('events')} />
            <NavLink icon={<BarChart3 size={14}/>} label="Prenotazioni"
              active={view==='reservations'}
              onClick={() => onNav('reservations')}
              badge={prPendingCount} />
            <NavLink icon={<Clock size={14}/>} label="Storico"
              active={view==='history'}
              onClick={() => onNav('history')} />
          </NavSection>
        )}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-[#2d2a26] shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => user.role === 'pr' ? onNav('profile') : undefined}
            className={cn('flex items-center gap-2.5 flex-1 min-w-0 text-left', user.role === 'pr' && 'group cursor-pointer')}
          >
            <div className="w-7 h-7 bg-[#2d2a26] border border-[#3b3733] flex items-center justify-center shrink-0 overflow-hidden group-hover:border-accent/30 transition-colors rounded-lg">
              {user.profileImage
                ? <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
                : <span className="hv font-black text-accent text-[9px]">{user.displayName.substring(0, 2).toUpperCase()}</span>
              }
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-white truncate group-hover:text-accent transition-colors leading-tight">
                {user.displayName}{user.lastName ? ' ' + user.lastName : ''}
              </p>
              <p className="text-[9px] text-[#8E8E93] capitalize">{user.role}</p>
            </div>
          </button>
          <button onClick={onLogout}
            className="text-[#48484A] hover:text-accent transition-colors shrink-0 p-1.5 rounded-lg hover:bg-white/[0.04]">
            <LogOut size={13} />
          </button>
        </div>
      </div>
    </>
  );
}

/* ── NavSection ──────────────────────────────────────────── */
export function NavSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="pb-3">
      <p className="px-3 pt-1 pb-1.5 text-[8px] font-sans uppercase tracking-[0.35em] text-[#48484A]">
        {label}
      </p>
      <div className="space-y-0.5">
        {children}
      </div>
    </div>
  );
}

/* ── NavLink ─────────────────────────────────────────────── */
export function NavLink({ icon, label, active, onClick, badge }: { icon: React.ReactNode; label: string; active?: boolean; onClick: () => void; badge?: number }) {
  return (
    <button onClick={onClick}
      className={cn(
        'flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium transition-all duration-200 group rounded-lg',
        active
          ? 'text-white bg-white/[0.08]'
          : 'text-[#8E8E93] hover:text-white hover:bg-white/[0.04]'
      )}>
      <span className={cn('transition-colors duration-200 shrink-0', active ? 'text-accent' : 'text-[#636366] group-hover:text-[#AEAEB2]')}>
        {icon}
      </span>
      <span className="flex-1 text-left">{label}</span>
      {badge != null && badge > 0 && (
        <span className="bg-accent text-black text-[8px] hv font-black px-1.5 py-0.5 leading-none min-w-[18px] text-center shrink-0 rounded-full">
          {badge}
        </span>
      )}
    </button>
  );
}

/* ── PageTitle ───────────────────────────────────────────── */
export function PageTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-8">
      <h2 className="font-bold text-3xl md:text-4xl text-white leading-tight">{title}</h2>
      {sub && <p className="text-sm text-[#8E8E93] mt-2">{sub}</p>}
    </div>
  );
}

/* ── EmptyState ──────────────────────────────────────────── */
export function EmptyState({ icon, label, children }: { icon: React.ReactNode; label: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-28 text-center mt-4">
      <div className="text-[#8E8E93] mb-5">{icon}</div>
      <p className="text-xs text-[#636366]">{label}</p>
      {children}
    </div>
  );
}

/* ── BottomTabBar (mobile) ───────────────────────────────── */
export function BottomTabBar({ user, view, onNav, pendingCount, prPendingCount }: {
  user: UserProfile;
  view: string;
  onNav: (v: string) => void;
  pendingCount: number;
  prPendingCount: number;
}) {
  type Tab = { id: string; label: string; icon: React.ReactNode; active: boolean; badge?: number };

  const tabs: Tab[] = user.role === 'admin' ? [
    { id: 'dashboard',     label: 'Home',     icon: <TrendingUp size={16}/>, active: view === 'dashboard' },
    { id: 'active-events', label: 'Serate',   icon: <Calendar size={16}/>,  active: view === 'active-events' || view === 'plan' || view === 'event-detail' || view === 'approvals' || view === 'checkin', badge: pendingCount },
    { id: 'reservations',  label: 'Prenot.',  icon: <BarChart3 size={16}/>, active: view === 'reservations' },
    { id: 'pr-management', label: 'PR',       icon: <Users size={16}/>,     active: view === 'pr-management' },
    { id: 'venues',        label: 'Club',     icon: <Building2 size={16}/>, active: view === 'venues' || view === 'venue-events' || view === 'editor' },
  ] : user.role === 'host' ? [
    { id: 'dashboard',     label: 'Home',     icon: <TrendingUp size={16}/>, active: view === 'dashboard' },
    { id: 'checkin',       label: 'Ingresso', icon: <DoorOpen size={16}/>,  active: view === 'checkin' },
  ] : [
    { id: 'dashboard',     label: 'Home',     icon: <TrendingUp size={16}/>, active: view === 'dashboard' },
    { id: 'events',        label: 'Serate',   icon: <Calendar size={16}/>,  active: view === 'events' || view === 'plan' },
    { id: 'reservations',  label: 'Prenot.',  icon: <BarChart3 size={16}/>, active: view === 'reservations', badge: prPendingCount },
    { id: 'history',       label: 'Storico',  icon: <Clock size={16}/>,     active: view === 'history' },
    { id: 'profile',       label: 'Profilo',  icon: <Settings size={16}/>,  active: view === 'profile' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0c0c0c]/95 backdrop-blur-md border-t border-[#2d2a26]">
      <div className="flex items-stretch">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onNav(tab.id)}
            className={cn(
              'flex-1 flex flex-col items-center justify-center gap-1 py-2 relative transition-colors',
              tab.active ? 'text-accent' : 'text-[#8E8E93] hover:text-[#AEAEB2]'
            )}
          >
            {tab.active && (
              <motion.span
                layoutId="bottom-tab-indicator"
                className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[2px] bg-accent"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <motion.div
              className="relative"
              animate={tab.active ? { scale: 1.08 } : { scale: 1 }}
              transition={{ duration: 0.25, ease: easeOutQuart }}
            >
              {tab.icon}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-[14px] h-[14px] px-1 rounded-full bg-accent text-black text-[8px] hv font-black flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </motion.div>
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
      <div style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} />
    </nav>
  );
}
