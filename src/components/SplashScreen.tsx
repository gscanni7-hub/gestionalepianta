import { motion } from 'framer-motion';

// Scene: venue manager, backstage, 23:00, dark room — needs control, not seduction.

const EASE = [0.16, 1, 0.3, 1] as const;

const TABLES = [
  { id: 1,  cx: 78,  cy: 64,  r: 26, s: 'occupied' },
  { id: 2,  cx: 166, cy: 57,  r: 22, s: 'reserved' },
  { id: 3,  cx: 260, cy: 67,  r: 24, s: 'free' },
  { id: 4,  cx: 352, cy: 54,  r: 20, s: 'occupied' },
  { id: 5,  cx: 70,  cy: 162, r: 28, s: 'reserved' },
  { id: 6,  cx: 166, cy: 156, r: 24, s: 'free' },
  { id: 7,  cx: 265, cy: 160, r: 26, s: 'occupied' },
  { id: 8,  cx: 358, cy: 148, r: 22, s: 'free' },
  { id: 9,  cx: 116, cy: 252, r: 20, s: 'free' },
  { id: 10, cx: 222, cy: 244, r: 28, s: 'reserved' },
  { id: 11, cx: 322, cy: 240, r: 24, s: 'occupied' },
];

const RESERVATIONS = [
  { name: 'Marco Rossi',   table: 'T-12',  time: '22:30', status: 'Al tavolo',  dot: '#D4622A' },
  { name: 'Sofia Bianchi', table: 'T-07',  time: '23:00', status: 'In arrivo',  dot: '#F59E0B' },
  { name: 'Luca Ferrari',  table: 'VIP-2', time: '21:45', status: 'Confermata', dot: '#22C55E' },
  { name: 'Elena Romano',  table: 'T-03',  time: '23:30', status: 'Prenotata',  dot: 'rgba(255,255,255,0.28)' },
];

function FloorPlanSVG() {
  return (
    <svg viewBox="0 0 440 312" style={{ width: '100%', display: 'block' }} aria-hidden="true">
      {/* Room boundary */}
      <rect x="8" y="8" width="424" height="296" rx="14"
        fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

      {/* Bar counter */}
      <rect x="26" y="272" width="148" height="20" rx="4"
        fill="rgba(212,98,42,0.07)" stroke="rgba(212,98,42,0.2)" strokeWidth="1" />
      <text x="100" y="286" textAnchor="middle"
        fill="rgba(212,98,42,0.5)" fontSize="8" fontFamily="Inter, sans-serif"
        fontWeight="600" letterSpacing="1.2">BAR</text>

      {/* Entrance */}
      <rect x="376" y="272" width="48" height="20" rx="4"
        fill="rgba(255,255,255,0.025)" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
      <text x="400" y="286" textAnchor="middle"
        fill="rgba(255,255,255,0.2)" fontSize="7" fontFamily="Inter, sans-serif" letterSpacing="0.5">ENTRATA</text>

      {/* VIP booth */}
      <rect x="398" y="66" width="34" height="94" rx="6"
        fill="rgba(212,98,42,0.06)" stroke="rgba(212,98,42,0.26)" strokeWidth="1" />
      <text x="415" y="116" textAnchor="middle"
        fill="rgba(212,98,42,0.55)" fontSize="8" fontFamily="Inter, sans-serif"
        fontWeight="600" letterSpacing="1">VIP</text>

      {/* Tables */}
      {TABLES.map(t => {
        const occ = t.s === 'occupied';
        const res = t.s === 'reserved';
        return (
          <g key={t.id}>
            <circle
              cx={t.cx} cy={t.cy} r={t.r}
              fill={occ ? 'rgba(212,98,42,0.11)' : res ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.02)'}
              stroke={occ ? '#D4622A' : res ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.07)'}
              strokeWidth={occ ? 1.5 : 1}
            />
            <text
              x={t.cx} y={t.cy + 4}
              textAnchor="middle"
              fill={occ ? 'rgba(212,98,42,0.8)' : 'rgba(255,255,255,0.18)'}
              fontSize="9.5" fontFamily="Inter, sans-serif" fontWeight="500"
            >{t.id}</text>
          </g>
        );
      })}
    </svg>
  );
}

