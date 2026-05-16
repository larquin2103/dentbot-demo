import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { loadSampleData, clearSampleData, hasSampleData } from '../../services/sampleData';

export default function HelpButton() {
  const { theme } = useTheme();
  const { reopenWelcome, startTour, requestViewChange } = useOnboarding();
  const [open, setOpen] = useState(false);
  const [sampleLoaded, setSampleLoaded] = useState(hasSampleData);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  const handleLoadSample = () => {
    loadSampleData();
    setSampleLoaded(true);
    requestViewChange('calendar');
    setOpen(false);
  };

  const handleClearSample = () => {
    clearSampleData();
    setSampleLoaded(false);
    setOpen(false);
  };

  const handleTour = () => {
    setOpen(false);
    startTour();
  };

  const handleWelcome = () => {
    setOpen(false);
    reopenWelcome();
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <motion.button
        data-tour="help-button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(o => !o)}
        aria-label="Ayuda y onboarding"
        aria-expanded={open}
        style={{
          background: theme.colors.surface,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: theme.borderRadius.md,
          padding: '0.5rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: theme.colors.textSecondary,
          flexShrink: 0,
          width: 34,
          height: 34,
          fontFamily: 'inherit'
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            role="menu"
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              right: 0,
              minWidth: 240,
              background: theme.colors.surface,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.borderRadius.md,
              boxShadow: theme.colors.cardElevated,
              padding: '0.375rem',
              zIndex: 1500
            }}
          >
            <MenuItem onClick={handleTour} theme={theme} icon="🧭" label="Hacer tour guiado" />
            {sampleLoaded ? (
              <MenuItem
                onClick={handleClearSample}
                theme={theme}
                icon="🧹"
                label="Quitar datos de ejemplo"
                description="Borra las citas demo y deja solo las reales"
              />
            ) : (
              <MenuItem
                onClick={handleLoadSample}
                theme={theme}
                icon="📅"
                label="Cargar datos de ejemplo"
                description="Llena la agenda con citas demo de esta semana"
              />
            )}
            <MenuItem
              onClick={handleWelcome}
              theme={theme}
              icon="👋"
              label="Ver pantalla de bienvenida"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuItem({ onClick, theme, icon, label, description }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.625rem',
        width: '100%',
        textAlign: 'left',
        padding: '0.5rem 0.625rem',
        background: 'transparent',
        border: 'none',
        borderRadius: theme.borderRadius.sm,
        cursor: 'pointer',
        color: theme.colors.text,
        fontSize: theme.typography.sizes.sm,
        fontFamily: 'inherit'
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = theme.colors.surfaceHover; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
    >
      <span aria-hidden="true" style={{ fontSize: '1rem', lineHeight: 1.2 }}>{icon}</span>
      <span style={{ minWidth: 0 }}>
        <span style={{ display: 'block', fontWeight: 500 }}>{label}</span>
        {description && (
          <span
            style={{
              display: 'block',
              marginTop: 2,
              fontSize: theme.typography.sizes.xs,
              color: theme.colors.textSecondary,
              lineHeight: 1.35
            }}
          >
            {description}
          </span>
        )}
      </span>
    </button>
  );
}
