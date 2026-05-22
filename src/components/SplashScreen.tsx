import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, QrCode, BarChart3, Users, DoorOpen, MapPin } from 'lucide-react';

/*
 * Replicates iCloud.com hero exactly:
 *   - Compact organic icon cluster (NOT a circular orbit)
 *   - Each icon floats independently (gentle y-bob, like iCloud app icons)
 *   - Icons at scattered positions / varying sizes around central logo
 *   - Massive bold title dominates (iCloud "iCloud" ≈ 100+ px)
 *   - Small "Accedi" pill below title
 *   - Large bold tagline below button
 *   - Everything always visible — nothing gated behind animation
 *   - After 8 s icons fade, logo stays clean (exactly like iCloud)
 */

// Organic scattered positions (px from logo centre) — mirrors iCloud's loose layout
// iCloud: Pages large top-left, Calendar top-right, Mail small bottom-left, Photos bottom-centre…
const ICONS = [
  { Icon: BarChart3, bg: '#1db954', color: '#fff', size: 68, x: -118, y: -100, floatAmp: 10, floatDur: 3.2 },
  { Icon: Calendar,  bg: '#3b82f6', color: '#fff', size: 60, x:   85, y: -110, floatAmp:  8, floatDur: 2.9 },
  { Icon: DoorOpen,  bg: '#D4622A', color: '#fff', size: 56, x: -130, y:   10, floatAmp: 12, floatDur: 3.6 },
  { Icon: MapPin,    bg: '#06b6d4', color: '#fff', size: 50, x:  108, y:   18, floatAmp:  7, floatDur: 3.1 },
  { Icon: QrCode,    bg: '#8b5cf6', color: '#fff', size: 62, x:  -60, y:  108, floatAmp: 11, floatDur: 3.4 },
  { Icon: Users,     bg: '#f59e0b', color: '#fff', size: 54, x:   78, y:  100, floatAmp:  9, floatDur: 2.8 },
];

const ICONS_FADE_AFTER = 8000;

export default function SplashScreen({ onAccedi }: { onAccedi: () => void }) {
  const [iconsOut, setIconsOut] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIconsOut(true), ICONS_FADE_AFTER);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0a0908',
        overflow: 'hidden',
      }}
    >
      {/* ── Icon cluster — compact, organic, like iCloud ────────── */}
      {/*
       * Zero-size anchor div at the visual centre.
       * Each icon is absolutely positioned at its (x, y) offset,
       * then animates only on the Y axis (float bob).
       */}
      <div style={{ position: 'relative', width: 0, height: 0 }}>

        {/* Central logo — circle bg like iCloud Memoji circle */}
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

        {/* App-style icons — scattered, each floats independently */}
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
              /* Entry: pop in from centre */
              initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
              animate={{
                opacity: 1,
                scale: 1,
                x: 0,
                /* Float: bob up and down around resting position */
                y: [0, -floatAmp, 0, floatAmp, 0],
              }}
              exit={{ opacity: 0, scale: 0.4, transition: { duration: 0.4, delay: i * 0.06 } }}
              transition={{
                opacity: { duration: 0.4, delay: 0.3 + i * 0.08 },
                scale:   { duration: 0.4, ease: [0.34, 1.56, 0.64, 1], delay: 0.3 + i * 0.08 },
                y: {
                  duration: floatDur,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.35,
                },
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

      {/* ── Text section — always visible, iCloud proportions ────── */}
      <motion.div
        style={{
          marginTop: 160, /* pushes below the tallest icons (y≈108+54/2≈135) */
          textAlign: 'center',
          paddingLeft: 24,
          paddingRight: 24,
        }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Massive title — like "iCloud" on icloud.com */}
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

        {/* Accedi pill — like iCloud's black "Accedi" */}
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

        {/* Tagline — large bold body, like iCloud's "Il luogo ideale…" */}
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
    </div>
  );
}
