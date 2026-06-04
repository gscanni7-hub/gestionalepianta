import emailjs from '@emailjs/browser';

const SERVICE_ID         = import.meta.env.VITE_EMAILJS_SERVICE_ID         ?? '';
const TEMPLATE_ID        = import.meta.env.VITE_EMAILJS_TEMPLATE_ID        ?? '';
const NOTIFY_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_NOTIFY_TEMPLATE_ID ?? '';
const PUBLIC_KEY         = import.meta.env.VITE_EMAILJS_PUBLIC_KEY         ?? '';

export const isEmailConfigured = () => !!(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);
const isNotifyConfigured = () => !!(SERVICE_ID && NOTIFY_TEMPLATE_ID && PUBLIC_KEY);

export async function sendPasswordResetEmail(
  toEmail: string,
  userName: string,
  resetLink: string,
) {
  await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
    to_email:   toEmail,
    user_name:  userName,
    reset_link: resetLink,
  }, PUBLIC_KEY);
}

/* ── Notifiche transazionali ───────────────────────────────────
   Tutte fire-and-forget: se EmailJS non è configurato o l'invio
   fallisce, registriamo in console ma non blocchiamo mai l'UI.
   Richiedono un template EmailJS dedicato con le variabili:
   {{to_email}}, {{to_name}}, {{subject}}, {{title}}, {{body}},
   {{cta_label}}, {{cta_url}}.                                  */

interface NotifyPayload {
  toEmail: string;
  toName?: string;
  subject: string;
  title: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
}

async function sendNotification(p: NotifyPayload): Promise<void> {
  if (!isNotifyConfigured()) {
    console.info('[email] notify skipped (EmailJS notify template not configured)', p.subject, '→', p.toEmail);
    return;
  }
  try {
    await emailjs.send(SERVICE_ID, NOTIFY_TEMPLATE_ID, {
      to_email:  p.toEmail,
      to_name:   p.toName  ?? '',
      subject:   p.subject,
      title:     p.title,
      body:      p.body,
      cta_label: p.ctaLabel ?? '',
      cta_url:   p.ctaUrl   ?? '',
    }, PUBLIC_KEY);
  } catch (err) {
    console.warn('[email] notify failed:', p.subject, err);
  }
}

const appUrl = () => (typeof window !== 'undefined' ? window.location.origin : '');

/* PR — la sua prenotazione è stata approvata */
export function notifyReservationApproved(args: {
  prEmail: string; prName: string;
  customerName: string; tableName: string;
  eventName: string; eventDate: string;
}): void {
  void sendNotification({
    toEmail: args.prEmail,
    toName:  args.prName,
    subject: `Prenotazione approvata — ${args.customerName}`,
    title:   'Prenotazione approvata',
    body:    `Ciao ${args.prName},\n\nla prenotazione di ${args.customerName} (Tavolo ${args.tableName}) per "${args.eventName}" del ${args.eventDate} è stata approvata.`,
    ctaLabel:'Apri Nightplan',
    ctaUrl:  appUrl(),
  });
}

/* PR — la sua prenotazione è stata rifiutata */
export function notifyReservationRejected(args: {
  prEmail: string; prName: string;
  customerName: string; tableName: string;
  eventName: string; eventDate: string;
}): void {
  void sendNotification({
    toEmail: args.prEmail,
    toName:  args.prName,
    subject: `Prenotazione rifiutata — ${args.customerName}`,
    title:   'Prenotazione rifiutata',
    body:    `Ciao ${args.prName},\n\nla prenotazione di ${args.customerName} (Tavolo ${args.tableName}) per "${args.eventName}" del ${args.eventDate} è stata rifiutata. Contatta l'admin per i dettagli.`,
    ctaLabel:'Apri Nightplan',
    ctaUrl:  appUrl(),
  });
}

/* PR — il suo account è stato approvato dall'admin */
export function notifyPrAccountApproved(args: {
  prEmail: string; prName: string;
}): void {
  void sendNotification({
    toEmail: args.prEmail,
    toName:  args.prName,
    subject: 'Il tuo account Nightplan è attivo',
    title:   'Account approvato',
    body:    `Ciao ${args.prName},\n\nil tuo account PR su Nightplan è stato approvato. Da ora puoi accedere e iniziare a gestire le tue prenotazioni.`,
    ctaLabel:'Accedi a Nightplan',
    ctaUrl:  appUrl(),
  });
}

/* Admin — un nuovo PR si è registrato e attende approvazione */
export function notifyAdminNewPrSignup(args: {
  adminEmail: string;
  prName: string; prEmail: string; prPhone: string;
}): void {
  void sendNotification({
    toEmail: args.adminEmail,
    subject: `Nuova richiesta PR — ${args.prName}`,
    title:   'Nuova richiesta di registrazione PR',
    body:    `Un nuovo PR ha richiesto l'accesso a Nightplan:\n\nNome: ${args.prName}\nEmail: ${args.prEmail}\nTelefono: ${args.prPhone || '—'}\n\nApri la dashboard per approvare o rifiutare la richiesta.`,
    ctaLabel:'Vai alle approvazioni',
    ctaUrl:  appUrl(),
  });
}

/* Admin / PR — un cliente si è registrato dal link pubblico */
export function notifyNewRegistration(args: {
  toEmail: string; toName?: string;
  customerName: string; customerEmail: string; customerPhone: string;
  guestsCount: number;
  eventName: string; eventDate: string;
  prName?: string;
}): void {
  const prLine = args.prName ? `\nPR di riferimento: ${args.prName}` : '';
  void sendNotification({
    toEmail: args.toEmail,
    toName:  args.toName,
    subject: `Nuova registrazione — ${args.customerName}`,
    title:   'Nuova registrazione cliente',
    body:    `È arrivata una nuova registrazione per "${args.eventName}" del ${args.eventDate}.\n\nCliente: ${args.customerName}\nEmail: ${args.customerEmail}\nTelefono: ${args.customerPhone || '—'}\nOspiti: ${args.guestsCount}${prLine}`,
    ctaLabel:'Apri Nightplan',
    ctaUrl:  appUrl(),
  });
}
