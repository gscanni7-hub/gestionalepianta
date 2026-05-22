import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, QrCode, BarChart3, Users, DoorOpen, MapPin, Bell, Shield, Zap, Smartphone } from 'lucide-react';

const ICONS = [
  { Icon: BarChart3, bg: '#1db954', color: '#fff', size: 68, x: -118, y: -100, floatAmp: 10, floatDur: 3.2 },
  { Icon: Calendar,  bg: '#3b82f6', color: '#fff', size: 60, x:   85, y: -110, floatAmp:  8, floatDur: 2.9 },
  { Icon: DoorOpen,  bg: '#D4622A', color: '#fff', size: 56, x: -130, y:   10, floatAmp: 12, floatDur: 3.6 },
  { Icon: MapPin,    bg: '#06b6d4', color: '#fff', size: 50, x:  108, y:   18, floatAmp:  7, floatDur: 3.1 },
  { Icon: QrCode,    bg: '#8b5cf6', color: '#fff', size: 62, x:  -60, y:  108, floatAmp: 11, floatDur: 3.4 },
  { Icon: Users,     bg: '#f59e0b', color: '#fff', size: 54, x:   78, y:  100, floatAmp:  9, floatDur: 2.8 },
];

const FEATURE_ICONS = [
  { Icon: Calendar,  bg: '#3b82f6' },
  { Icon: BarChart3, bg: '#1db954' },
  { Icon: QrCode,    bg: '#8b5cf6' },
  { Icon: Users,     bg: '#f59e0b' },
  { Icon: DoorOpen,  bg: '#D4622A' },
  { Icon: MapPin,    bg: '#06b6d4' },
];

const PRO_ICONS = [
  { Icon: Bell,       bg: '#D4622A' },
  { Icon: Shield,     bg: '#3b82f6' },
  { Icon: Zap,        bg: '#f59e0b' },
  { Icon: Smartphone, bg: '#1db954' },
];

const ICONS_FADE_AFTER = 8000;

