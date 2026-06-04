import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/* Bozza tecnica — da far validare da un legale prima del go-live.
   Campi tra [PARENTESI QUADRE MAIUSCOLE] vanno compilati. */

export default function TermsOfService() {
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
        <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-[#D4622A] mb-3">Accordo</p>
        <h1 className="hv font-black text-4xl md:text-5xl uppercase leading-none text-white mb-4">
          Termini di Servizio
        </h1>
        <p className="text-[#8E8E93] text-sm">
          Ultimo aggiornamento: {lastUpdate}
        </p>

        <div className="h-[1px] bg-[#1d1b19] my-10" />

        {/* Intro */}
        <p className="text-[#cfc7bc] text-[15px] leading-relaxed mb-10">
          I presenti Termini regolano l'accesso e l'utilizzo della piattaforma{' '}
          <strong className="text-white">Nightplan</strong> da parte di amministratori, PR e
          staff dei locali clienti. Creando un account o accedendo al servizio l'utente
          accetta integralmente i seguenti termini.
        </p>

        <Section title="1. Definizioni">
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong className="text-white">Piattaforma</strong>: il software Nightplan accessibile via web per la gestione delle prenotazioni dei tavoli e del check-in serale.</li>
            <li><strong className="text-white">Utente</strong>: persona fisica che accede alla Piattaforma con un account (admin, PR, staff di accoglienza).</li>
            <li><strong className="text-white">Locale</strong>: l'esercizio commerciale (club, bar, discoteca) titolare del rapporto contrattuale con il fornitore.</li>
            <li><strong className="text-white">Fornitore</strong>: <strong className="text-white">[INSERIRE RAGIONE SOCIALE]</strong>, erogatore del servizio.</li>
          </ul>
        </Section>

        <Section title="2. Oggetto del servizio">
          <p>
            La Piattaforma consente al Locale e al suo staff autorizzato di gestire le
            prenotazioni dei tavoli, generare link pubblici di registrazione per i clienti,
            assegnare tavoli ai PR, controllare gli ingressi alla serata e visualizzare
            statistiche operative.
          </p>
          <p>
            Il servizio è erogato in modalità SaaS (Software as a Service) e non comporta
            la cessione di licenze d'uso del software.
          </p>
        </Section>

        <Section title="3. Account e credenziali">
          <p>Per accedere alla Piattaforma l'Utente deve disporre di un account valido. L'Utente si impegna a:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Fornire informazioni veritiere, accurate e aggiornate al momento della registrazione.</li>
            <li>Mantenere riservate le proprie credenziali di accesso e non condividerle con terzi.</li>
            <li>Comunicare tempestivamente al Fornitore qualsiasi sospetto utilizzo non autorizzato del proprio account.</li>
          </ul>
          <p>
            L'attivazione dell'account è subordinata all'approvazione da parte dell'amministratore
            del Locale di riferimento.
          </p>
        </Section>

        <Section title="4. Uso consentito">
          <p>L'Utente si impegna a utilizzare la Piattaforma esclusivamente per finalità lecite e nel rispetto dei presenti Termini. In particolare è vietato:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Utilizzare la Piattaforma per attività illecite, fraudolente o lesive di diritti altrui.</li>
            <li>Caricare o trasmettere contenuti diffamatori, osceni, discriminatori o contrari alla legge.</li>
            <li>Tentare di accedere a dati o aree riservate senza autorizzazione.</li>
            <li>Effettuare reverse engineering, decompilazione o copia non autorizzata del software.</li>
            <li>Utilizzare strumenti automatici (bot, scraper) per accedere alla Piattaforma.</li>
            <li>Pregiudicare la sicurezza, l'integrità o la disponibilità del servizio.</li>
          </ul>
        </Section>

        <Section title="5. Dati dei clienti finali">
          <p>
            L'Utente che accede ai dati di prenotazione dei clienti finali (nome, email,
            telefono) li tratta nel rispetto del{' '}
            <Link to="/privacy" className="text-[#D4622A] hover:underline">GDPR e della Privacy Policy</Link>{' '}
            di Nightplan, esclusivamente per le finalità di gestione dell'evento.
          </p>
          <p>
            È vietato esportare, conservare o utilizzare i dati dei clienti finali per
            finalità diverse da quelle del servizio, salvo esplicito consenso degli
            interessati e nel rispetto della normativa applicabile.
          </p>
        </Section>

        <Section title="6. Disponibilità del servizio">
          <p>
            Il Fornitore si impegna a garantire la migliore continuità possibile del
            servizio, fermo restando che la Piattaforma può subire interruzioni temporanee
            per manutenzione programmata, aggiornamenti, cause di forza maggiore o
            malfunzionamenti dei fornitori terzi (hosting, database, autenticazione).
          </p>
          <p>
            Non è garantita una specifica percentuale di uptime, salvo diversa pattuizione
            scritta con il Locale.
          </p>
        </Section>

        <Section title="7. Sospensione e chiusura dell'account">
          <p>Il Fornitore si riserva il diritto di sospendere o chiudere l'account dell'Utente, senza preavviso, in caso di:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Violazione dei presenti Termini.</li>
            <li>Comportamenti idonei a recare danno al Fornitore, al Locale o a terzi.</li>
            <li>Richiesta dell'amministratore del Locale di riferimento.</li>
            <li>Cessazione del rapporto contrattuale con il Locale.</li>
          </ul>
          <p>
            L'Utente può richiedere la chiusura del proprio account in qualsiasi momento
            scrivendo a <a href="mailto:[INSERIRE EMAIL CONTATTI]" className="text-[#D4622A] hover:underline">[INSERIRE EMAIL CONTATTI]</a>.
          </p>
        </Section>

        <Section title="8. Proprietà intellettuale">
          <p>
            Tutti i diritti di proprietà intellettuale relativi alla Piattaforma — codice,
            interfaccia, marchi, contenuti — appartengono al Fornitore o ai suoi licenzianti.
            Nessun diritto è trasferito all'Utente al di fuori della concessione del diritto
            d'uso del servizio durante la vigenza del rapporto.
          </p>
        </Section>

        <Section title="9. Limitazione di responsabilità">
          <p>
            Nei limiti consentiti dalla legge applicabile, il Fornitore non risponde di:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Danni indiretti, consequenziali, perdita di profitti, di clientela o di opportunità commerciali.</li>
            <li>Danni derivanti da utilizzo improprio della Piattaforma da parte dell'Utente o di terzi.</li>
            <li>Indisponibilità del servizio per cause non imputabili al Fornitore.</li>
          </ul>
          <p>
            Resta ferma la responsabilità per dolo e colpa grave nei termini di legge.
          </p>
        </Section>

        <Section title="10. Modifiche ai Termini">
          <p>
            Il Fornitore si riserva il diritto di modificare i presenti Termini per esigenze
            normative, tecniche o organizzative. Le modifiche sono efficaci dalla pubblicazione
            su questa pagina; l'utilizzo continuato della Piattaforma equivale ad accettazione
            delle modifiche.
          </p>
        </Section>

        <Section title="11. Legge applicabile e foro competente">
          <p>
            I presenti Termini sono regolati dalla legge italiana. Per ogni controversia
            relativa all'interpretazione, esecuzione o risoluzione è competente in via
            esclusiva il Foro di <strong className="text-white">[INSERIRE FORO COMPETENTE]</strong>,
            fatto salvo il foro inderogabile del consumatore quando applicabile.
          </p>
        </Section>

        <Section title="12. Contatti">
          <p>
            Per qualsiasi richiesta relativa ai presenti Termini è possibile contattare il
            Fornitore all'indirizzo{' '}
            <a href="mailto:[INSERIRE EMAIL CONTATTI]" className="text-[#D4622A] hover:underline">[INSERIRE EMAIL CONTATTI]</a>.
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
