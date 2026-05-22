import { motion } from 'framer-motion';

const EASE = [0.16, 1, 0.3, 1] as const;

export default function SplashScreen({ onAccedi }: { onAccedi: () => void }) {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'oklch(8% 0.004 30)',
      fontFamily: 'Inter, sans-serif',
      WebkitFontSmoothing: 'antialiased',
      position: 'relative',
      overflow: 'hidden',
      padding: '0 24px',
    }}>

      {/* Subtle dot grid */}
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

      {/* Orange accent line */}
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
        Tutto il locale in un'unica schermata.
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

    </div>
  );
}