export default function SplashScreen({ onAccedi }: { onAccedi: () => void }) {
  const [iconsOut, setIconsOut] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIconsOut(true), ICONS_FADE_AFTER);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ width: '100vw', minHeight: '100vh', backgroundColor: '#0a0908' }}>

      {/* ── Hero — full viewport ──────────────────────────────────── */}
      <div
        style={{
          width: '100%',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Icon cluster */}
        <div style={{ position: 'relative', width: 0, height: 0 }}>

          {/* Central logo */}
          <motion.div
            style={{
              position: 'absolute',
              width: 120,
              height: 120,
              marginLeft: -60,
              marginTop: -60,
              borderRadius: '50%',
              backgroundColor: '#1a1917',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              boxShadow: '0 2px 24px rgba(0,0,0,0.6)',
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.65, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <img
              src="/Logo.png"
              alt="Nightplan"
              style={{ width: 80, height: 80, objectFit: 'contain' }}
            />
          </motion.div>

          {/* Floating icons */}
          <AnimatePresence>
            {!iconsOut && ICONS.map(({ Icon, bg, color, size, x, y, floatAmp, floatDur }, i) => (
              <motion.div
                key={i}
                style={{
                  position: 'absolute',
                  left: x - size / 2,
                  top: y - size / 2,
                  zIndex: 5,
                }}
                initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  x: 0,
                  y: [0, -floatAmp, 0, floatAmp, 0],
                }}
                exit={{ opacity: 0, scale: 0.4, transition: { duration: 0.4, delay: i * 0.06 } }}
                transition={{
                  opacity: { duration: 0.4, delay: 0.3 + i * 0.08 },
                  scale:   { duration: 0.4, ease: [0.34, 1.56, 0.64, 1], delay: 0.3 + i * 0.08 },
                  y: { duration: floatDur, repeat: Infinity, ease: 'easeInOut', delay: i * 0.35 },
                }}
              >
                <div
                  style={{
                    width: size,
                    height: size,
                    backgroundColor: bg,
                    borderRadius: Math.round(size * 0.26),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                  }}
                >
                  <Icon size={Math.round(size * 0.42)} color={color} />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Text section */}
        <motion.div
          style={{
            marginTop: 160,
            textAlign: 'center',
            paddingLeft: 24,
            paddingRight: 24,
          }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1
            style={{
              fontSize: 'clamp(72px, 10vw, 108px)',
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: '-0.045em',
              lineHeight: 1,
              margin: 0,
            }}
          >
            Nightplan
          </h1>

          <div style={{ marginTop: 28 }}>
            <motion.button
              onClick={onAccedi}
              style={{
                backgroundColor: '#D4622A',
                color: '#fff',
                fontWeight: 600,
                fontSize: 15,
                paddingLeft: 48,
                paddingRight: 48,
                paddingTop: 15,
                paddingBottom: 15,
                borderRadius: 9999,
                border: 'none',
                cursor: 'pointer',
                letterSpacing: '-0.01em',
              }}
              whileHover={{ scale: 1.04, backgroundColor: '#e8702f' }}
              whileTap={{ scale: 0.97 }}
            >
              Accedi
            </motion.button>
          </div>

          <p
            style={{
              marginTop: 32,
              fontSize: 'clamp(20px, 2.5vw, 28px)',
              fontWeight: 600,
              color: '#4a4846',
              lineHeight: 1.35,
              maxWidth: 460,
              margin: '32px auto 0',
            }}
          >
            La piattaforma ideale per gestire<br />
            prenotazioni, tavoli e serate.
          </p>
        </motion.div>

        {/* Scroll hint chevron */}
        <motion.div
          style={{
            position: 'absolute',
            bottom: 36,
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#2e2c2a',
          }}
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </motion.div>
      </div>

      {/* ── Cards section — below hero, like iCloud ───────────────── */}
      <div
        style={{
          backgroundColor: '#0c0b0a',
          padding: '80px 20px 100px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 1160,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 16,
          }}
        >

          {/* Card 1 — Feature icons grid (like iCloud's app-grid card) */}
          <motion.div
            style={{
              backgroundColor: '#141412',
              borderRadius: 20,
              padding: '44px 44px 48px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: 380,
            }}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* 3×2 icon grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 12,
                marginBottom: 36,
              }}
            >
              {FEATURE_ICONS.map(({ Icon, bg }, i) => (
                <div
                  key={i}
                  style={{
                    width: 56,
                    height: 56,
                    backgroundColor: bg,
                    borderRadius: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
                  }}
                >
                  <Icon size={26} color="#fff" />
                </div>
              ))}
            </div>

            {/* Text */}
            <div>
              <h2
                style={{
                  fontSize: 'clamp(22px, 2.4vw, 28px)',
                  fontWeight: 700,
                  color: '#ffffff',
                  letterSpacing: '-0.03em',
                  lineHeight: 1.2,
                  margin: '0 0 12px',
                }}
              >
                Gestisci prenotazioni,<br />tavoli e serate dal browser.
              </h2>
              <p
                style={{
                  fontSize: 15,
                  fontWeight: 400,
                  color: '#5a5856',
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                Tutto il tuo locale in un'unica piattaforma — dalla mappa dei tavoli ai report in tempo reale.
              </p>
            </div>
          </motion.div>

          {/* Card 2 — Overlapping circles (like iCloud+ card) */}
          <motion.div
            style={{
              backgroundColor: '#141412',
              borderRadius: 20,
              padding: '44px 44px 48px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: 380,
              overflow: 'hidden',
              position: 'relative',
            }}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.65, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Three overlapping circles graphic */}
            <div
              style={{
                position: 'relative',
                height: 148,
                marginBottom: 32,
              }}
            >
              {/* Large background circle */}
              <div
                style={{
                  position: 'absolute',
                  width: 148,
                  height: 148,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle at 35% 40%, #2a1a0e, #1a0e05)',
                  border: '1px solid #2a2420',
                  left: 0,
                  top: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {PRO_ICONS[0] && (
                  <div style={{ width: 52, height: 52, backgroundColor: PRO_ICONS[0].bg, borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <PRO_ICONS[0].Icon size={24} color="#fff" />
                  </div>
                )}
              </div>

              {/* Middle circle */}
              <div
                style={{
                  position: 'absolute',
                  width: 124,
                  height: 124,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle at 40% 40%, #12181f, #0a0f15)',
                  border: '1px solid #1e2530',
                  left: 96,
                  top: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {PRO_ICONS[1] && (
                  <div style={{ width: 44, height: 44, backgroundColor: PRO_ICONS[1].bg, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <PRO_ICONS[1].Icon size={20} color="#fff" />
                  </div>
                )}
              </div>

              {/* Smaller circle */}
              <div
                style={{
                  position: 'absolute',
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle at 40% 40%, #181210, #0f0c09)',
                  border: '1px solid #2a2218',
                  left: 184,
                  top: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {PRO_ICONS[2] && (
                  <div style={{ width: 38, height: 38, backgroundColor: PRO_ICONS[2].bg, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <PRO_ICONS[2].Icon size={17} color="#fff" />
                  </div>
                )}
              </div>
            </div>

            {/* Text */}
            <div>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#D4622A',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  margin: '0 0 10px',
                }}
              >
                Nightplan Pro
              </p>
              <h2
                style={{
                  fontSize: 'clamp(22px, 2.4vw, 28px)',
                  fontWeight: 700,
                  color: '#ffffff',
                  letterSpacing: '-0.03em',
                  lineHeight: 1.2,
                  margin: '0 0 12px',
                }}
              >
                Notifiche, sicurezza<br />e controllo avanzato.
              </h2>
              <p
                style={{
                  fontSize: 15,
                  fontWeight: 400,
                  color: '#5a5856',
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                Alert in tempo reale, permessi granulari per staff e analytics avanzate per far crescere il tuo locale.
              </p>
            </div>
          </motion.div>

        </div>

        {/* Footer */}
        <p
          style={{
            marginTop: 80,
            fontSize: 13,
            color: '#2e2c2a',
            fontWeight: 400,
            letterSpacing: '0.01em',
          }}
        >
          © 2025 Nightplan · Tutti i diritti riservati
        </p>
      </div>
    </div>
  );
}
