import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, QrCode, BarChart3, Users, DoorOpen, MapPin } from 'lucide-react';

/*
 * Mirrors iCloud.com hero:
 * - Large central logo (like the iCloud cloud)
 * - 6 coloured app-style icons orbit around it at varying radii & sizes
 * - Title, button, tagline always visible below (never gated)
 * - Everything vertically centred in 100vh — no scroll needed
 */

const ORBIT_DURATION = 16; // seconds per full revolution
const ICONS_FADE_AFTER = 8000; // ms

// Icon configs — varying sizes & radii like iCloud's Pages/Mail/Photos mix
const ICONS = [
  { Icon: BarChart3, bg: '#1db954', color: '#fff', size: 72, r: 148, startDeg: 75  },
  { Icon: Calendar,  bg: '#3b82f6', color: '#fff', size: 64, r: 136, startDeg: 148 },
  { Icon: DoorOpen,  bg: '#D4622A', color: '#fff', size: 60, r: 128, startDeg: 218 },
  { Icon: MapPin,    bg: '#06b6d4', color: '#fff', size: 52, r: 134, startDeg: 278 },
  { Icon: QrCode,    bg: '#8b5cf6', color: '#fff', size: 66, r: 144, startDeg: 335 },
  { Icon: Users,     bg: '#f59e0b', color: '#fff', size: 58, r: 136, startDeg: 25  },
];

// Orbit container side — large enough for biggest icon at max radius
// max icon half-size = 36, max r = 148 → extent = 184px from centre → 368px diameter → use 400
const ORBIT_SIDE = 400;

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
      {/* ── Logo + orbit cluster ───────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          width: ORBIT_SIDE,
          height: ORBIT_SIDE,
          flexShrink: 0,
        }}
      >
        {/* Central logo — absolutely centred in the container */}
        <motion.img
          src="/Logo.png"
          alt="Nightplan"
          style={{
            position: 'absolute',
            width: 180,
            height: 180,
            left: '50%',
            top: '50%',
            marginLeft: -90,
            marginTop: -90,
            objectFit: 'contain',
            zIndex: 10,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
        />

        {/* Orbiting icon arms — 0×0 pivots centred on the container */}
        {ICONS.map(({ Icon, bg, color, size, r, startDeg }, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 0,
              height: 0,
            }}
            initial={{ rotate: startDeg, opacity: 0 }}
            animate={
              iconsOut
                ? { opacity: 0 }
                : { rotate: startDeg + 360, opacity: 1 }
            }
            transition={
              iconsOut
                ? { opacity: { duration: 0.6, delay: i * 0.07 } }
                : {
                    rotate: { duration: ORBIT_DURATION, repeat: Infinity, ease: 'linear' },
                    opacity: { duration: 0.4, delay: 0.4 + i * 0.09 },
                  }
            }
          >
            {/* Icon counter-rotated to stay upright */}
            <motion.div
              style={{ position: 'absolute', left: r - size / 2, top: -(size / 2) }}
              initial={{ rotate: -startDeg }}
              animate={iconsOut ? {} : { rotate: -(startDeg + 360) }}
              transition={
                iconsOut
                  ? {}
                  : { duration: ORBIT_DURATION, repeat: Infinity, ease: 'linear' }
              }
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
                  boxShadow: '0 6px 28px rgba(0,0,0,0.55)',
                }}
              >
                <Icon size={Math.round(size * 0.42)} color={color} />
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* ── Static text section — always visible ─────────────────── */}
      <motion.div
        style={{ marginTop: 44, textAlign: 'center', paddingLeft: 24, paddingRight: 24 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Title — same weight as "iCloud" (~105 px on full desktop) */}
        <h1
          style={{
            fontSize: 'clamp(68px, 9vw, 104px)',
            fontWeight: 900,
            color: '#ffffff',
            letterSpacing: '-0.045em',
            lineHeight: 1,
            margin: 0,
          }}
        >
          Nightplan
        </h1>

        {/* Accedi — compact pill, always clickable */}
        <motion.button
          onClick={onAccedi}
          style={{
            marginTop: 36,
            backgroundColor: '#D4622A',
            color: '#fff',
            fontWeight: 600,
            fontSize: 15,
            paddingLeft: 52,
            paddingRight: 52,
            paddingTop: 16,
            paddingBottom: 16,
            borderRadius: 9999,
            border: 'none',
            cursor: 'pointer',
            letterSpacing: '-0.01em',
            display: 'inline-block',
          }}
          whileHover={{ scale: 1.04, backgroundColor: '#e8702f' }}
          whileTap={{ scale: 0.97 }}
        >
          Accedi
        </motion.button>

        {/* Tagline — large bold body like iCloud's ("Il luogo ideale…") */}
        <p
          style={{
            marginTop: 40,
            fontSize: 'clamp(20px, 2.6vw, 28px)',
            fontWeight: 600,
            color: '#4a4846',
            lineHeight: 1.35,
            maxWidth: 480,
            margin: '40px auto 0',
          }}
        >
          La piattaforma ideale per gestire<br />
          prenotazioni, tavoli e serate.
        </p>
      </motion.div>
    </div>
  );
}
