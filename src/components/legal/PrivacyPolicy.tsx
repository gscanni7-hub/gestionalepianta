import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/* Bozza tecnica — da far validare da un legale prima del go-live.
   Tutti i campi tra [PARENTESI QUADRE MAIUSCOLE] vanno compilati. */

export default function PrivacyPolicy() {
  const lastUpdate = '4 giugno 2026';

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      {/* Header */}
      <header className="border-b border-[#1d1b19]">
        <div className="max-w-3xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-[#8E8E93] hover:text-white transition-colors text-xs">
            <ArrowLeft size={12} /> Torna alla home
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#D4622A] flex items-center justify-center">
              <span className="text-black font-black text-[7px]" style={{ fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif' }}>N</span>
            </div>
            <span className="text-[9px] font-mono uppercase tracking-[0.4em] text-[#8E8E93]">Nightplan</span>
          </div>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-6 py-12">
        {/* Title */}
        <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-[#D4622A] mb-3">Informativa</p>
        <h1 className="hv font-black text-4xl md:text-5xl uppercase leading-none text-white mb-4">
          Privacy Policy
        </h1>
        <p className="text-[#8E8E93] text-sm">
          Ultimo aggiornamento: {lastUpdate}
        </p>

        <div className="h-[1px] bg-[#1d1b19] my-10" />

        {/* Intro */}
        <p className="text-[#cfc7bc] text-[15px] leading-relaxed mb-10">
          La presente informativa descrive come <strong className="text-white">Nightplan</strong> tratta
          i dati personali raccolti tramite il modulo di registrazione alle serate organizzate dai
          locali nostri clienti, in conformità al Regolamento UE 2016/679 (GDPR) e al D.Lgs. 196/2003
          come modificato dal D.Lgs. 101/2018.
        </p>

        <Section title="1. Titolare del trattamento">
          <p>
            Il Titolare del trattamento è <strong className="text-white">[INSERIRE RAGIONE SOCIALE]</strong>,
            con sede in [INSERIRE INDIRIZZO COMPLETO], P.IVA <strong className="text-white">[INSERIRE P.IVA]</strong>.
          </p>
          <p>
            Per qualsiasi richiesta relativa al trattamento dei dati è possibile contattare il Titolare
            scrivendo a <a href="mailto:[INSERIRE EMAIL PRIVACY]" className="text-[#D4622A] hover:underline">[INSERIRE EMAIL PRIVACY]</a>.
          </p>
          <p className="text-[11px] text-[#636366]">
            Nota: nel caso in cui il Locale che organizza l'evento sia un'entità diversa da Nightplan,
            <strong className="text-white"> il Locale agisce come Titolare autonomo</strong> e Nightplan
            come Responsabile del trattamento ai sensi dell'art. 28 GDPR.
          </p>
        </Section>

        <Section title="2. Dati raccolti">
          <p>Tramite il modulo di registrazione raccogliamo i seguenti dati:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Nome e cognome</li>
            <li>Indirizzo email</li>
            <li>Numero di telefono (facoltativo)</li>
            <li>Numero di persone in prenotazione</li>
            <li>Dati tecnici di sessione (token, timestamp, eventuali log di accesso)</li>
          </ul>
          <p>
            Non raccogliamo dati appartenenti a categorie particolari (art. 9 GDPR) né dati di minori.
            L'accesso al modulo è riservato a persone maggiorenni.
          </p>
        </Section>

        <Section title="3. Finalità e base giuridica">
          <p>I dati sono trattati per le seguenti finalità:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong className="text-white">Gestione della prenotazione</strong> alla serata e dei
              relativi servizi accessori (check-in, comunicazioni operative).
              <br/><span className="text-[#8E8E93] text-[12px]">Base giuridica: esecuzione di misure precontrattuali e contrattuali — art. 6(1)(b) GDPR.</span>
            </li>
            <li>
              <strong className="text-white">Adempimenti di legge</strong> (es. obblighi fiscali e di
              sicurezza pubblica).
              <br/><span className="text-[#8E8E93] text-[12px]">Base giuridica: obbligo legale — art. 6(1)(c) GDPR.</span>
            </li>
            <li>
              <strong className="text-white">Sicurezza della piattaforma</strong> e prevenzione di
              abusi e frodi.
              <br/><span className="text-[#8E8E93] text-[12px]">Base giuridica: legittimo interesse — art. 6(1)(f) GDPR.</span>
            </li>
          </ul>
          <p className="text-[11px] text-[#636366]">
            Non vengono effettuate attività di marketing, profilazione o cessione a terzi a fini
            commerciali senza un consenso esplicito e separato.
          </p>
        </Section>

        <Section title="4. Periodo di conservazione">
          <p>I dati sono conservati per i tempi strettamente necessari alle finalità di trattamento:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Dati di prenotazione: fino a <strong className="text-white">[INSERIRE PERIODO, es. 90 giorni]</strong> dopo la data della serata.</li>
            <li>Log tecnici di sicurezza: fino a 12 mesi.</li>
            <li>Dati con obbligo legale di conservazione (es. fiscali): per il periodo previsto dalla normativa applicabile.</li>
          </ul>
          <p>
            Trascorsi tali termini i dati sono cancellati o resi anonimi in modo irreversibile.
          </p>
        </Section>

        <Section title="5. Destinatari dei dati">
          <p>I dati possono essere comunicati a:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Il <strong className="text-white">Locale organizzatore</strong> della serata, per l'erogazione del servizio.</li>
            <li>Lo <strong className="text-white">staff autorizzato</strong> (PR, accoglienza, gestori) per la gestione operativa del check-in.</li>
            <li>
              I fornitori tecnologici che agiscono come Responsabili del trattamento, in particolare:
              <ul className="list-[circle] pl-5 mt-1 space-y-1 text-[#8E8E93] text-[13px]">
                <li><strong className="text-[#cfc7bc]">Google LLC / Firebase</strong> — hosting database e autenticazione (server UE, con clausole contrattuali standard per eventuali trasferimenti extra-UE).</li>
                <li><strong className="text-[#cfc7bc]">EmailJS</strong> — invio di comunicazioni email transazionali.</li>
                <li><strong className="text-[#cfc7bc]">Vercel Inc.</strong> — hosting della piattaforma web.</li>
              </ul>
            </li>
          </ul>
          <p>
            I dati non sono diffusi né venduti a terzi.
          </p>
        </Section>

        <Section title="6. Trasferimenti extra-UE">
          <p>
            Alcuni Responsabili del trattamento sopra indicati hanno sede negli Stati Uniti. Eventuali
            trasferimenti di dati al di fuori dello Spazio Economico Europeo avvengono nel rispetto
            delle garanzie previste dagli artt. 44-49 GDPR, in particolare tramite
            <strong className="text-white"> Clausole Contrattuali Standard</strong> approvate dalla
            Commissione Europea.
          </p>
        </Section>

        <Section title="7. Cookie e tecnologie similari">
          <p>
            La piattaforma utilizza esclusivamente <strong className="text-white">cookie tecnici e
            funzionali strettamente necessari</strong> al funzionamento del servizio (es. mantenimento
            della sessione di autenticazione, memorizzazione delle preferenze utente). Tali cookie
            non richiedono un consenso preventivo ai sensi dell'art. 122 del Codice Privacy.
          </p>
          <p>
            Non vengono utilizzati cookie di profilazione, di analisi statistica di terze parti né
            cookie di marketing.
          </p>
        </Section>

        <Section title="8. Diritti dell'interessato">
          <p>In ogni momento è possibile esercitare i seguenti diritti previsti dagli artt. 15-22 GDPR:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong className="text-white">Accesso</strong> ai dati personali (art. 15)</li>
            <li><strong className="text-white">Rettifica</strong> dei dati inesatti (art. 16)</li>
            <li><strong className="text-white">Cancellazione</strong> dei dati ("diritto all'oblio", art. 17)</li>
            <li><strong className="text-white">Limitazione</strong> del trattamento (art. 18)</li>
            <li><strong className="text-white">Portabilità</strong> dei dati (art. 20)</li>
            <li><strong className="text-white">Opposizione</strong> al trattamento (art. 21)</li>
            <li><strong className="text-white">Revoca del consenso</strong> in qualsiasi momento, senza pregiudicare la liceità del trattamento precedente</li>
          </ul>
          <p>
            Le richieste possono essere inviate a{' '}
            <a href="mailto:[INSERIRE EMAIL PRIVACY]" className="text-[#D4622A] hover:underline">[INSERIRE EMAIL PRIVACY]</a>.
            È inoltre sempre possibile proporre reclamo al{' '}
            <a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer" className="text-[#D4622A] hover:underline">
              Garante per la Protezione dei Dati Personali
            </a>.
          </p>
        </Section>

        <Section title="9. Conferimento dei dati">
          <p>
            Il conferimento dei dati contrassegnati come obbligatori (nome, cognome, email, numero
            persone) è necessario per la gestione della prenotazione. Il mancato conferimento
            comporta l'impossibilità di completare la registrazione alla serata.
          </p>
        </Section>

        <Section title="10. Modifiche all'informativa">
          <p>
            Il Titolare si riserva il diritto di modificare la presente informativa per adeguarla a
            evoluzioni normative o organizzative. La versione vigente è sempre disponibile a questa
            pagina, con indicazione della data di ultimo aggiornamento.
          </p>
        </Section>

        {/* Footer brand */}
        <div className="mt-16 pt-8 border-t border-[#1d1b19] flex items-center justify-center gap-2">
          <div className="w-4 h-4 bg-[#D4622A] flex items-center justify-center">
            <span className="text-black font-black text-[7px]" style={{ fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif' }}>N</span>
          </div>
          <span className="text-[8px] font-mono uppercase tracking-[0.4em] text-[#3b3733]">Powered by Nightplan</span>
        </div>
      </article>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="hv font-black text-lg uppercase tracking-wide text-white mb-4">{title}</h2>
      <div className="space-y-3 text-[#cfc7bc] text-[14px] leading-relaxed">
        {children}
      </div>
    </section>
  );
}
