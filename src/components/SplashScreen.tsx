import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, QrCode, BarChart3, Users, DoorOpen, MapPin } from 'lucide-react';

const ICONS = [
  { Icon: Calendar,  bg: '#0e2540', color: '#5ba3f5' },
  { Icon: QrCode,    bg: '#2b1a0e', color: '#D4622A' },
  { Icon: BarChart3, bg: '#0d2a1a', color: '#32d67a' },
  { Icon: Users,     bg: '#1e0e30', color: '#c47af5' },
  { Icon: DoorOpen,  bg: '#2b0e18', color: '#ff3a5c' },
  { Icon: MapPin,    bg: '#0e1e2a', color: '#5ac8fa' },
];

/* orbit radius: icon centres land R px from logo centre */
const R = 100;
const ORBIT_DURATION = 14; /* seconds per full revolution */
const ICONS_FADE_AFTER = 8000; /* ms before icons disappear */

export default function SplashScreen({ onAccedi }: { onAccedi: () => void }) {
  const [iconsOut, setIconsOut] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIconsOut(true), ICONS_FADE_AFTER);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center"
      style={{ backgroundColor: '#0a0908' }}
    >
      {/* ── Logo + orbit cluster (upper ~42 % of a 900 px viewport) ── */}
      <div
        className="relative flex items-center justify-center w-full"
        style={{ height: '42vh', minHeight: 320 }}
      >
        {/* Central logo */}
        <motion.img
          src="/Logo.png"
          alt="Nightplan"
          className="object-contain"
          style={{ width: 130, height: 130, position: 'relative', zIndex: 10 }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.65, ease: [0.34, 1.56, 0.64, 1] }}
        />

        {/* Orbiting arms — zero-size anchor at exact logo centre */}
        {ICONS.map(({ Icon, bg, color }, i) => {
          const startDeg = (i / ICONS.length) * 360;
          return (
            <motion.div
              key={i}
              /* zero-size div centred on the logo */
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: 0,
                height: 0,
              }}
              /* arm rotates: startDeg → startDeg + 360, repeat */
              initial={{ rotate: startDeg, opacity: 0 }}
              animate={
                iconsOut
                  ? { opacity: 0 }
                  : { rotate: startDeg + 360, opacity: 1 }
              }
              transition={
                iconsOut
                  ? { opacity: { duration: 0.5, delay: i * 0.06 } }
                  : {
                      rotate: {
                        duration: ORBIT_DURATION,
                        repeat: Infinity,
                        ease: 'linear',
                      },
                      opacity: { duration: 0.4, delay: 0.6 + i * 0.09 },
                    }
              }
            >
              {/* Icon placed at R px from arm pivot, counter-rotated to stay upright */}
              <motion.div
                style={{ position: 'absolute', left: R - 26, top: -26 }}
                initial={{ rotate: -startDeg }}
                animate={iconsOut ? {} : { rotate: -(startDeg + 360) }}
                transition={
                  iconsOut
                    ? {}
                    : {
                        duration: ORBIT_DURATION,
                        repeat: Infinity,
                        ease: 'linear',
                      }
                }
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    backgroundColor: bg,
                    borderRadius: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={22} color={color} />
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Static content — always visible, just like iCloud ── */}
      <motion.div
        className="flex flex-col items-center text-center px-6"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Title */}
        <h1
          className="font-black text-white leading-none"
          style={{ fontSize: 'clamp(52px, 8vw, 76px)', letterSpacing: '-0.04em' }}
        >
          Nightplan
        </h1>

        {/* Accedi button — always clickable */}
        <motion.button
          onClick={onAccedi}
          className="mt-8 font-semibold text-white rounded-full"
          style={{
            backgroundColor: '#D4622A',
            paddingLeft: 44,
            paddingRight: 44,
            paddingTop: 13,
            paddingBottom: 13,
            fontSize: 14,
          }}
          whileHover={{ scale: 1.04, backgroundColor: '#e8702f' }}
          whileTap={{ scale: 0.97 }}
        >
          Accedi
        </motion.button>

        {/* Tagline — large body, dim colour, like iCloud */}
        <p
          className="text-center leading-relaxed mt-10 max-w-sm"
          style={{ fontSize: 'clamp(17px, 2.2vw, 22px)', color: '#2e2c2a', fontWeight: 500, lineHeight: 1.45 }}
        >
          La piattaforma per gestire prenotazioni,<br />
          tavoli e serate in modo semplice.
        </p>
      </motion.div>
    </div>
  );
}
