import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Calendar, Settings, BarChart3, LogOut, ChevronRight, ChevronDown,
  Plus, Download, Filter, Building2, X, ArrowLeft, Menu, Map, Pencil, Trash2,
  UserCheck, Bell, Clock, TrendingUp, CheckCircle2, XCircle, Users, Eye, EyeOff,
  DoorOpen, LogIn, Search, Copy, Wine
} from 'lucide-react';
import { INITIAL_VENUES, INITIAL_EVENTS, INITIAL_RESERVATIONS, INITIAL_MANAGED_USERS, INITIAL_BOTTLE_MENU } from './constants';
import { UserProfile, Event, Reservation, Venue, FloorPlan, ManagedUser, PrGroup, BottleMenuItem } from './types';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, COLORS, easeOutQuart, gridContainer, gridItem, isEventVisibleToPr, isEventVisibleToHost, eventEndDateTime, findTable, calcActualBudget } from './lib/utils';
import {
  isEmailConfigured, sendPasswordResetEmail,
  notifyReservationApproved, notifyReservationRejected,
  notifyPrAccountApproved, notifyAdminNewPrSignup,
} from './lib/emailService';
import { isFirebaseConfigured, signInWithGoogle, signInWithApple } from './lib/firebase';
import { subscribeToReservations } from './lib/reservationService';
import SplashScreen from './components/SplashScreen';
import PRLinkGenerator from './components/pr/PRLinkGenerator';
import PRStatsView from './components/pr/PRStatsView';
import QuickAddModal from './components/pr/QuickAddModal';
import Dashboard from './components/dashboard/Dashboard';
import PendingApprovalsView from './components/admin/PendingApprovalsView';
import LiveControlRoom from './components/admin/LiveControlRoom';
import { SidebarContent, BottomTabBar, PageTitle, EmptyState } from './components/layout/AppShell';
import CommandPalette from './components/layout/CommandPalette';
import { VenueCard, EventCard } from './components/cards/EntityCards';
import ReservationsTable from './components/reservations/ReservationsTable';
import { BottleMenuModal, NewEventModal, NewClubModal, NewFloorPlanModal, FloorPlanMetaModal, ReservationQuickEditModal } from './components/modals/EntityModals';
import { PRProfile, PRManagementPage, HistoryEventRow } from './components/admin/PrManagement';

// Lazy: dipendenze pesanti (konva, html5-qrcode, gemini) caricate al primo uso.
const FloorPlanViewer = lazy(() => import('./components/floorplan/FloorPlanViewer'));
const FloorPlanEditor = lazy(() => import('./components/floorplan/FloorPlanEditor'));
const AIChat          = lazy(() => import('./components/ai/AIChat'));
const EventDetailView = lazy(() => import('./components/admin/EventDetailView'));
const HostCheckinView = lazy(() => import('./components/host/HostCheckinView'));

const SAVED_ACCOUNTS = [
  { label: 'Admin',        email: 'g.scanni7@gmail.com',      password: '1234' },
  { label: 'PR',           email: 'lucavisca@gmail.com',      password: '1234' },
  { label: 'Accoglienza',  email: 'accoglienza@nightplan.it', password: '1234' },
];

type AppView = 'dashboard' | 'venues' | 'venue-events' | 'event-detail' | 'events' | 'active-events' | 'plan' | 'editor' | 'reservations' | 'approvals' | 'profile' | 'history' | 'pr-management' | 'checkin';

interface Toast { id: string; message: string; sub?: string; action?: { label: string; onClick: () => void }; }

const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com','guerrillamail.com','guerrillamail.net','guerrillamail.org','guerrillamail.de',
  'guerrillamail.info','guerrillamail.biz','guerrillamailblock.com','grr.la','sharklasers.com',
  'spam4.me','trashmail.com','trashmail.me','trashmail.at','trashmail.io','trashmail.xyz',
  'dispostable.com','fakeinbox.com','tempr.email','discard.email','yopmail.com',
  '10minutemail.com','10minutemail.net','tempmail.com','tempmail.net','tempmail.org',
  'throwaway.email','maildrop.cc','mailnesia.com','spamgourmet.com','wegwerfmail.de',
  'mytrashmail.com','throwam.com','mailtemp.info','mailtemp.net','luxusmail.org',
  'spamfree24.org','mailnull.com','spamify.com','trash-mail.at','fakemails.com',
  'fakemail.fr','jetable.fr.nf','getnada.com','spamhereplease.com',
  'getairmail.com','filzmail.com','owlpic.com','trbvm.com',
  'spamgourmet.net','spamgourmet.org','mailtemp.co.uk','anonaddy.com','33mail.com','spamex.com',
]);

// Provider noti → TLD validi. Se il nome del dominio corrisponde ma il TLD è sbagliato, l'errore suggerisce la correzione.
const KNOWN_PROVIDERS: Record<string, { tlds: string[]; canonical: string }> = {
  gmail:       { tlds: ['com'],                                              canonical: 'gmail.com' },
  googlemail:  { tlds: ['com'],                                              canonical: 'gmail.com' },
  outlook:     { tlds: ['com','it','fr','de','es','be','at','ch','co.uk'],   canonical: 'outlook.com' },
  hotmail:     { tlds: ['com','it','fr','de','es','be','at','ch','co.uk'],   canonical: 'hotmail.com' },
  live:        { tlds: ['com','it','fr','de','es','be','at','ch','co.uk'],   canonical: 'live.com' },
  msn:         { tlds: ['com'],                                              canonical: 'msn.com' },
  yahoo:       { tlds: ['com','it','fr','de','es','co.uk','co.jp','gr','ro'],canonical: 'yahoo.com' },
  ymail:       { tlds: ['com'],                                              canonical: 'ymail.com' },
  icloud:      { tlds: ['com'],                                              canonical: 'icloud.com' },
  me:          { tlds: ['com'],                                              canonical: 'me.com' },
  mac:         { tlds: ['com'],                                              canonical: 'mac.com' },
  libero:      { tlds: ['it'],                                               canonical: 'libero.it' },
  virgilio:    { tlds: ['it'],                                               canonical: 'virgilio.it' },
  alice:       { tlds: ['it'],                                               canonical: 'alice.it' },
  tin:         { tlds: ['it'],                                               canonical: 'tin.it' },
  tiscali:     { tlds: ['it','co.uk','de','fr','es'],                        canonical: 'tiscali.it' },
  fastwebnet:  { tlds: ['it'],                                               canonical: 'fastwebnet.it' },
  protonmail:  { tlds: ['com'],                                              canonical: 'protonmail.com' },
  proton:      { tlds: ['me','com'],                                         canonical: 'proton.me' },
  tutanota:    { tlds: ['com','de'],                                         canonical: 'tutanota.com' },
  tutamail:    { tlds: ['com'],                                              canonical: 'tutamail.com' },
  tuta:        { tlds: ['io'],                                               canonical: 'tuta.io' },
  zoho:        { tlds: ['com'],                                              canonical: 'zoho.com' },
  aol:         { tlds: ['com'],                                              canonical: 'aol.com' },
  gmx:         { tlds: ['com','de','net','at','it','fr','es','ch'],          canonical: 'gmx.com' },
  fastmail:    { tlds: ['com','fm'],                                         canonical: 'fastmail.com' },
  posteo:      { tlds: ['de','net','eu','org'],                              canonical: 'posteo.de' },
};

function validateEmail(email: string): string {
  const trimmed = email.trim().toLowerCase();
  if (!/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,6}$/.test(trimmed))
    return 'Formato email non valido (TLD non valido).';
  const [local, domain] = trimmed.split('@');
  if (DISPOSABLE_DOMAINS.has(domain))
    return 'Email temporanee non ammesse.';
  
  const parts = domain.split('.');
  const tld = parts[parts.length - 1];
  
  // Blocca TLD comuni sbagliati
  const commonTypos: Record<string, string> = {
    'con': 'com',
    'itit': 'it',
    'om': 'com',
    'nt': 'net',
    'ed': 'edu'
  };
  
  if (commonTypos[tld]) {
    return `TLD ".${tld}" non valido. Intendevi ".${commonTypos[tld]}"?`;
  }

  // Controlla se il provider è noto ma il TLD è sbagliato
  const providerName = parts[0];
  const known = KNOWN_PROVIDERS[providerName];
  if (known && !known.tlds.includes(tld))
    return `"${domain}" non esiste. Intendevi ${known.canonical}?`;

  return '';
}

function validatePhone(phone: string): string {
  const stripped = phone.trim().replace(/[\s\-\(\)\.]/g, '');
  if (!stripped) return 'Numero di telefono obbligatorio.';
  if (stripped.startsWith('+')) {
    if (stripped.startsWith('+39')) {
      const nat = stripped.slice(3);
      if (/^3\d{9}$/.test(nat) || /^0\d{8,9}$/.test(nat)) return '';
      return 'Numero italiano non valido. Es: +39 333 000 0000';
    }
    if (/^\+\d{7,15}$/.test(stripped)) return '';
    return 'Numero internazionale non valido.';
  }
  if (/^3\d{9}$/.test(stripped)) return '';
  if (/^0\d{8,9}$/.test(stripped)) return '';
  if (stripped.length < 9) return 'Numero troppo corto.';
  if (stripped.length > 15) return 'Numero troppo lungo.';
  return 'Formato non valido. Es: +39 333 000 0000 oppure 333 000 0000';
}

