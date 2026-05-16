import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { loadSampleData } from '../../services/sampleData';

export default function WelcomeModal() {
  const { theme } = useTheme();
  const {
    showWelcome,
    dismissWelcome,
    startTour,
    requestViewChange
  } = useOnboarding();

  const handleLoadSample = () => {
    loadSampleData();
    requestViewChange('calendar');
    dismissWelcome();
  };

  const handleStartTour = () => {
    startTour();
  };

  const handleSkip = () => {
    dismissWelcome();
  };

  return (
    <AnimatePresence>
      {showWelcome && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3000,
            padding: '1rem'
          }}
          onClick={handleSkip}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="welcome-title"
            style={{
              background: theme.colors.surface,
              borderRadius: theme.borderRadius.xl,
              boxShadow: theme.colors.cardElevated,
              maxWidth: 520,
              width: '100%',
              padding: '2rem 1.75rem 1.5rem',
              position: 'relative'
            }}
          >
            <div
              aria-hidden="true"
              style={{
                width: 56,
                height: 56,
                borderRadius: theme.borderRadius.lg,
                background: theme.colors.primaryLight,
                color: theme.colors.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.75rem',
                margin: '0 auto 0.875rem'
              }}
            >
              👋
            </div>

            <h2
              id="welcome-title"
              style={{
                margin: 0,
                textAlign: 'center',
                fontSize: theme.typography.sizes['2xl'],
                color: theme.colors.text,
                fontWeight: 600,
                letterSpacing: '-0.015em'
              }}
            >
              Te damos la bienvenida
            </h2>
            <p
              style={{
                margin: '0.5rem 0 1.5rem',
                textAlign: 'center',
                color: theme.colors.textSecondary,
                fontSize: theme.typography.sizes.base,
                lineHeight: 1.5
              }}
            >
              SonríeBot combina chat con paciente y agenda clínica.
              ¿Por dónde quieres empezar?
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              <OptionButton
                title="Hacer un tour guiado"
                description="Te muestro las zonas clave en 4 pasos rápidos."
                emoji="🧭"
                primary
                onClick={handleStartTour}
                theme={theme}
              />
              <OptionButton
                title="Cargar datos de ejemplo"
                description="Agenda llena con citas de muestra para que veas todo en marcha."
                emoji="📅"
                onClick={handleLoadSample}
                theme={theme}
              />
              <OptionButton
                title="Empezar desde cero"
                description="Sin tour ni datos: usaré el chat para crear mis primeras citas."
                emoji="✨"
                onClick={handleSkip}
                theme={theme}
              />
            </div>

            <p
              style={{
                margin: '1.25rem 0 0',
                textAlign: 'center',
                fontSize: theme.typography.sizes.xs,
                color: theme.colors.textLight
              }}
            >
              Puedes reabrir esta guía pulsando el icono <strong>?</strong> de la cabecera.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function OptionButton({ title, description, emoji, primary, onClick, theme }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.99 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.875rem',
        width: '100%',
        textAlign: 'left',
        padding: '0.875rem 1rem',
        background: primary ? theme.colors.primary : theme.colors.background,
        color: primary ? '#FFFFFF' : theme.colors.text,
        border: `1px solid ${primary ? theme.colors.primary : theme.colors.border}`,
        borderRadius: theme.borderRadius.lg,
        cursor: 'pointer',
        fontFamily: 'inherit'
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 36,
          height: 36,
          borderRadius: theme.borderRadius.md,
          background: primary ? 'rgba(255,255,255,0.18)' : theme.colors.surface,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.25rem',
          flexShrink: 0
        }}
      >
        {emoji}
      </span>
      <span style={{ minWidth: 0 }}>
        <span
          style={{
            display: 'block',
            fontWeight: 600,
            fontSize: theme.typography.sizes.base,
            lineHeight: 1.2
          }}
        >
          {title}
        </span>
        <span
          style={{
            display: 'block',
            marginTop: 2,
            fontSize: theme.typography.sizes.sm,
            color: primary ? 'rgba(255,255,255,0.85)' : theme.colors.textSecondary,
            lineHeight: 1.4
          }}
        >
          {description}
        </span>
      </span>
    </motion.button>
  );
}
