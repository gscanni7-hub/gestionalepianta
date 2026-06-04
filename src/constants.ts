import { Event, ManagedUser, Reservation, Venue } from './types';
import { NAIF_FLOOR_PLAN, DUEL_FLOOR_PLAN } from './data/floorplans';

export const INITIAL_MANAGED_USERS: ManagedUser[] = [
  { id: 'admin_1', email: 'g.scanni7@gmail.com',      password: '1234', role: 'admin', displayName: 'Admin',        lastName: '',      phone: '', status: 'approved', createdAt: '2025-01-01T00:00:00.000Z' },
  { id: 'pr_1',    email: 'lucavisca@gmail.com',      password: '1234', role: 'pr',    displayName: 'Luca',         lastName: 'Visca', phone: '', status: 'approved', createdAt: '2025-01-01T00:00:00.000Z' },
  { id: 'host_1',  email: 'accoglienza@nightplan.it', password: '1234', role: 'host',  displayName: 'Accoglienza',  lastName: '',      phone: '', status: 'approved', createdAt: '2025-01-01T00:00:00.000Z' },
];

export const INITIAL_VENUES: Venue[] = [
  { id: 'v_naif', name: 'NAIF',      address: 'Milano', floorPlans: [NAIF_FLOOR_PLAN] },
  { id: 'v_duel', name: 'DUEL CLUB', address: 'Milano', floorPlans: [DUEL_FLOOR_PLAN] },
];

export const INITIAL_EVENTS: Event[] = [
  { id: 'e1', venueId: 'v_naif', name: 'Techno Friday',          date: '2025-05-09', description: 'Special guest DJ from Berlin', floorPlanId: 'fp_naif_1', status: 'active', registrationToken: 'techno-friday-e1' },
  { id: 'e2', venueId: 'v_naif', name: 'Saturday Night Fever',   date: '2025-05-10', description: '70s & 80s hits',               floorPlanId: 'fp_naif_1', status: 'active', registrationToken: 'saturday-fever-e2' },
];

export const INITIAL_RESERVATIONS: Reservation[] = [];

export const INITIAL_BOTTLE_MENU = [
  { id: 'b_vodka',     name: 'Vodka Premium',  price: 180 },
  { id: 'b_gin',       name: 'Gin Tonic Set',  price: 160 },
  { id: 'b_rum',       name: 'Rum Selezione',  price: 170 },
  { id: 'b_whisky',    name: 'Whisky Riserva', price: 220 },
  { id: 'b_champagne', name: 'Champagne',      price: 350 },
  { id: 'b_moet',      name: 'Moët & Chandon', price: 300 },
  { id: 'b_prosecco',  name: 'Prosecco',       price: 90  },
  { id: 'b_tequila',   name: 'Tequila',        price: 190 },
];