export default function SplashScreen({ onAccedi }: { onAccedi: () => void }) {
  return (
    <div style={{ width: '100vw', minHeight: '100vh', backgroundColor: 'oklch(8% 0.004 30)', fontFamily: 'Inter, sans-serif', WebkitFontSmoothing: 'antialiased' }}>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: '0 24px',
      }}>
        {/* Subtle dot grid — suggests floor plan */}
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.016) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
          pointerEvents: 'none',
        }} />

        {/* Logo mark */}
        <motion.img
          src="/Logo.png"
          alt="Nightplan"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.88 }}
          transition={{ duration: 0.6, ease: EASE }}
          style={{ width: 44, height: 44, objectFit: 'contain', marginBottom: 52, position: 'relative', zIndex: 1 }}
        />

        {/* Massive title */}
        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.12, ease: EASE }}
          style={{
            fontSize: 'clamp(60px, 11vw, 128px)',
            fontWeight: 900,
            color: 'oklch(94% 0.006 45)',
            letterSpacing: '-0.055em',
            lineHeight: 0.93,
            margin: 0,
            textAlign: 'center',
            position: 'relative',
            zIndex: 1,
          }}
        >
          Nightplan
        </motion.h1>

        {/* Orange accent line — scaleX reveal */}
        <motion.div
          aria-hidden="true"
          initial={{ scaleX: 0, originX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.45, delay: 0.52, ease: [0.4, 0, 0.2, 1] }}
          style={{ width: 44, height: 2, backgroundColor: '#D4622A', marginTop: 28, position: 'relative', zIndex: 1 }}
        />

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.32, ease: EASE }}
          style={{
            fontSize: 'clamp(15px, 1.6vw, 19px)',
            fontWeight: 400,
            color: 'rgba(255,255,255,0.36)',
            lineHeight: 1.55,
            margin: '24px 0 40px',
            textAlign: 'center',
            maxWidth: 400,
            position: 'relative',
            zIndex: 1,
          }}
        >
          Prenotazioni, tavoli e ingressi.<br />
          Una piattaforma per chi gestisce locali notturni.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.44, ease: EASE }}
          style={{ position: 'relative', zIndex: 1 }}
        >
          <motion.button
            onClick={onAccedi}
            whileHover={{ scale: 1.03, backgroundColor: '#e8702f' }}
            whileTap={{ scale: 0.97 }}
            style={{
              backgroundColor: '#D4622A',
              color: '#fff',
              fontWeight: 600,
              fontSize: 15,
              padding: '14px 48px',
              borderRadius: 9999,
              border: 'none',
              cursor: 'pointer',
              letterSpacing: '-0.01em',
              fontFamily: 'inherit',
              transition: 'background-color 0.15s',
            }}
          >
            Accedi
          </motion.button>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          aria-hidden="true"
          style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.18)' }}
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </motion.div>
      </div>

      {/* ── SECTION 1: Floor plan ─────────────────────────────────── */}
      <div style={{ backgroundColor: 'oklch(9.5% 0.004 30)', padding: '80px 24px' }}>
        <div style={{
          maxWidth: 1080,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: '56px',
          alignItems: 'center',
        }}>
          {/* SVG panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: EASE }}
            style={{
              backgroundColor: 'oklch(7% 0.003 30)',
              borderRadius: 16,
              padding: '28px',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <FloorPlanSVG />
          </motion.div>

          {/* Text side */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
          >
            <p style={{ fontSize: 11, fontWeight: 600, color: '#D4622A', letterSpacing: '0.09em', textTransform: 'uppercase', margin: '0 0 18px' }}>
              Pianta interattiva
            </p>
            <h2 style={{
              fontSize: 'clamp(26px, 2.8vw, 36px)',
              fontWeight: 800,
              color: 'oklch(93% 0.006 45)',
              letterSpacing: '-0.035em',
              lineHeight: 1.15,
              margin: '0 0 20px',
            }}>
              Vedi il tuo locale<br />in tempo reale.
            </h2>
            <p style={{
              fontSize: 15,
              color: 'rgba(255,255,255,0.36)',
              lineHeight: 1.7,
              margin: '0 0 32px',
              maxWidth: 360,
            }}>
              Tavoli occupati, prenotati e liberi — aggiornati al secondo. Clicca su un tavolo per gestire la prenotazione senza uscire dalla pianta.
            </p>

            {[
              'Drag-and-drop per riposizionare i tavoli',
              'Stato aggiornato via Firebase in real time',
              'Ottimizzato per desktop e tablet',
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 13 }}>
                <div style={{ width: 5, height: 5, backgroundColor: '#D4622A', borderRadius: '50%', marginTop: 7, flexShrink: 0 }} />
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.44)', lineHeight: 1.5 }}>{f}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── SECTION 2: Reservation list ──────────────────────────── */}
      <div style={{ backgroundColor: 'oklch(8% 0.004 30)', padding: '80px 24px 100px' }}>
        <div style={{ maxWidth: 840, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.65, ease: EASE }}
          >
            <p style={{ fontSize: 11, fontWeight: 600, color: '#D4622A', letterSpacing: '0.09em', textTransform: 'uppercase', margin: '0 0 18px' }}>
              Prenotazioni
            </p>
            <h2 style={{
              fontSize: 'clamp(26px, 2.8vw, 36px)',
              fontWeight: 800,
              color: 'oklch(93% 0.006 45)',
              letterSpacing: '-0.035em',
              lineHeight: 1.15,
              margin: '0 0 44px',
              maxWidth: 520,
            }}>
              La lista della serata,<br />sempre aggiornata.
            </h2>
          </motion.div>

          {/* Table header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 72px 64px 116px',
            padding: '0 0 10px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            {['NOME', 'TAVOLO', 'ORA', 'STATO'].map(h => (
              <span key={h} style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em' }}>{h}</span>
            ))}
          </div>

          {/* Rows */}
          {RESERVATIONS.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -14 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.48, delay: i * 0.07, ease: EASE }}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 72px 64px 116px',
                padding: '16px 0',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 500, color: 'oklch(90% 0.005 40)' }}>{r.name}</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontFamily: 'Roboto Mono, monospace' }}>{r.table}</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontFamily: 'Roboto Mono, monospace' }}>{r.time}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: r.dot, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.42)' }}>{r.status}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <div style={{
        backgroundColor: 'oklch(8% 0.004 30)',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        padding: '22px 24px',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.14)', margin: 0 }}>
          © 2025 Nightplan
        </p>
      </div>
    </div>
  );
}