const PAGE_FADE = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
  transition: { duration: 0.32, ease: easeOutQuart },
};
const PAGE_FORWARD = {
  initial: { opacity: 0, x: 28 },
  animate: { opacity: 1, x: 0 },
  exit:    { opacity: 0, x: -16 },
  transition: { duration: 0.32, ease: easeOutQuart },
};
const PAGE_BACK = {
  initial: { opacity: 0, x: -28 },
  animate: { opacity: 1, x: 0 },
  exit:    { opacity: 0, x: 16 },
  transition: { duration: 0.32, ease: easeOutQuart },
};

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('nightplan_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>(() => {
    try {
      const saved = localStorage.getItem('nightplan_managed_users');
      if (!saved) return INITIAL_MANAGED_USERS;
      const parsed: ManagedUser[] = JSON.parse(saved);
      const merged = [...parsed];
      for (const sys of INITIAL_MANAGED_USERS) {
        if (!merged.find(u => u.id === sys.id)) merged.unshift(sys);
        else {
          const idx = merged.findIndex(u => u.id === sys.id);
          merged[idx] = { ...merged[idx], role: sys.role, status: 'approved' };
        }
      }
      return merged;
    } catch { return INITIAL_MANAGED_USERS; }
  });
  const [authScreen, setAuthScreen] = useState<'login' | 'register' | 'forgot' | 'reset'>('login');
  const [showSplash, setShowSplash] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [regName, setRegName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regError, setRegError] = useState('');
  const [regEmailError, setRegEmailError] = useState('');
  const [regPhoneError, setRegPhoneError] = useState('');
  const [regDone, setRegDone] = useState(false);
  const [regConsent, setRegConsent] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotDevLink, setForgotDevLink] = useState('');
  const [resetTokenState, setResetTokenState] = useState('');
  const [resetEmailState, setResetEmailState] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetDone, setResetDone] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showNewPasswordField, setShowNewPasswordField] = useState(false);
  const [loginShake, setLoginShake] = useState(0);
  const loginFormRef = useRef<HTMLFormElement>(null);
  const [view, setView] = useState<AppView>('venues');
  const [venues, setVenues] = useState(INITIAL_VENUES);
  const [events, setEvents] = useState<Event[]>(() => {
    try {
      const saved = localStorage.getItem('nightplan_events');
      return saved ? JSON.parse(saved) : INITIAL_EVENTS;
    } catch { return INITIAL_EVENTS; }
  });
  const [reservations, setReservations] = useState<Reservation[]>(() => {
    try {
      const saved = localStorage.getItem('nightplan_reservations');
      return saved ? JSON.parse(saved) : INITIAL_RESERVATIONS;
    } catch { return INITIAL_RESERVATIONS; }
  });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [editingFloorPlan, setEditingFloorPlan] = useState<{ venueId: string; fp: FloorPlan } | null>(null);
  const [showNewClubModal, setShowNewClubModal] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [showNewFloorPlanModal, setShowNewFloorPlanModal] = useState(false);
  const [editingFloorPlanMeta, setEditingFloorPlanMeta] = useState<{ venueId: string; fp: FloorPlan } | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [duplicatingEvent, setDuplicatingEvent] = useState<Event | null>(null);
  const [regiaEvent, setRegiaEvent] = useState<Event | null>(null);
  const [editorVenueId, setEditorVenueId] = useState<string | null>(null);
  const [venueTab, setVenueTab] = useState<'events' | 'layout'>('events');
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [selectedPR, setSelectedPR] = useState<ManagedUser | null>(null);
  const [serateFilter, setSerateFilter] = useState<'attive' | 'concluse'>('attive');
  const [prGroups, setPrGroups] = useState<PrGroup[]>(() => {
    try {
      const saved = localStorage.getItem('nightplan_pr_groups');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [bottleMenu, setBottleMenu] = useState<BottleMenuItem[]>(() => {
    try {
      const saved = localStorage.getItem('nightplan_bottle_menu');
      return saved ? JSON.parse(saved) : INITIAL_BOTTLE_MENU;
    } catch { return INITIAL_BOTTLE_MENU; }
  });
  const [showBottleMenu, setShowBottleMenu] = useState(false);

  /* ── Page transition direction ───────────────────────────── */
  const prevDepthRef = useRef<number>(1);
  const [navDirection, setNavDirection] = useState<'forward' | 'back' | 'none'>('none');

  const computeDepth = (): number => {
    if (view === 'plan' || view === 'editor') return 3;
    if (view === 'venue-events') return 2;
    if (view === 'pr-management' && selectedPR) return 2;
    return 1;
  };

  useEffect(() => {
    const depth = computeDepth();
    const prev = prevDepthRef.current;
    if (depth > prev) setNavDirection('forward');
    else if (depth < prev) setNavDirection('back');
    else setNavDirection('none');
    prevDepthRef.current = depth;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, selectedPR]);


  const PAGE = navDirection === 'forward'
    ? PAGE_FORWARD
    : navDirection === 'back'
    ? PAGE_BACK
    : PAGE_FADE;

  /* ── Command Palette ─────────────────────────────────────── */
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen(o => !o);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  /* ── URL ↔ state sync (react-router) ─────────────────────── */
  const navigate = useNavigate();
  const location = useLocation();
  const ignoreNextLocationChange = useRef(false);

  const buildPath = (): string => {
    if (!user) return '/login';
    switch (view) {
      case 'dashboard':      return '/home';
      case 'venues':         return '/clubs';
      case 'venue-events':   return selectedVenue ? `/clubs/${selectedVenue.id}` : '/clubs';
      case 'plan':           return (selectedVenue && selectedEvent)
                                ? `/clubs/${selectedVenue.id}/serate/${selectedEvent.id}/pianta`
                                : '/clubs';
      case 'editor':         return editorVenueId
                                ? `/clubs/${editorVenueId}/editor/${editingFloorPlan?.fp.id ?? 'new'}`
                                : '/clubs';
      case 'active-events':  return '/serate-attive';
      case 'events':         return '/serate';
      case 'reservations':   return '/prenotazioni';
      case 'approvals':      return '/approvazioni';
      case 'profile':        return '/profilo';
      case 'history':        return '/storico';
      case 'pr-management':  return selectedPR ? `/pr-team/${selectedPR.id}` : '/pr-team';
      case 'checkin':        return '/ingresso';
      default:               return '/clubs';
    }
  };

  const applyFromUrl = (path: string) => {
    // /clubs/:venueId/serate/:eventId/pianta
    let m = path.match(/^\/clubs\/([^/]+)\/serate\/([^/]+)\/pianta$/);
    if (m) {
      const venue = venues.find(v => v.id === m[1]);
      const event = events.find(e => e.id === m[2]);
      if (venue && event) {
        setSelectedVenue(venue);
        setSelectedEvent(event);
        setView('plan');
      }
      return;
    }
    // /clubs/:venueId/editor/:fpId
    m = path.match(/^\/clubs\/([^/]+)\/editor\/([^/]+)$/);
    if (m) {
      setEditorVenueId(m[1]);
      const venue = venues.find(v => v.id === m[1]);
      const fp = venue?.floorPlans.find(f => f.id === m[2]);
      if (venue && fp) setEditingFloorPlan({ venueId: venue.id, fp });
      setView('editor');
      return;
    }
    // /clubs/:venueId
    m = path.match(/^\/clubs\/([^/]+)$/);
    if (m) {
      const venue = venues.find(v => v.id === m[1]);
      if (venue) {
        setSelectedVenue(venue);
        setView('venue-events');
      }
      return;
    }
    // /pr-team/:prId
    m = path.match(/^\/pr-team\/([^/]+)$/);
    if (m) {
      const pr = managedUsers.find(u => u.id === m[1]);
      if (pr) {
        setSelectedPR(pr);
        setView('pr-management');
      }
      return;
    }
    // Top-level routes
    const topMap: Record<string, AppView> = {
      '/home':          'dashboard',
      '/clubs':         'venues',
      '/serate-attive': 'active-events',
      '/serate':        'events',
      '/prenotazioni':  'reservations',
      '/approvazioni':  'approvals',
      '/profilo':       'profile',
      '/storico':       'history',
      '/pr-team':       'pr-management',
      '/ingresso':      'checkin',
    };
    if (topMap[path]) {
      setView(topMap[path]);
    }
  };

  // URL → State (initial mount, browser back/forward, refresh).
  // NB: `user` NON è una dipendenza di proposito: al login il landing è
  // deciso da setView() nei handler; se riapplicassimo l'URL qui
  // sovrascriveremmo quella scelta (es. URL rimasto su /clubs dopo un logout).
  useEffect(() => {
    if (!user) return;
    if (ignoreNextLocationChange.current) {
      ignoreNextLocationChange.current = false;
      return;
    }
    applyFromUrl(location.pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // State → URL
  useEffect(() => {
    if (!user) return;
    const path = buildPath();
    if (location.pathname !== path) {
      ignoreNextLocationChange.current = true;
      navigate(path, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, selectedVenue, selectedEvent, editorVenueId, editingFloorPlan, selectedPR, user]);

  useEffect(() => {
    localStorage.setItem('nightplan_managed_users', JSON.stringify(managedUsers));
  }, [managedUsers]);

  useEffect(() => {
    localStorage.setItem('nightplan_reservations', JSON.stringify(reservations));
  }, [reservations]);

  useEffect(() => {
    localStorage.setItem('nightplan_pr_groups', JSON.stringify(prGroups));
  }, [prGroups]);

  useEffect(() => {
    localStorage.setItem('nightplan_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('nightplan_bottle_menu', JSON.stringify(bottleMenu));
  }, [bottleMenu]);

  /* Auto-archiviazione: una serata con orario di fine viene conclusa
     automaticamente qualche ora dopo la fine (margine), così non taglia
     il check-in in corso. Senza backend il controllo gira all'apertura
     dell'app e ogni 10 minuti mentre è aperta. */
  useEffect(() => {
    const GRACE_MS = 4 * 60 * 60 * 1000;
    const sweep = () => {
      const now = Date.now();
      setEvents(prev => {
        let changed = false;
        const next = prev.map(e => {
          if (e.status !== 'active') return e;
          const end = eventEndDateTime(e);
          if (end && now > end.getTime() + GRACE_MS) { changed = true; return { ...e, status: 'completed' as const }; }
          return e;
        });
        return changed ? next : prev;
      });
    };
    sweep();
    const id = setInterval(sweep, 10 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  /* ── Firestore real-time sync for reservations ───────────── */
  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    const unsub = subscribeToReservations((firestoreRes) => {
      if (firestoreRes.length > 0) {
        setReservations(firestoreRes);
      }
    });
    return unsub;
  }, []);

  /* ── Browser notifications for new pending reservations ─── */
  const seenReservationIdsRef = useRef<Set<string>>(new Set());
  const notifPermissionRef = useRef(false);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      notifPermissionRef.current = true;
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(perm => {
        notifPermissionRef.current = perm === 'granted';
      });
    }
  }, [user]);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    reservations.forEach(r => {
      if (r.approvalStatus === 'pending' && !seenReservationIdsRef.current.has(r.id)) {
        seenReservationIdsRef.current.add(r.id);
        // Only notify if we've already gone through at least one scan (skip initial load)
        if (seenReservationIdsRef.current.size > 1 || notifPermissionRef.current) {
          if (notifPermissionRef.current && Notification.permission === 'granted') {
            new Notification('Nuova prenotazione', {
              body: `${r.customerName} (${r.guestsCount} pers.)`,
              icon: '/Logo.png',
            });
          }
        }
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reservations]);

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.startsWith('#reset=')) return;
    const token = hash.slice(7);
    type RT = { token: string; email: string; expiresAt: number };
    const tokens: RT[] = JSON.parse(localStorage.getItem('nightplan_reset_tokens') ?? '[]');
    const found = tokens.find(t => t.token === token && t.expiresAt > Date.now());
    if (found) {
      setResetTokenState(token);
      setResetEmailState(found.email);
      setAuthScreen('reset');
      if (user) { handleLogout(); }
    } else {
      window.location.hash = '';
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (loginShake === 0 || !loginFormRef.current) return;
    const el = loginFormRef.current;
    el.classList.add('shake');
    const t = setTimeout(() => el.classList.remove('shake'), 500);
    return () => clearTimeout(t);
  }, [loginShake]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const found = managedUsers.find(
      u => u.email.toLowerCase() === loginEmail.trim().toLowerCase() && u.password === loginPassword
    );
    if (!found) { setLoginError('Email o password non corretti.'); setLoginShake(s => s + 1); return; }
    if (found.status === 'pending')  { setLoginError('Il tuo account è in attesa di approvazione.'); setLoginShake(s => s + 1); return; }
    if (found.status === 'rejected') { setLoginError('Il tuo account non è stato approvato.'); setLoginShake(s => s + 1); return; }
    const profile: UserProfile = { id: found.id, email: found.email, role: found.role, displayName: found.displayName, lastName: found.lastName, phone: found.phone, profileImage: found.profileImage };
    localStorage.setItem('nightplan_user', JSON.stringify(profile));
    setUser(profile);
    setView(profile.role === 'host' ? 'checkin' : 'dashboard');
    setLoginError('');
  };

  const handleGoogleSignIn = async () => {
    const setErr = authScreen === 'register' ? setRegError : setLoginError;
    setErr('');
    try {
      const g = await signInWithGoogle();

      // Admin o PR già esistente?
      const sysUser = INITIAL_MANAGED_USERS.find(u => u.email.toLowerCase() === g.email.toLowerCase());
      if (sysUser) {
        const profile: UserProfile = { id: sysUser.id, email: sysUser.email, role: sysUser.role, displayName: sysUser.displayName, lastName: sysUser.lastName, phone: sysUser.phone, profileImage: g.photoURL };
        localStorage.setItem('nightplan_user', JSON.stringify(profile));
        setUser(profile);
        setView(profile.role === 'host' ? 'checkin' : 'dashboard');
        return;
      }

      const managed = managedUsers.find(u => u.email.toLowerCase() === g.email.toLowerCase());
      if (managed) {
        if (managed.status === 'approved') {
          const profile: UserProfile = { id: managed.id, email: managed.email, role: 'pr', displayName: managed.displayName, lastName: managed.lastName, phone: managed.phone, profileImage: g.photoURL };
          localStorage.setItem('nightplan_user', JSON.stringify(profile));
          setUser(profile);
          setView(profile.role === 'host' ? 'checkin' : 'dashboard');
        } else if (managed.status === 'pending') {
          setErr('Il tuo account è in attesa di approvazione.');
        } else {
          setErr('Il tuo account non è stato approvato.');
        }
        return;
      }

      // Nuovo utente → crea account PR in attesa
      const newUser: ManagedUser = {
        id: `pr_${Date.now()}`,
        email: g.email,
        password: '',
        role: 'pr',
        displayName: g.displayName || g.email.split('@')[0],
        lastName: g.lastName,
        phone: '',
        status: 'pending',
        createdAt: new Date().toISOString(),
        profileImage: g.photoURL,
      };
      setManagedUsers(prev => [...prev, newUser]);
      setErr('Account creato con Google! In attesa di approvazione dall\'admin.');
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        setErr('Errore durante l\'accesso con Google. Riprova.');
      }
    }
  };

  const handleAppleSignIn = async () => {
    const setErr = authScreen === 'register' ? setRegError : setLoginError;
    setErr('');
    try {
      const g = await signInWithApple();
      const sysUser = INITIAL_MANAGED_USERS.find(u => u.email.toLowerCase() === g.email.toLowerCase());
      if (sysUser) {
        const profile: UserProfile = { id: sysUser.id, email: sysUser.email, role: sysUser.role, displayName: sysUser.displayName, lastName: sysUser.lastName, phone: sysUser.phone, profileImage: g.photoURL };
        localStorage.setItem('nightplan_user', JSON.stringify(profile));
        setUser(profile);
        setView(profile.role === 'host' ? 'checkin' : 'dashboard');
        return;
      }
      const managed = managedUsers.find(u => u.email.toLowerCase() === g.email.toLowerCase());
      if (managed) {
        if (managed.status === 'approved') {
          const profile: UserProfile = { id: managed.id, email: managed.email, role: 'pr', displayName: managed.displayName, lastName: managed.lastName, phone: managed.phone, profileImage: g.photoURL };
          localStorage.setItem('nightplan_user', JSON.stringify(profile));
          setUser(profile);
          setView(profile.role === 'host' ? 'checkin' : 'dashboard');
        } else if (managed.status === 'pending') {
          setErr('Il tuo account è in attesa di approvazione.');
        } else {
          setErr('Il tuo account non è stato approvato.');
        }
        return;
      }
      const newUser: ManagedUser = {
        id: `pr_${Date.now()}`,
        email: g.email,
        password: '',
        role: 'pr',
        displayName: g.displayName || g.email.split('@')[0],
        lastName: g.lastName,
        phone: '',
        status: 'pending',
        createdAt: new Date().toISOString(),
        profileImage: g.photoURL,
      };
      setManagedUsers(prev => [...prev, newUser]);
      setErr('Account creato con Apple! In attesa di approvazione dall\'admin.');
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        setErr('Errore durante l\'accesso con Apple. Riprova.');
      }
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const emailErr = validateEmail(regEmail);
    const phoneErr = validatePhone(regPhone);
    setRegEmailError(emailErr);
    setRegPhoneError(phoneErr);
    if (emailErr || phoneErr) return;
    if (!regConsent) { setRegError('Per registrarti devi accettare i Termini e la Privacy Policy.'); return; }
    const exists = managedUsers.find(u => u.email.toLowerCase() === regEmail.trim().toLowerCase());
    if (exists) { setRegError('Email già registrata.'); return; }
    const newUser: ManagedUser = {
      id: `pr_${Date.now()}`,
      email: regEmail.trim().toLowerCase(),
      password: regPassword,
      role: 'pr',
      displayName: regName.trim(),
      lastName: regLastName.trim(),
      phone: regPhone.trim(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setManagedUsers(prev => [...prev, newUser]);
    setRegDone(true);
    // Notifica admin (tutti gli admin attivi)
    const admins = managedUsers.filter(u => u.role === 'admin' && u.status === 'approved');
    admins.forEach(a => notifyAdminNewPrSignup({
      adminEmail: a.email,
      prName: `${newUser.displayName} ${newUser.lastName}`.trim(),
      prEmail: newUser.email,
      prPhone: newUser.phone,
    }));
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = managedUsers.find(u => u.email.toLowerCase() === forgotEmail.trim().toLowerCase());
    if (!found) { setForgotError('Nessun account trovato con questa email.'); return; }
    const token = Math.random().toString(36).substr(2, 16) + Date.now().toString(36);
    const resetLink = `${window.location.origin}${window.location.pathname}#reset=${token}`;
    type RT = { token: string; email: string; expiresAt: number };
    const tokens: RT[] = JSON.parse(localStorage.getItem('nightplan_reset_tokens') ?? '[]');
    tokens.push({ token, email: found.email, expiresAt: Date.now() + 30 * 60 * 1000 });
    localStorage.setItem('nightplan_reset_tokens', JSON.stringify(tokens));
    if (isEmailConfigured()) {
      try {
        await sendPasswordResetEmail(found.email, found.displayName, resetLink);
        setForgotSent(true);
      } catch {
        setForgotDevLink(resetLink);
        setForgotSent(true);
      }
    } else {
      setForgotDevLink(resetLink);
      setForgotSent(true);
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTokenState || !resetEmailState) return;
    setManagedUsers(prev => prev.map(u =>
      u.email === resetEmailState ? { ...u, password: newPassword } : u
    ));
    type RT = { token: string; email: string; expiresAt: number };
    const tokens: RT[] = JSON.parse(localStorage.getItem('nightplan_reset_tokens') ?? '[]');
    localStorage.setItem('nightplan_reset_tokens', JSON.stringify(tokens.filter((t: RT) => t.token !== resetTokenState)));
    window.location.hash = '';
    setResetDone(true);
  };

  const handleUpdateProfile = (updates: { displayName: string; lastName: string; profileImage?: string }) => {
    setManagedUsers(prev => prev.map(u => u.id === user!.id ? { ...u, ...updates } : u));
    const updated: UserProfile = { ...user!, ...updates };
    setUser(updated);
    localStorage.setItem('nightplan_user', JSON.stringify(updated));
  };

  const addToast = (message: string, sub?: string, action?: { label: string; onClick: () => void }) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, sub, action }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  };

  const handleCheckIn = (reservationId: string, actualPeople: number) => {
    const res = reservations.find(r => r.id === reservationId);
    if (!res) return;
    const table = findTable(res, events, venues);
    const actualBudget = calcActualBudget(res.budget, actualPeople, table);
    setReservations(prev => prev.map(r =>
      r.id === reservationId ? { ...r, checkedIn: true, actualPeople, actualBudget } : r
    ));
    const diff = actualBudget - res.budget;
    const budgetStr = diff > 0 ? `€${actualBudget} (+€${diff})` : `€${actualBudget}`;
    addToast(`${res.customerName} — entrati`, `${actualPeople} ospiti · Tav. ${res.tableName ?? res.tableId} · ${budgetStr}`);
  };

  const handleUndoCheckIn = (reservationId: string) => {
    setReservations(prev => prev.map(r =>
      r.id === reservationId ? { ...r, checkedIn: false, actualPeople: undefined, actualBudget: undefined } : r
    ));
  };

  const handleUpdatePeople = (reservationId: string, actualPeople: number) => {
    const res = reservations.find(r => r.id === reservationId);
    if (!res) return;
    const table = findTable(res, events, venues);
    const actualBudget = calcActualBudget(res.budget, actualPeople, table);
    setReservations(prev => prev.map(r =>
      r.id === reservationId ? { ...r, actualPeople, actualBudget } : r
    ));
    const diff = actualBudget - res.budget;
    const budgetStr = diff > 0 ? `€${actualBudget} (+€${diff})` : `€${actualBudget}`;
    addToast(`${res.customerName} — aggiornato`, `${actualPeople} ospiti · ${budgetStr}`);
  };

  const handleApproveUser = (id: string) => {
    const u = managedUsers.find(x => x.id === id);
    setManagedUsers(prev => prev.map(x => x.id === id ? { ...x, status: 'approved' } : x));
    addToast('PR approvato', u ? `${u.displayName} ${u.lastName}` : undefined,
      { label: 'Annulla', onClick: () => setManagedUsers(prev => prev.map(x => x.id === id ? { ...x, status: 'pending' } : x)) });
    if (u && u.role === 'pr') {
      notifyPrAccountApproved({ prEmail: u.email, prName: `${u.displayName} ${u.lastName}`.trim() });
    }
  };
  const handleRejectUser = (id: string) => {
    const u = managedUsers.find(x => x.id === id);
    setManagedUsers(prev => prev.map(x => x.id === id ? { ...x, status: 'rejected' } : x));
    addToast('PR rifiutato', u ? `${u.displayName} ${u.lastName}` : undefined,
      { label: 'Annulla', onClick: () => setManagedUsers(prev => prev.map(x => x.id === id ? { ...x, status: 'pending' } : x)) });
  };
  const handleApproveReservation = (id: string) => {
    const r = reservations.find(x => x.id === id);
    setReservations(prev => prev.map(x => x.id === id ? { ...x, approvalStatus: 'approved' } : x));
    addToast('Prenotazione approvata', r?.customerName,
      { label: 'Annulla', onClick: () => setReservations(prev => prev.map(x => x.id === id ? { ...x, approvalStatus: 'pending' } : x)) });
    if (r) {
      const pr = managedUsers.find(u => u.id === r.prId);
      const ev = events.find(e => e.id === r.eventId);
      if (pr && ev) notifyReservationApproved({
        prEmail: pr.email, prName: `${pr.displayName} ${pr.lastName}`.trim(),
        customerName: r.customerName, tableName: r.tableName ?? r.tableId,
        eventName: ev.name, eventDate: ev.date,
      });
    }
  };
  const handleRejectReservation = (id: string) => {
    const r = reservations.find(x => x.id === id);
    setReservations(prev => prev.map(x => x.id === id ? { ...x, approvalStatus: 'rejected' } : x));
    addToast('Prenotazione rifiutata', r?.customerName,
      { label: 'Annulla', onClick: () => setReservations(prev => prev.map(x => x.id === id ? { ...x, approvalStatus: 'pending' } : x)) });
    if (r) {
      const pr = managedUsers.find(u => u.id === r.prId);
      const ev = events.find(e => e.id === r.eventId);
      if (pr && ev) notifyReservationRejected({
        prEmail: pr.email, prName: `${pr.displayName} ${pr.lastName}`.trim(),
        customerName: r.customerName, tableName: r.tableName ?? r.tableId,
        eventName: ev.name, eventDate: ev.date,
      });
    }
  };

  const exportGuestList = (eventId?: string) => {
    const target = eventId
      ? reservations.filter(r => r.eventId === eventId && (r.approvalStatus === 'approved' || r.checkedIn))
      : reservations.filter(r => activeEvents.some(e => e.id === r.eventId) && (r.approvalStatus === 'approved' || r.checkedIn));
    if (target.length === 0) return;
    const headers = ['Nome', 'Tavolo', 'PR', 'Ospiti', 'Budget', 'Entrato'];
    const rows = target.map(r => [
      r.customerName,
      r.tableName ?? r.tableId,
      r.prName,
      r.actualPeople ?? r.guestsCount,
      r.actualBudget ?? r.budget,
      r.checkedIn ? 'sì' : 'no',
    ]);
    const csv = [headers, ...rows]
      .map(row => row.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const evName = eventId ? events.find(e => e.id === eventId)?.name ?? 'serata' : 'ospiti';
    a.download = `${evName.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLogout = () => {
    localStorage.removeItem('nightplan_user');
    setUser(null); setSelectedVenue(null); setSelectedEvent(null);
    setLoginEmail(''); setLoginPassword(''); setLoginError('');
    setAuthScreen('login');
    setRegDone(false); setRegName(''); setRegLastName(''); setRegEmail(''); setRegPassword(''); setRegPhone(''); setRegError(''); setRegEmailError(''); setRegPhoneError('');
    setForgotEmail(''); setForgotError(''); setForgotSent(false); setForgotDevLink('');
    setNewPassword(''); setResetError(''); setResetDone(false);
  };

  const openVenue = (venue: Venue) => { setSelectedVenue(venue); setVenueTab('events'); setView('venue-events'); };
  const openEvent = (event: Event) => {
    if (!selectedVenue) setSelectedVenue(venues.find(v => v.id === event.venueId) ?? null);
    setSelectedEvent(event);
    setView(user?.role === 'admin' ? 'event-detail' : 'plan');
    setMobileSidebarOpen(false);
  };
  const goBack = () => {
    if (view === 'plan') { setSelectedEvent(null); setView('event-detail'); }
    else if (view === 'event-detail') { setSelectedEvent(null); setView(selectedVenue ? 'venue-events' : 'active-events'); }
    else if (view === 'venue-events') { setSelectedVenue(null); setView('venues'); }
    else if (view === 'active-events') { setView('venues'); }
  };

  const getFloorPlan = (event: Event): FloorPlan | undefined => {
    const venue = venues.find(v => v.id === event.venueId);
    return venue?.floorPlans.find(fp => fp.id === event.floorPlanId) ?? venue?.floorPlans[0];
  };

  const activeEvents  = events.filter(e => e.status === 'active');
  // Liste filtrate per ruolo: l'admin vede tutto, il PR solo gli eventi a lui assegnati,
  // l'host solo quelli attivati per l'ingresso.
  const prVisibleEvents   = user ? activeEvents.filter(e => isEventVisibleToPr(e, user.id)) : activeEvents;
  const hostVisibleEvents = activeEvents.filter(isEventVisibleToHost);
  const venueEvents   = selectedVenue ? events.filter(e => e.venueId === selectedVenue.id) : [];
  const showBack      = view === 'plan' || view === 'venue-events' || view === 'active-events';

  const activeEventIds = new Set(activeEvents.map(e => e.id));
  const totalTables = activeEvents.reduce((sum, event) => {
    const venue = venues.find(v => v.id === event.venueId);
    const fp = venue?.floorPlans.find(f => f.id === event.floorPlanId) ?? venue?.floorPlans[0];
    return sum + (fp?.tables.length ?? 0);
  }, 0);
  const bookedReservations = reservations.filter(
    r => (r.status === 'confirmed' || r.status === 'blocked') && activeEventIds.has(r.eventId)
  );
  const occupancyPct = totalTables > 0 ? Math.round((bookedReservations.length / totalTables) * 100) : 0;
  const revenueEst   = bookedReservations.reduce((sum, r) => sum + (r.actualBudget ?? r.budget), 0);

  const pendingUsers = managedUsers.filter(u => u.status === 'pending');
  const pendingResv  = reservations.filter(r => r.approvalStatus === 'pending');
  const pendingCount = pendingUsers.length + pendingResv.length;
  const prPendingCount = user?.role === 'pr' ? reservations.filter(r => r.prId === user.id && r.approvalStatus === 'pending').length : 0;

  const headerTitle = () => {
    if (view === 'venues')         return 'Location';
    if (view === 'venue-events')   return selectedVenue?.name ?? '';
    if (view === 'active-events')  return 'Prossimi eventi';
    if (view === 'events')         return 'Eventi';
    if (view === 'plan')           return selectedEvent?.name ?? '';
    if (view === 'editor')         return 'Layout Tavoli';
    if (view === 'reservations')   return 'Prenotazioni';
    if (view === 'approvals')      return 'Approvazioni';
    if (view === 'profile')        return 'Il Mio Profilo';
    if (view === 'history')        return 'Il Mio Storico';
    if (view === 'pr-management')  return selectedPR ? `${selectedPR.displayName} ${selectedPR.lastName}` : 'I Miei PR';
    if (view === 'checkin')        return 'Ingresso Serata';
    return '';
  };

  type Crumb = { label: string; onClick?: () => void };

  const breadcrumbs = (): Crumb[] => {
    if (view === 'venue-events' && selectedVenue) {
      return [
        { label: 'Clubs', onClick: () => { setSelectedVenue(null); setSelectedEvent(null); setView('venues'); } },
        { label: selectedVenue.name },
      ];
    }
    if (view === 'plan' && selectedVenue && selectedEvent) {
      return [
        { label: 'Clubs', onClick: () => { setSelectedVenue(null); setSelectedEvent(null); setView('venues'); } },
        { label: selectedVenue.name, onClick: () => { setSelectedEvent(null); setView('venue-events'); } },
        { label: 'Pianta' },
      ];
    }
    if (view === 'editor' && editorVenueId) {
      const v = venues.find(x => x.id === editorVenueId);
      return [
        { label: 'Clubs', onClick: () => { setEditorVenueId(null); setEditingFloorPlan(null); setView('venues'); } },
        { label: v?.name ?? '', onClick: () => { setEditorVenueId(null); setEditingFloorPlan(null); setView('venue-events'); } },
        { label: 'Editor' },
      ];
    }
    if (view === 'pr-management' && selectedPR) {
      return [
        { label: 'I Miei PR', onClick: () => setSelectedPR(null) },
        { label: `${selectedPR.displayName} ${selectedPR.lastName}` },
      ];
    }
    return [];
  };

  const contextBadges = (): { label: string; color: string }[] => {
    if (view === 'plan' && selectedEvent) {
      const evResv = reservations.filter(r => r.eventId === selectedEvent.id && r.approvalStatus === 'approved');
      const checkedIn = evResv.filter(r => r.checkedIn).length;
      const total = evResv.length;
      const status = selectedEvent.status;
      const statusBadge = status === 'active'
        ? { label: 'Attiva', color: COLORS.success }
        : status === 'draft'
        ? { label: 'Bozza', color: COLORS.warning }
        : { label: 'Conclusa', color: '#888' };
      const badges = [statusBadge];
      if (total > 0) badges.push({ label: `${checkedIn}/${total} entrati`, color: COLORS.accent });
      return badges;
    }
    return [];
  };

  const contextSubtitle = (): string => {
    if (view === 'venue-events' && selectedVenue) return selectedVenue.address;
    if (view === 'plan' && selectedEvent) {
      try {
        return new Date(selectedEvent.date).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      } catch { return selectedEvent.date; }
    }
    if (view === 'editor' && editingFloorPlan) return editingFloorPlan.fp.name;
    if (view === 'pr-management' && selectedPR) return selectedPR.email;
    return '';
  };

  /* ── LOGIN ──────────────────────────────────────────────── */
  if (!user) {

    /* ── SPLASH ── */
    if (showSplash) {
      return <SplashScreen onAccedi={() => setShowSplash(false)} />;
    }

    return (
      <div className="min-h-screen flex items-center justify-center relative" style={{ backgroundColor: '#0d0c0b' }}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_80%,rgba(212,98,42,0.05)_0%,transparent_100%)] pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, ease: 'easeOut' }}
          className="relative w-full max-w-sm z-10 px-6"
        >
          {/* Brand */}
          <button
            onClick={() => setShowSplash(true)}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            className="flex items-center justify-center gap-3 mb-8"
          >
            <img src="/Logo.png" alt="Nightplan" className="w-9 h-9 object-contain" />
            <div className="flex flex-col justify-center items-end">
              <span className="hv font-black text-white text-[15px] leading-tight">Nightplan</span>
              <span className="text-[9px] font-sans text-accent uppercase tracking-[0.3em] -mr-[0.3em] mt-[2px]">Management</span>
            </div>
          </button>
          {/* Card */}
          <div className="bg-[#141412] border border-white/[0.06] rounded-2xl p-8 shadow-[0_24px_60px_rgba(0,0,0,0.5)]">
            <div className="w-full">
            <AnimatePresence mode="wait">
              {authScreen === 'login' ? (
                <motion.div key="login" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>

                  {/* Header */}
                  <div className="mb-8">
                    <h2 className="font-bold text-[22px] text-white tracking-tight">Accedi</h2>
                  </div>

                  {/* Form email/password */}
                  <form ref={loginFormRef} onSubmit={handleLogin} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-[#636366]">Email</label>
                      <input
                        type="email"
                        list="nightplan-accounts"
                        autoComplete="off"
                        required
                        value={loginEmail}
                        onChange={e => {
                          setLoginEmail(e.target.value);
                          setLoginError('');
                          const match = SAVED_ACCOUNTS.find(a => a.email === e.target.value);
                          if (match) setLoginPassword(match.password);
                        }}
                        placeholder="tua@email.it"
                        className="auth-input w-full bg-[#0d0c0b] border border-[#3a3835] px-5 py-3.5 text-sm text-white placeholder-[#4a4845] font-sans"
                      />
                      <datalist id="nightplan-accounts">
                        {SAVED_ACCOUNTS.map(a => <option key={a.email} value={a.email}>{a.label}</option>)}
                      </datalist>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-[#636366]">Password</label>
                        <button type="button"
                          onClick={() => { setAuthScreen('forgot'); setForgotError(''); setForgotSent(false); setForgotDevLink(''); }}
                          className="text-xs font-medium text-[#8E8E93] hover:text-accent transition-colors">
                          Dimenticata?
                        </button>
                      </div>
                      <div className="relative">
                        <input type={showLoginPassword ? 'text' : 'password'} autoComplete="current-password" required value={loginPassword}
                          onChange={e => { setLoginPassword(e.target.value); setLoginError(''); }}
                          placeholder="••••••••"
                          className="auth-input w-full bg-[#0d0c0b] border border-[#3a3835] px-5 py-3.5 pr-11 text-sm text-white placeholder-[#4a4845] font-sans" />
                        <button type="button" onClick={() => setShowLoginPassword(o => !o)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8E8E93] hover:text-accent transition-colors">
                          {showLoginPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>
                    {loginError && <p className="text-red-400 text-xs pt-1">{loginError}</p>}
                    <motion.button type="submit" whileTap={{ scale: 0.98 }}
                      className="group w-full btn-primary py-4 text-sm font-semibold rounded-xl flex items-center justify-between px-6 transition-all duration-200 mt-1">
                      <span>Accedi</span>
                      <ChevronRight size={13} className="group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  </form>

                  {/* Social — secondario */}
                  <div className="mt-6 space-y-2">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex-1 h-px bg-[#222220]" />
                      <span className="text-[11px] font-medium text-[#4a4a47]">oppure continua con</span>
                      <div className="flex-1 h-px bg-[#222220]" />
                    </div>
                    <button type="button" onClick={handleAppleSignIn}
                      className="group w-full flex items-center justify-center gap-2 py-3 bg-[#1a1917] border border-[#2e2d2b] rounded-xl hover:border-[#444] transition-all duration-200">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="text-white/60 group-hover:text-white transition-colors">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                      </svg>
                      <span className="text-xs font-medium text-white/60 group-hover:text-white transition-colors">Continua con Apple</span>
                    </button>
                    <button type="button" onClick={handleGoogleSignIn}
                      className="group w-full flex items-center justify-center gap-2 py-2.5 rounded-xl hover:bg-white/[0.04] transition-all duration-200">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      <span className="text-xs font-medium text-[#555552] group-hover:text-[#8E8E93] transition-colors">Continua con Google</span>
                    </button>
                  </div>

                  {/* Registrazione */}
                  <p className="text-center text-xs text-[#555552] mt-6">
                    Sei un PR?{' '}
                    <button onClick={() => { setAuthScreen('register'); setRegError(''); setRegDone(false); }}
                      className="text-[#8E8E93] hover:text-accent transition-colors">
                      Registrati
                    </button>
                  </p>
                </motion.div>
              ) : authScreen === 'forgot' ? (
                <motion.div key="forgot" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
                  {forgotSent ? (
                    <div className="text-center py-4">
                      <div className="w-14 h-14 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <UserCheck size={24} className="text-accent" />
                      </div>
                      <h2 className="font-bold text-xl text-white mb-3">Email Inviata</h2>
                      <p className="text-sm text-[#8E8E93] leading-relaxed">
                        Controlla la tua casella di posta<br />e clicca il link per reimpostare<br />la password.
                      </p>
                      {forgotDevLink && (
                        <div className="mt-6 p-4 bg-[#121110] border border-[#3b3733] text-left">
                          <p className="text-[8px] font-sans uppercase tracking-widest text-[#8E8E93] mb-2">Link di reset (dev mode)</p>
                          <a href={forgotDevLink} className="text-accent text-[10px] font-mono break-all hover:underline">
                            Clicca qui per reimpostare
                          </a>
                        </div>
                      )}
                      <button onClick={() => { setAuthScreen('login'); setForgotSent(false); setForgotEmail(''); }}
                        className="mt-8 w-full py-3.5 text-sm font-medium rounded-xl border border-[#2d2a26] text-[#8E8E93] hover:border-accent/40 hover:text-accent transition-colors">
                        Torna al Login
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="mb-10">
                        <h2 className="font-bold text-[22px] text-white">Password Dimenticata</h2>
                        <p className="text-[13px] text-[#636366] mt-2">Inserisci la tua email</p>
                      </div>
                      <form onSubmit={handleForgotPassword} className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-[#636366]">Email</label>
                          <input type="email" required value={forgotEmail}
                            onChange={e => { setForgotEmail(e.target.value); setForgotError(''); }}
                            placeholder="tua@email.it"
                            className="auth-input w-full bg-[#121110] border border-[#3b3733] px-5 py-4 text-sm text-white placeholder-[#636366] font-sans" />
                        </div>
                        {forgotError && <p className="text-red-400 text-xs pt-1">{forgotError}</p>}
                        <motion.button type="submit" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                          className="group w-full btn-primary py-4 text-sm font-semibold rounded-xl flex items-center justify-between px-6 transition-all duration-200 mt-2">
                          <span>Invia Link</span>
                          <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </motion.button>
                      </form>
                      <div className="mt-8 pt-6 border-t border-[#2d2a26]">
                        <button onClick={() => setAuthScreen('login')}
                          className="w-full text-xs font-medium text-[#636366] hover:text-[#AEAEB2] transition-colors py-2">
                          ← Torna al Login
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              ) : authScreen === 'reset' ? (
                <motion.div key="reset" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
                  {resetDone ? (
                    <div className="text-center py-4">
                      <div className="w-14 h-14 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <UserCheck size={24} className="text-accent" />
                      </div>
                      <h2 className="font-bold text-xl text-white mb-3">Password Aggiornata</h2>
                      <p className="text-sm text-[#8E8E93] leading-relaxed">
                        La tua password è stata<br />reimpostata con successo.
                      </p>
                      <button onClick={() => { setAuthScreen('login'); setResetDone(false); setNewPassword(''); }}
                        className="mt-8 w-full py-4 text-sm font-semibold rounded-xl btn-primary">
                        Accedi ora
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="mb-10">
                        <h2 className="font-bold text-[22px] text-white">Nuova Password</h2>
                        <p className="text-[13px] text-[#636366] mt-2">{resetEmailState}</p>
                      </div>
                      <form onSubmit={handleResetPassword} className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-[#636366]">Nuova Password</label>
                          <div className="relative">
                            <input type={showNewPasswordField ? 'text' : 'password'} required minLength={4} value={newPassword}
                              onChange={e => { setNewPassword(e.target.value); setResetError(''); }}
                              placeholder="••••••••"
                              className="auth-input w-full bg-[#121110] border border-[#3b3733] px-5 py-4 pr-11 text-sm text-white placeholder-[#636366] font-sans" />
                            <button type="button" onClick={() => setShowNewPasswordField(o => !o)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8E8E93] hover:text-accent transition-colors">
                              {showNewPasswordField ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>
                        </div>
                        {resetError && <p className="text-red-400 text-xs pt-1">{resetError}</p>}
                        <motion.button type="submit" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                          className="group w-full btn-primary py-4 text-sm font-semibold rounded-xl flex items-center justify-between px-6 transition-all duration-200 mt-2">
                          <span>Reimposta Password</span>
                          <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </motion.button>
                      </form>
                    </>
                  )}
                </motion.div>
              ) : regDone ? (
                <motion.div key="done" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}
                  className="text-center py-8">
                  <div className="w-14 h-14 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <UserCheck size={24} className="text-accent" />
                  </div>
                  <h2 className="font-bold text-xl text-white mb-3">Richiesta Inviata</h2>
                  <p className="text-sm text-[#8E8E93] leading-relaxed">
                    Il tuo account è in attesa<br />di approvazione admin.
                  </p>
                  <button onClick={() => { setAuthScreen('login'); setRegDone(false); setRegName(''); setRegEmail(''); setRegPassword(''); }}
                    className="mt-8 w-full py-3.5 text-sm font-medium rounded-xl border border-[#2d2a26] text-[#8E8E93] hover:border-accent/40 hover:text-accent transition-colors">
                    Torna al Login
                  </button>
                </motion.div>
              ) : (
                <motion.div key="register" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
                  {/* Header */}
                  <div className="mb-5">
                    <h2 className="font-bold text-[22px] text-white tracking-tight">Registrati</h2>
                    <p className="text-[13px] text-[#636366] mt-1">Crea il tuo account PR</p>
                  </div>

                  <form onSubmit={handleRegister} className="space-y-2.5">
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-[#636366]">Nome</label>
                        <input required value={regName} onChange={e => { setRegName(e.target.value); setRegError(''); }}
                          placeholder="Mario"
                          className="auth-input w-full bg-[#121110] border border-[#3b3733] px-4 py-3 text-sm text-white placeholder-[#636366] font-sans" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-[#636366]">Cognome</label>
                        <input required value={regLastName} onChange={e => { setRegLastName(e.target.value); setRegError(''); }}
                          placeholder="Rossi"
                          className="auth-input w-full bg-[#121110] border border-[#3b3733] px-4 py-3 text-sm text-white placeholder-[#636366] font-sans" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-[#636366]">Email</label>
                      <input
                        type="text" inputMode="email" autoComplete="email" required value={regEmail}
                        onChange={e => {
                          const val = e.target.value;
                          setRegEmail(val);
                          setRegError('');
                          const [, domainPart] = val.split('@');
                          if (domainPart && domainPart.includes('.'))
                            setRegEmailError(validateEmail(val));
                          else
                            setRegEmailError('');
                        }}
                        onBlur={() => { if (regEmail) setRegEmailError(validateEmail(regEmail)); }}
                        placeholder="tua@email.it"
                        className={`auth-input w-full bg-[#121110] border px-4 py-3 text-sm text-white placeholder-[#636366] font-sans ${regEmailError ? 'border-red-500/60' : 'border-[#3b3733]'}`}
                      />
                      {regEmailError && <p className="text-red-500/80 text-xs">{regEmailError}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-[#636366]">Telefono</label>
                      <input
                        type="tel" required value={regPhone}
                        onChange={e => {
                          const val = e.target.value;
                          setRegPhone(val);
                          setRegError('');
                          const digits = val.replace(/\D/g, '');
                          if (digits.length >= 9)
                            setRegPhoneError(validatePhone(val));
                          else
                            setRegPhoneError('');
                        }}
                        onBlur={() => { if (regPhone) setRegPhoneError(validatePhone(regPhone)); }}
                        placeholder="+39 333 000 0000"
                        className={`auth-input w-full bg-[#121110] border px-4 py-3 text-sm text-white placeholder-[#636366] font-sans ${regPhoneError ? 'border-red-500/60' : 'border-[#3b3733]'}`}
                      />
                      {regPhoneError && <p className="text-red-500/80 text-xs">{regPhoneError}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-[#636366]">Password</label>
                      <div className="relative">
                        <input type={showRegPassword ? 'text' : 'password'} required value={regPassword} onChange={e => { setRegPassword(e.target.value); setRegError(''); }}
                          placeholder="••••••••"
                          className="auth-input w-full bg-[#121110] border border-[#3b3733] px-4 py-3 pr-11 text-sm text-white placeholder-[#636366] font-sans" />
                        <button type="button" onClick={() => setShowRegPassword(o => !o)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8E8E93] hover:text-accent transition-colors">
                          {showRegPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>
                    {/* Consenso T&C + Privacy */}
                    <label className="flex items-start gap-2.5 cursor-pointer select-none pt-1">
                      <input
                        type="checkbox"
                        checked={regConsent}
                        onChange={e => { setRegConsent(e.target.checked); setRegError(''); }}
                        className="mt-0.5 w-3.5 h-3.5 accent-[#D4622A] shrink-0 cursor-pointer"
                      />
                      <span className="text-[11px] text-[#8E8E93] leading-relaxed">
                        Accetto i{' '}
                        <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-[#cfc7bc] hover:text-accent underline-offset-2 hover:underline transition-colors">
                          Termini
                        </a>
                        {' '}e la{' '}
                        <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-[#cfc7bc] hover:text-accent underline-offset-2 hover:underline transition-colors">
                          Privacy
                        </a>
                        .
                      </span>
                    </label>

                    {regError && <p className="text-red-400 text-xs pt-1">{regError}</p>}
                    <motion.button
                      type="submit"
                      disabled={!!regEmailError || !!regPhoneError || !regConsent}
                      whileHover={!regEmailError && !regPhoneError && regConsent ? { scale: 1.01 } : {}}
                      whileTap={!regEmailError && !regPhoneError && regConsent ? { scale: 0.99 } : {}}
                      className={`group w-full py-3.5 text-sm font-semibold rounded-xl flex items-center justify-between px-6 transition-colors mt-1 ${regEmailError || regPhoneError || !regConsent ? 'bg-[#2d2a26] text-[#8E8E93] cursor-not-allowed' : 'btn-primary'}`}>
                      <span>Invia Richiesta</span>
                      <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  </form>

                  <p className="text-center text-xs text-[#555552] mt-5">
                    Hai già un account?{' '}
                    <button onClick={() => { setAuthScreen('login'); setRegError(''); setRegEmailError(''); setRegPhoneError(''); }}
                      className="text-[#8E8E93] hover:text-accent transition-colors">
                      Accedi
                    </button>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            </div>
          </div>
        </motion.div>
        <div className="absolute bottom-5 flex items-center gap-3 text-[9px] font-sans uppercase tracking-[0.3em]">
          <span className="text-[#2d2a26]">© 2025 Nightplan</span>
          <span className="text-[#1d1b19]">·</span>
          <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-[#3b3733] hover:text-[#8E8E93] transition-colors">Privacy</a>
          <span className="text-[#1d1b19]">·</span>
          <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-[#3b3733] hover:text-[#8E8E93] transition-colors">Termini</a>
        </div>
      </div>
    );
  }

  /* ── AUTHENTICATED LAYOUT ───────────────────────────────── */
  return (
    <div className="min-h-screen bg-bg text-white flex flex-col md:flex-row relative">

      {/* ── Mobile top bar ── */}
      <div className="md:hidden h-12 bg-[#121110] border-b border-[#2d2a26] flex items-center justify-between px-4 sticky top-0 z-50 shrink-0">
        <span className="hv font-black text-xl uppercase tracking-tight">NP</span>
        <button onClick={() => setMobileSidebarOpen(o => !o)} className="text-[#8E8E93] hover:text-white transition-colors p-1">
          <Menu size={18} />
        </button>
      </div>

      {/* ── Mobile sidebar overlay ── */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-40 md:hidden"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-[#121110]/90 backdrop-blur-xl border-r border-white/[0.06] z-50 md:hidden flex flex-col"
            >
              <SidebarContent
                user={user}
                view={view}
                onNav={(v) => { setView(v as AppView); setSelectedVenue(null); setSelectedEvent(null); setEditingFloorPlan(null); setEditorVenueId(null); setSelectedPR(null); setMobileSidebarOpen(false); }}
                onLogout={handleLogout}
                occupancyPct={occupancyPct}
                revenueEst={revenueEst}
                pendingCount={pendingCount}
                prPendingCount={prPendingCount}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex w-60 xl:w-64 border-r border-white/[0.06] bg-[#121110]/90 backdrop-blur-xl flex-col shrink-0 sticky top-0 h-screen">
        <SidebarContent user={user} view={view}
          onNav={(v) => { setView(v as AppView); setSelectedVenue(null); setSelectedEvent(null); setEditingFloorPlan(null); setEditorVenueId(null); setSelectedPR(null); }}
          onLogout={handleLogout}
          occupancyPct={occupancyPct}
          revenueEst={revenueEst}
          pendingCount={pendingCount}
          prPendingCount={prPendingCount}
        />
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-auto pb-16 md:pb-0">
        {/* Header */}
        {(() => {
          const crumbs = breadcrumbs();
          const subtitle = contextSubtitle();
          const badges = contextBadges();
          const expanded = crumbs.length > 0;

          const searchBtn = (
            <button
              onClick={() => setPaletteOpen(true)}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 border border-[#2d2a26] text-[#636366] hover:text-white hover:border-[#48484A] transition-colors text-xs shrink-0"
              title="Cerca (⌘K)"
            >
              <Search size={12} />
              <span>Cerca</span>
              <kbd className="hidden lg:inline text-[8px] font-mono border border-[#2d2a26] px-1 py-0.5 ml-1">⌘K</kbd>
            </button>
          );

          if (!expanded) {
            return (
              <header className="h-12 border-b border-[#2d2a26] flex items-center justify-between px-5 bg-[#121110]/95 backdrop-blur-sm sticky top-0 z-30 shrink-0">
                <div className="flex items-center gap-4 min-w-0">
                  {showBack && (
                    <button onClick={goBack}
                      className="flex items-center gap-1.5 text-[#636366] hover:text-accent transition-colors text-xs shrink-0">
                      <ArrowLeft size={11} /> Indietro
                    </button>
                  )}
                  <span className="text-xs font-medium text-[#AEAEB2] truncate">
                    {headerTitle()}
                  </span>
                </div>
                {searchBtn}
              </header>
            );
          }

          return (
            <header className="border-b border-[#2d2a26] bg-[#121110]/95 backdrop-blur-sm sticky top-0 z-30 shrink-0">
              <div className="px-5 py-3 flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  {/* Breadcrumbs */}
                  <div className="flex items-center gap-1.5 mb-1.5 min-w-0">
                    {crumbs.map((bc, i) => (
                      <React.Fragment key={i}>
                        {i > 0 && <ChevronRight size={10} className="text-[#636366] shrink-0" />}
                        {bc.onClick ? (
                          <button onClick={bc.onClick}
                            className="text-xs text-[#636366] hover:text-accent transition-colors truncate">
                            {bc.label}
                          </button>
                        ) : (
                          <span className="text-xs text-[#AEAEB2] truncate">
                            {bc.label}
                          </span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                  {/* Title + subtitle + badges */}
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <h1 className="font-bold text-white text-base md:text-lg truncate">
                      {headerTitle()}
                    </h1>
                    {subtitle && (
                      <span className="text-[10px] font-sans text-[#AEAEB2] truncate capitalize">
                        {subtitle}
                      </span>
                    )}
                    {badges.map((badge, i) => (
                      <span key={i}
                        className="text-xs font-medium rounded-full px-2.5 py-0.5 border"
                        style={{ color: badge.color, borderColor: `${badge.color}33` }}>
                        {badge.label}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="shrink-0 mt-0.5">{searchBtn}</div>
              </div>
            </header>
          );
        })()}

        {/* Content */}
        <div className="flex-1 p-5 md:p-8 overflow-auto">
         <Suspense fallback={null}>
          <AnimatePresence mode="wait">

            {/* Venues */}
            {view === 'venues' && (
              <motion.div key="venues" {...PAGE}>
                <div className="flex items-start justify-between mb-8 gap-4">
                  <PageTitle title="I tuoi Locali" sub="Seleziona un locale per gestire gli eventi" />
                  {user.role === 'admin' && (
                    <div className="flex items-center gap-2 shrink-0 mt-1">
                      <button onClick={() => setShowBottleMenu(true)}
                        className="flex items-center gap-2 border border-[#3b3733] text-[#AEAEB2] px-4 py-3 text-sm font-semibold rounded-xl hover:text-white hover:border-[#48484A] transition-colors">
                        <Wine size={13} /> Listino
                      </button>
                      <button onClick={() => setShowNewClubModal(true)}
                        className="flex items-center gap-2 btn-primary px-5 py-3 text-sm font-semibold rounded-xl">
                        <Plus size={12} /> Nuovo Club
                      </button>
                    </div>
                  )}
                </div>
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-8"
                  variants={gridContainer} initial="initial" animate="animate"
                >
                  {venues.map((venue) => (
                    <motion.div key={venue.id} variants={gridItem}>
                      <VenueCard venue={venue}
                        eventCount={events.filter(e => e.venueId === venue.id).length}
                        onClick={() => openVenue(venue)}
                        onEdit={(e) => { e.stopPropagation(); setEditingVenue(venue); }}
                        onDelete={(e) => { e.stopPropagation(); setVenues(prev => prev.filter(v => v.id !== venue.id)); }}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}

            {/* Venue detail — Serate + Pianta */}
            {view === 'venue-events' && selectedVenue && (
              <motion.div key="venue-events" {...PAGE}>
                {/* Header */}
                <div className="mb-7">
                  <p className="text-xs text-[#8E8E93] mb-1">Club</p>
                  <h2 className="font-bold text-4xl text-white">{selectedVenue.name}</h2>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-[#242424] mb-8 gap-1">
                  {(['events', 'layout'] as const).map(tab => (
                    <button key={tab} onClick={() => setVenueTab(tab)}
                      className={`px-5 py-2.5 text-sm font-medium transition-colors relative ${
                        venueTab === tab ? 'text-white' : 'text-[#8E8E93] hover:text-[#AEAEB2]'
                      }`}>
                      {tab === 'events' ? 'Serate' : 'Pianta'}
                      {venueTab === tab && (
                        <motion.div layoutId="venue-tab-indicator"
                          className="absolute bottom-0 left-0 right-0 h-px bg-accent"
                          transition={{ duration: 0.2 }} />
                      )}
                    </button>
                  ))}
                </div>

                {/* Tab: Serate */}
                <AnimatePresence mode="wait">
                  {venueTab === 'events' && (
                    <motion.div key="tab-events" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                      {venueEvents.length === 0 ? (
                        <EmptyState icon={<Calendar size={28} />} label="Nessuna serata ancora.">
                          <button onClick={() => setShowNewEventModal(true)}
                            className="mt-5 flex items-center gap-2 btn-primary px-5 py-3 text-sm font-semibold rounded-xl">
                            <Plus size={13} /> Crea Serata
                          </button>
                        </EmptyState>
                      ) : (
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                            {venueEvents.map((event, i) => (
                              <motion.div key={event.id}
                                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.06 }}>
                                <EventCard
                                  event={event}
                                  onClick={() => openEvent(event)}
                                  onEdit={(e) => { e.stopPropagation(); setEditingEvent(event); }}
                                  onDuplicate={(e) => { e.stopPropagation(); setDuplicatingEvent(event); }}
                                  onDelete={(e) => { e.stopPropagation(); setEvents(prev => prev.filter(ev => ev.id !== event.id)); }}
                                />
                              </motion.div>
                            ))}
                          </div>
                          {user.role === 'admin' && (
                            <div className="mt-6 flex justify-center">
                              <button onClick={() => setShowNewEventModal(true)}
                                className="flex items-center gap-2 border border-[#3b3733] text-[#AEAEB2] px-6 py-3 text-sm font-medium rounded-xl hover:border-accent hover:text-accent transition-all">
                                <Plus size={11} /> Nuova Serata
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </motion.div>
                  )}

                  {/* Tab: Pianta */}
                  {venueTab === 'layout' && (
                    <motion.div key="tab-layout" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                      <div>
                          <div className="flex justify-end mb-6">
                            <button onClick={() => setEditingFloorPlan({ venueId: selectedVenue.id, fp: { id: `fp_${Date.now()}`, name: '', canvasWidth: 800, canvasHeight: 600, staticAreas: [], tables: [] } })}
                              className="flex items-center gap-2 btn-primary px-5 py-3 text-sm font-semibold rounded-xl">
                              <Plus size={12} /> Nuova Pianta
                            </button>
                          </div>
                          {(() => {
                            const liveFloorPlans = venues.find(v => v.id === selectedVenue.id)?.floorPlans ?? [];
                            return liveFloorPlans.length === 0 ? (
                            <EmptyState icon={<Map size={28} />} label="Nessuna pianta per questo club." />
                          ) : (
                            <div className="border border-[#3b3733] bg-white/[0.018] divide-y divide-[#2d2a26] rounded-xl overflow-hidden">
                              {liveFloorPlans.map(fp => (
                                <div key={fp.id} className="px-7 py-4 flex items-center justify-between group hover:bg-white/[0.01] transition-colors">
                                  <div className="flex items-center gap-4">
                                    <Map size={14} className="text-[#AEAEB2] shrink-0" />
                                    <div>
                                      <p className="font-semibold text-sm text-white">{fp.name}</p>
                                      <p className="text-[8px] font-sans text-[#AEAEB2] mt-0.5">{fp.tables.length} tavoli</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-0.5 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                      <button onClick={() => setEditingFloorPlanMeta({ venueId: selectedVenue.id, fp })}
                                        className="w-7 h-7 flex items-center justify-center text-[#AEAEB2] hover:text-accent transition-colors">
                                        <Pencil size={12} />
                                      </button>
                                      <button onClick={() => setVenues(prev => prev.map(v =>
                                        v.id === selectedVenue.id ? { ...v, floorPlans: v.floorPlans.filter(f => f.id !== fp.id) } : v
                                      ))} className="w-7 h-7 flex items-center justify-center text-[#AEAEB2] hover:text-red-500 transition-colors">
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                    <button onClick={() => setEditingFloorPlan({ venueId: selectedVenue.id, fp })}
                                      className="text-xs text-[#AEAEB2] hover:text-accent transition-colors flex items-center gap-1.5">
                                      Apri Canvas <ChevronRight size={11} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                          })()}
                        </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Dashboard home */}
            {view === 'dashboard' && (
              <motion.div key="dashboard" {...PAGE}>
                <Dashboard
                  user={user}
                  events={events}
                  venues={venues}
                  reservations={reservations}
                  managedUsers={managedUsers}
                  pendingCount={pendingCount}
                  prPendingCount={prPendingCount}
                  onNav={(v) => setView(v as AppView)}
                  onOpenEvent={openEvent}
                />
              </motion.div>
            )}

            {/* Serate — admin */}
            {view === 'active-events' && (() => {
              const completedEvents = events.filter(e => e.status === 'completed');
              const shown = serateFilter === 'attive' ? activeEvents : completedEvents;
              return (
              <motion.div key="active-events" {...PAGE}>
                <PageTitle title="Serate" sub="Seleziona una serata per gestirla" />
                {/* Filtro Attive / Concluse */}
                <div className="flex items-center gap-1 bg-[#1d1b19] border border-[#2d2a26] rounded-xl p-1 w-fit mt-6 mb-2">
                  {([['attive', `Attive (${activeEvents.length})`], ['concluse', `Concluse (${completedEvents.length})`]] as const).map(([k, label]) => (
                    <button key={k} onClick={() => setSerateFilter(k)}
                      className={cn('px-4 py-2 rounded-lg text-xs font-semibold transition-colors',
                        serateFilter === k ? 'bg-accent text-black' : 'text-[#8E8E93] hover:text-white')}>
                      {label}
                    </button>
                  ))}
                </div>
                {shown.length === 0 ? (
                  <EmptyState icon={<Calendar size={28} />} label={serateFilter === 'attive' ? 'Nessuna serata attiva.' : 'Nessuna serata conclusa.'} />
                ) : (
                  <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-6"
                    variants={gridContainer} initial="initial" animate="animate"
                  >
                    {shown.map((event) => (
                      <motion.div key={event.id} variants={gridItem}>
                        <EventCard event={event}
                          venueName={venues.find(v => v.id === event.venueId)?.name}
                          onClick={() => openEvent(event)} />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
              );
            })()}

            {view === 'events' && (
              <motion.div key="events" {...PAGE}>
                <div className="flex items-start justify-between mb-0 gap-4">
                  <PageTitle title="Prossimi eventi" sub="Seleziona un evento per accedere alla pianta" />
                  {user.role === 'pr' && prVisibleEvents.length > 0 && (
                    <button
                      onClick={() => setShowQuickAdd(true)}
                      className="flex items-center gap-2 btn-primary px-4 py-2.5 text-sm font-semibold rounded-xl shrink-0 mt-1"
                    >
                      <Plus size={12} /> Aggiungi
                    </button>
                  )}
                </div>
                {prVisibleEvents.length === 0 ? (
                  <EmptyState icon={<Calendar size={28} />} label="Nessun evento attivo." />
                ) : (
                  <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-8"
                    variants={gridContainer} initial="initial" animate="animate"
                  >
                    {prVisibleEvents.map((event) => (
                      <motion.div key={event.id} variants={gridItem}>
                        <EventCard event={event}
                          venueName={venues.find(v => v.id === event.venueId)?.name}
                          onClick={() => openEvent(event)} />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
                {user.role === 'pr' && (
                  <PRLinkGenerator events={prVisibleEvents} venues={venues} user={user} />
                )}
              </motion.div>
            )}

            {/* Plan */}
            {view === 'plan' && selectedEvent && (() => {
              const fp = getFloorPlan(selectedEvent);
              if (!fp) return null;
              return (
                <motion.div key="plan" {...PAGE} className="h-full flex flex-col">
                  <FloorPlanViewer
                    event={selectedEvent} floorPlan={fp}
                    reservations={reservations} currentUser={user}
                    bottleMenu={bottleMenu}
                    onReservationAdded={(res) => setReservations(prev => [...prev, {
                      ...res,
                      approvalStatus: user.role === 'admin' ? 'approved' : 'pending',
                    }])}
                    onReservationUpdated={(res) => setReservations(prev => prev.map(r => r.id === res.id ? res : r))}
                    onReservationRemoved={(id) => setReservations(prev => prev.filter(r => r.id !== id))}
                  />
                </motion.div>
              );
            })()}

            {/* Event detail — admin */}
            {view === 'event-detail' && selectedEvent && user.role === 'admin' && (() => {
              const evVenue = venues.find(v => v.id === selectedEvent.venueId);
              if (!evVenue) return null;
              return (
                <motion.div key="event-detail" {...PAGE}>
                  <EventDetailView
                    event={selectedEvent}
                    venue={evVenue}
                    reservations={reservations}
                    prUsers={managedUsers.filter(u => u.role === 'pr' && u.status === 'approved')}
                    prGroups={prGroups}
                    onApproveReservation={handleApproveReservation}
                    onRejectReservation={handleRejectReservation}
                    onUpdateEvent={(patch) => {
                      setEvents(prev => prev.map(e => e.id === selectedEvent.id ? { ...e, ...patch } : e));
                      setSelectedEvent(prev => prev ? { ...prev, ...patch } : prev);
                    }}
                    onOpenPlan={() => setView('plan')}
                    onOpenRegia={() => setRegiaEvent(selectedEvent)}
                    onBack={() => { setSelectedEvent(null); setView(selectedVenue ? 'venue-events' : 'active-events'); }}
                  />
                </motion.div>
              );
            })()}

            {/* Editor */}
            {view === 'editor' && (
              <motion.div key="editor" {...PAGE} className="h-full flex flex-col">
                {(() => {
                  const filteredVenue = editorVenueId ? venues.find(v => v.id === editorVenueId) : null;
                  const venuesToShow = filteredVenue ? [filteredVenue] : venues;
                  const title = filteredVenue ? `Pianta — ${filteredVenue.name}` : 'Layout Tavoli';
                  const sub = filteredVenue ? `Gestisci il layout di ${filteredVenue.name}` : 'Gestisci le piante di tutti i locali';
                  return (
                    <div>
                      <div className="flex items-start justify-between mb-8 gap-4">
                        <div>
                          {filteredVenue && (
                            <button
                              onClick={() => { setEditorVenueId(null); setView('venue-events'); }}
                              className="flex items-center gap-2 text-[#636366] hover:text-accent transition-colors text-xs mb-4">
                              <ArrowLeft size={11} /> Torna al Club
                            </button>
                          )}
                          <PageTitle title={title} sub={sub} />
                        </div>
                        <button
                          onClick={() => setShowNewFloorPlanModal(true)}
                          className="flex items-center gap-2 btn-primary px-5 py-3 text-sm font-semibold rounded-xl shrink-0 mt-1">
                          <Plus size={12} /> Nuova Pianta
                        </button>
                      </div>
                      <div className="space-y-6">
                        {venuesToShow.map(venue => (
                          <div key={venue.id} className="border border-[#3b3733] bg-white/[0.018] rounded-xl overflow-hidden">
                            {!filteredVenue && (
                              <div className="px-7 py-5 border-b border-[#2d2a26]">
                                <h3 className="font-bold text-xl text-white">{venue.name}</h3>
                                <p className="text-xs text-[#AEAEB2] mt-0.5">{venue.address}</p>
                              </div>
                            )}
                            {venue.floorPlans.length === 0 ? (
                              <div className="px-7 py-8 text-center">
                                <p className="text-sm text-[#636366]">Nessuna pianta</p>
                              </div>
                            ) : (
                              <div className="divide-y divide-[#2d2a26]">
                                {venue.floorPlans.map(fp => (
                                  <div key={fp.id} className="px-7 py-4 flex items-center justify-between group hover:bg-white/[0.01] transition-colors">
                                    <div className="flex items-center gap-4">
                                      <Map size={14} className="text-[#AEAEB2] shrink-0" />
                                      <div>
                                        <p className="font-semibold text-sm text-white">{fp.name}</p>
                                        <p className="text-[8px] font-sans text-[#AEAEB2] mt-0.5">{fp.tables.length} tavoli</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="flex items-center gap-0.5 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                        <button
                                          onClick={() => setEditingFloorPlanMeta({ venueId: venue.id, fp })}
                                          className="w-7 h-7 flex items-center justify-center text-[#AEAEB2] hover:text-accent transition-colors">
                                          <Pencil size={12} />
                                        </button>
                                        <button
                                          onClick={() => setVenues(prev => prev.map(v =>
                                            v.id === venue.id ? { ...v, floorPlans: v.floorPlans.filter(f => f.id !== fp.id) } : v
                                          ))}
                                          className="w-7 h-7 flex items-center justify-center text-[#AEAEB2] hover:text-red-500 transition-colors">
                                          <Trash2 size={12} />
                                        </button>
                                      </div>
                                      <button
                                        onClick={() => setEditingFloorPlan({ venueId: venue.id, fp })}
                                        className="text-xs text-[#AEAEB2] hover:text-accent transition-colors flex items-center gap-1.5">
                                        Canvas <ChevronRight size={11} />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
            )}

            {/* Reservations */}
            {view === 'reservations' && (
              <motion.div key="reservations" {...PAGE}>
                <ReservationsTable
                  reservations={user.role === 'admin' ? reservations : reservations.filter(r => r.prId === user.id)}
                  userRole={user.role}
                  events={events}
                  onDelete={(id) => setReservations(prev => prev.filter(r => r.id !== id))}
                  onEdit={(r) => setEditingReservation(r)}
                />
              </motion.div>
            )}

            {/* Approvals — admin only */}
            {view === 'approvals' && user.role === 'admin' && (
              <motion.div key="approvals" {...PAGE}>
                <PageTitle
                  title="Approvazioni"
                  sub={pendingCount > 0 ? `${pendingCount} element${pendingCount !== 1 ? 'i' : 'o'} in attesa` : 'Nessun elemento in attesa'}
                />
                <PendingApprovalsView
                  reservations={reservations}
                  managedUsers={managedUsers}
                  onApproveReservation={handleApproveReservation}
                  onRejectReservation={handleRejectReservation}
                  onApproveUser={handleApproveUser}
                  onRejectUser={handleRejectUser}
                />
              </motion.div>
            )}

            {/* PR Management — admin only */}
            {view === 'pr-management' && user.role === 'admin' && (
              <motion.div key="pr-management" {...PAGE}>
                <PRManagementPage
                  managedUsers={managedUsers}
                  reservations={reservations}
                  events={events}
                  prGroups={prGroups}
                  selectedPR={selectedPR}
                  onSelectPR={setSelectedPR}
                  onBack={() => setSelectedPR(null)}
                  onUpdateStatus={(id, status) => setManagedUsers(prev => prev.map(u => u.id === id ? { ...u, status } : u))}
                  onSaveGroup={(g) => setPrGroups(prev => prev.some(x => x.id === g.id) ? prev.map(x => x.id === g.id ? g : x) : [...prev, g])}
                  onDeleteGroup={(id) => setPrGroups(prev => prev.filter(x => x.id !== id))}
                />
              </motion.div>
            )}

            {/* Profile — PR only */}
            {view === 'profile' && user.role === 'pr' && (
              <motion.div key="profile" {...PAGE}>
                <PRProfile user={user} onSave={handleUpdateProfile} />
              </motion.div>
            )}

            {/* History — PR only */}
            {view === 'history' && user.role === 'pr' && (() => {
              const myRes = reservations.filter(r => r.prId === user.id);
              const myEventIds = [...new Set(myRes.map(r => r.eventId))];
              const approved = myRes.filter(r => r.approvalStatus === 'approved').length;
              const totalBudget = myRes.reduce((s, r) => s + (r.actualBudget ?? r.budget), 0);
              const approvalRate = myRes.length > 0 ? Math.round((approved / myRes.length) * 100) : 0;

              return (
                <motion.div key="history" {...PAGE}>
                  <PageTitle title="Il Mio Storico" sub="Riepilogo delle tue prenotazioni" />

                  {/* PR Stats */}
                  <PRStatsView prId={user.id} reservations={reservations} events={events} />

                  {/* KPIs */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-8 mb-10">
                    <div className="border border-white/[0.07] bg-white/[0.018] px-5 py-5 rounded-2xl">
                      <div className="hv font-black text-4xl text-white leading-none tabular-nums">{myRes.length}</div>
                      <div className="text-[11px] uppercase tracking-[0.14em] text-[#8a8278] mt-3">Tavoli prenotati</div>
                    </div>
                    <div className="border border-white/[0.07] bg-white/[0.018] px-5 py-5 rounded-2xl">
                      <div className="hv font-black text-4xl text-white leading-none tabular-nums">€{totalBudget >= 1000 ? `${(totalBudget/1000).toFixed(1)}K` : totalBudget}</div>
                      <div className="text-[11px] uppercase tracking-[0.14em] text-[#8a8278] mt-3">Budget generato</div>
                    </div>
                    <div className="border border-white/[0.07] bg-white/[0.018] px-5 py-5 rounded-2xl">
                      <div className="hv font-black text-4xl text-white leading-none tabular-nums">{myEventIds.length}</div>
                      <div className="text-[11px] uppercase tracking-[0.14em] text-[#8a8278] mt-3">Serate lavorate</div>
                    </div>
                    <div className="border border-white/[0.07] bg-white/[0.018] px-5 py-5 rounded-2xl">
                      <div className="hv font-black text-4xl text-white leading-none tabular-nums">{approvalRate}<span className="text-xl text-[#8a8278]">%</span></div>
                      <div className="mt-3 h-1.5 bg-white/[0.07] rounded-full overflow-hidden">
                        <motion.div className="h-full bg-[#D4622A]" initial={{ width: 0 }} animate={{ width: `${approvalRate}%` }} transition={{ duration: 1, ease: 'easeOut' }} />
                      </div>
                      <div className="text-[11px] uppercase tracking-[0.14em] text-[#8a8278] mt-2">Tasso approvazione</div>
                    </div>
                  </div>

                  {/* Events list */}
                  {myEventIds.length === 0 ? (
                    <EmptyState icon={<Clock size={28}/>} label="Nessuna prenotazione ancora." />
                  ) : (
                    <div className="space-y-3">
                      {myEventIds.map(eventId => {
                        const event = events.find(e => e.id === eventId);
                        if (!event) return null;
                        const venue = venues.find(v => v.id === event.venueId);
                        const eventRes = myRes.filter(r => r.eventId === eventId);
                        const eventApproved = eventRes.filter(r => r.approvalStatus === 'approved').length;
                        const eventBudget = eventRes.reduce((s, r) => s + (r.actualBudget ?? r.budget), 0);
                        return (
                          <HistoryEventRow
                            key={eventId}
                            event={event}
                            venueName={venue?.name ?? '—'}
                            reservations={eventRes}
                            approvedCount={eventApproved}
                            totalBudget={eventBudget}
                          />
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              );
            })()}

            {/* Check-in ingresso */}
            {view === 'checkin' && (
              <motion.div key="checkin" {...PAGE}>
                <HostCheckinView
                  reservations={reservations}
                  events={events}
                  venues={venues}
                  userRole={user.role}
                  currentUser={user}
                  onCheckIn={handleCheckIn}
                  onUndoCheckIn={handleUndoCheckIn}
                  onUpdatePeople={handleUpdatePeople}
                  onExport={user.role === 'admin' ? exportGuestList : undefined}
                />
              </motion.div>
            )}

          </AnimatePresence>
         </Suspense>
        </div>
      </main>

      {/* Bottom tab bar — mobile only, admin/pr */}
      {user.role !== 'host' && (
        <BottomTabBar
          user={user}
          view={view}
          pendingCount={pendingCount}
          prPendingCount={prPendingCount}
          onNav={(v) => {
            setView(v as AppView);
            setSelectedVenue(null);
            setSelectedEvent(null);
            setEditingFloorPlan(null);
            setEditorVenueId(null);
            setSelectedPR(null);
          }}
        />
      )}

      {/* Command Palette */}
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        user={user}
        venues={venues}
        events={events}
        reservations={reservations}
        managedUsers={managedUsers}
        onOpenVenue={(v) => { setSelectedVenue(v); setVenueTab('events'); setView('venue-events'); }}
        onOpenEvent={(e) => {
          const v = venues.find(x => x.id === e.venueId);
          if (v) setSelectedVenue(v);
          setSelectedEvent(e);
          setView('plan');
        }}
        onOpenPR={(pr) => { setSelectedPR(pr); setView('pr-management'); }}
        onNav={(v) => {
          setView(v as AppView);
          setSelectedVenue(null);
          setSelectedEvent(null);
          setEditingFloorPlan(null);
          setEditorVenueId(null);
          setSelectedPR(null);
        }}
      />

      {/* Toast overlay */}
      <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-[999] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="bg-[#1d1b19] border border-[#2d2a26] px-5 py-4 min-w-[260px] shadow-2xl rounded-xl"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-accent shrink-0" />
                <span className="font-semibold text-white text-sm">{t.message}</span>
                {t.action && (
                  <button
                    onClick={() => { t.action!.onClick(); setToasts(prev => prev.filter(x => x.id !== t.id)); }}
                    className="ml-auto text-xs font-semibold text-accent hover:text-white transition-colors pointer-events-auto pl-3"
                  >
                    {t.action.label}
                  </button>
                )}
              </div>
              {t.sub && <p className="text-xs text-[#8E8E93] mt-1.5 pl-5">{t.sub}</p>}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* New Event Modal */}
      {showNewEventModal && selectedVenue && (
        <NewEventModal
          venue={selectedVenue}
          floorPlans={venues.find(v => v.id === selectedVenue.id)?.floorPlans ?? []}
          prUsers={managedUsers.filter(u => u.role === 'pr' && u.status === 'approved')}
          prGroups={prGroups}
          onClose={() => setShowNewEventModal(false)}
          onSubmit={(data, token) => {
            setEvents(prev => [...prev, {
              id: `e_${Date.now()}`,
              venueId: selectedVenue.id,
              status: 'active',
              registrationToken: token,
              ...data,
            }]);
          }}
        />
      )}

      {editingVenue && (
        <NewClubModal
          initialData={{ name: editingVenue.name, address: editingVenue.address }}
          onClose={() => setEditingVenue(null)}
          onSubmit={({ name, address }) => {
            setVenues(prev => prev.map(v => v.id === editingVenue.id ? { ...v, name, address } : v));
            setEditingVenue(null);
          }}
        />
      )}

      {showNewClubModal && (
        <NewClubModal
          onClose={() => setShowNewClubModal(false)}
          onSubmit={({ name, address }) => {
            const venueId = `v_${Date.now()}`;
            setVenues(prev => [...prev, { id: venueId, name, address, floorPlans: [] }]);
            setShowNewClubModal(false);
            setEditingFloorPlan({
              venueId,
              fp: { id: '', name: '', canvasWidth: 800, canvasHeight: 600, staticAreas: [], tables: [] },
            });
            setView('editor');
          }}
        />
      )}

      {editingEvent && selectedVenue && (
        <NewEventModal
          venue={selectedVenue}
          floorPlans={venues.find(v => v.id === selectedVenue.id)?.floorPlans ?? []}
          prUsers={managedUsers.filter(u => u.role === 'pr' && u.status === 'approved')}
          prGroups={prGroups}
          initialData={editingEvent}
          onClose={() => setEditingEvent(null)}
          onSubmit={(data) => {
            setEvents(prev => prev.map(ev => ev.id === editingEvent.id ? { ...ev, ...data } : ev));
            setEditingEvent(null);
          }}
        />
      )}

      {duplicatingEvent && (() => {
        const dupVenue = venues.find(v => v.id === duplicatingEvent.venueId);
        if (!dupVenue) return null;
        return (
          <NewEventModal
            venue={dupVenue}
            floorPlans={dupVenue.floorPlans}
            prUsers={managedUsers.filter(u => u.role === 'pr' && u.status === 'approved')}
            prGroups={prGroups}
            prefill={duplicatingEvent}
            onClose={() => setDuplicatingEvent(null)}
            onSubmit={(data, token) => {
              setEvents(prev => [...prev, {
                id: `e_${Date.now()}`,
                venueId: dupVenue.id,
                status: 'active',
                registrationToken: token,
                ...data,
              }]);
              setDuplicatingEvent(null);
            }}
          />
        );
      })()}

      {regiaEvent && user && (() => {
        const rVenue = venues.find(v => v.id === regiaEvent.venueId);
        if (!rVenue) return null;
        return (
          <LiveControlRoom
            event={regiaEvent}
            venue={rVenue}
            reservations={reservations}
            currentUser={user}
            onClose={() => setRegiaEvent(null)}
          />
        );
      })()}

      {showBottleMenu && (
        <BottleMenuModal
          menu={bottleMenu}
          onClose={() => setShowBottleMenu(false)}
          onSave={(m) => { setBottleMenu(m); setShowBottleMenu(false); }}
        />
      )}

      {showQuickAdd && user && (
        <QuickAddModal
          events={prVisibleEvents}
          venues={venues}
          user={user}
          onClose={() => setShowQuickAdd(false)}
          onAdd={(res) => {
            const newRes = { ...res, id: `r_${Date.now()}`, createdAt: new Date().toISOString() };
            setReservations(prev => [...prev, newRes]);
          }}
        />
      )}

      {showNewFloorPlanModal && (
        <NewFloorPlanModal
          venues={venues}
          onClose={() => setShowNewFloorPlanModal(false)}
          onSubmit={(venueId, name) => {
            setShowNewFloorPlanModal(false);
            setEditingFloorPlan({
              venueId,
              fp: { id: `fp_${Date.now()}`, name, canvasWidth: 800, canvasHeight: 600, staticAreas: [], tables: [] },
            });
          }}
        />
      )}

      {editingFloorPlanMeta && (
        <FloorPlanMetaModal
          fp={editingFloorPlanMeta.fp}
          onClose={() => setEditingFloorPlanMeta(null)}
          onSubmit={(name) => {
            setVenues(prev => prev.map(v =>
              v.id === editingFloorPlanMeta.venueId
                ? { ...v, floorPlans: v.floorPlans.map(f => f.id === editingFloorPlanMeta.fp.id ? { ...f, name } : f) }
                : v
            ));
            setEditingFloorPlanMeta(null);
          }}
        />
      )}

      {editingFloorPlan && (
        <FloorPlanEditor
          key={editingFloorPlan.fp.id || 'new'}
          floorPlan={editingFloorPlan.fp}
          onSave={(savedFp) => {
            setVenues(prev => prev.map(v =>
              v.id === editingFloorPlan.venueId
                ? {
                    ...v,
                    floorPlans: v.floorPlans.some(fp => fp.id === savedFp.id)
                      ? v.floorPlans.map(fp => fp.id === savedFp.id ? savedFp : fp)
                      : [...v.floorPlans, savedFp],
                  }
                : v
            ));
            setEditingFloorPlan(null);
          }}
          onClose={() => setEditingFloorPlan(null)}
        />
      )}

      {editingReservation && (
        <ReservationQuickEditModal
          reservation={editingReservation}
          onClose={() => setEditingReservation(null)}
          onSave={(updated) => {
            setReservations(prev => prev.map(r => r.id === updated.id ? updated : r));
            setEditingReservation(null);
          }}
        />
      )}

      {/* AI Chat — solo admin */}
      {user.role === 'admin' && (
        <AIChat
          user={user}
          events={events}
          venues={venues}
          reservations={reservations}
          managedUsers={managedUsers}
          pendingCount={pendingCount}
        />
      )}
    </div>
  );
}

