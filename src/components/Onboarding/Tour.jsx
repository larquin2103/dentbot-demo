import { useEffect, useLayoutEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { useOnboarding } from '../../contexts/OnboardingContext';

const TOUR_STEPS = [
  {
    target: '[data-tour="header-brand"]',
    title: 'Tu panel de clínica',
    body: 'Desde aquí gestionas la conversación con pacientes y la agenda. Todo se guarda en tu navegador.',
    requiresView: null,
    placement: 'bottom'
  },
  {
    target: '[data-tour="nav-chat"]',
    title: 'Chat con el paciente',
    body: 'El asistente atiende dudas, recomienda servicios e inicia el flujo de reserva. Puedes probarlo ahora mismo.',
    requiresView: 'chat',
    placement: 'bottom'
  },
  {
    target: '[data-tour="nav-calendar"]',
    title: 'Agenda clínica',
    body: 'Aquí ves todas las citas, la ocupación del día y puedes exportar a PDF o WhatsApp.',
    requiresView: 'calendar',
    placement: 'bottom'
  },
  {
    target: '[data-tour="calendar-stats"]',
    title: 'Resumen del día',
    body: 'Citas de hoy, esta semana e ingresos estimados de un vistazo. Si cargaste datos de ejemplo, ya verás cifras reales.',
    requiresView: 'calendar',
    placement: 'bottom'
  },
  {
    target: '[data-tour="help-button"]',
    title: 'Vuelve cuando quieras',
    body: 'Pulsa este icono para reabrir esta guía o cargar datos de ejemplo más adelante.',
    requiresView: null,
    placement: 'bottom'
  }
];

const PADDING = 8;

export default function Tour({ currentView }) {
  const { theme } = useTheme();
  const {
    tourActive,
    tourStepIndex,
    nextTourStep,
    prevTourStep,
    endTour,
    requestViewChange
  } = useOnboarding();

  const step = TOUR_STEPS[tourStepIndex];
  const isLast = tourStepIndex === TOUR_STEPS.length - 1;

  const [rect, setRect] = useState(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!tourActive || !step) return;
    if (step.requiresView && step.requiresView !== currentView) {
      requestViewChange(step.requiresView);
      setPending(true);
    } else {
      setPending(false);
    }
  }, [tourActive, step, currentView, requestViewChange]);

  useLayoutEffect(() => {
    if (!tourActive || !step || pending) {
      setRect(null);
      return;
    }

    let cancelled = false;
    let attempts = 0;

    const tick = () => {
      if (cancelled) return;
      const el = document.querySelector(step.target);
      if (el) {
        const r = el.getBoundingClientRect();
        setRect({
          top: r.top,
          left: r.left,
          width: r.width,
          height: r.height
        });
        try {
          el.scrollIntoView({ block: 'center', behavior: 'smooth' });
        } catch {
          // ignore
        }
      } else if (attempts < 20) {
        attempts += 1;
        setTimeout(tick, 50);
      } else {
        setRect(null);
      }
    };
    tick();

    const onResize = () => {
      const el = document.querySelector(step.target);
      if (el) {
        const r = el.getBoundingClientRect();
        setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
      }
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);
    return () => {
      cancelled = true;
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
    };
  }, [tourActive, step, pending, tourStepIndex]);

  const popoverPos = useMemo(() => {
    if (!rect) return null;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const popW = Math.min(340, vw - 24);
    const popH = 180;
    const placement = step?.placement || 'bottom';

    let top, left;
    if (placement === 'bottom') {
      top = rect.top + rect.height + PADDING + 6;
      left = rect.left + rect.width / 2 - popW / 2;
    } else if (placement === 'top') {
      top = rect.top - popH - PADDING - 6;
      left = rect.left + rect.width / 2 - popW / 2;
    } else if (placement === 'right') {
      top = rect.top + rect.height / 2 - popH / 2;
      left = rect.left + rect.width + PADDING + 6;
    } else {
      top = rect.top + rect.height / 2 - popH / 2;
      left = rect.left - popW - PADDING - 6;
    }

    // Clamp into viewport
    left = Math.max(12, Math.min(left, vw - popW - 12));
    top = Math.max(12, Math.min(top, vh - popH - 12));
    return { top, left, width: popW };
  }, [rect, step]);

  if (!tourActive || !step) return null;

  const handleNext = () => {
    if (isLast) {
      endTour(true);
    } else {
      nextTourStep();
    }
  };

  const overlay = (
    <motion.div
      key="tour-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2500,
        pointerEvents: 'auto'
      }}
    >
      {/* Spotlight via SVG mask */}
      <svg
        width="100%"
        height="100%"
        style={{ position: 'absolute', inset: 0, pointerEvents: 'auto' }}
        onClick={() => endTour(false)}
      >
        <defs>
          <mask id="tour-mask">
            <rect width="100%" height="100%" fill="white" />
            {rect && (
              <rect
                x={Math.max(0, rect.left - PADDING)}
                y={Math.max(0, rect.top - PADDING)}
                width={rect.width + PADDING * 2}
                height={rect.height + PADDING * 2}
                rx="10"
                ry="10"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(15, 23, 42, 0.6)"
          mask="url(#tour-mask)"
        />
      </svg>

      {/* Highlight ring */}
      {rect && (
        <div
          style={{
            position: 'fixed',
            top: rect.top - PADDING,
            left: rect.left - PADDING,
            width: rect.width + PADDING * 2,
            height: rect.height + PADDING * 2,
            borderRadius: 12,
            border: `2px solid ${theme.colors.primary}`,
            boxShadow: `0 0 0 4px ${theme.colors.primary}40`,
            pointerEvents: 'none',
            transition: 'all 0.25s ease'
          }}
        />
      )}

      {/* Popover */}
      {popoverPos && (
        <motion.div
          key={`tour-pop-${tourStepIndex}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-modal="false"
          aria-labelledby="tour-title"
          style={{
            position: 'fixed',
            top: popoverPos.top,
            left: popoverPos.left,
            width: popoverPos.width,
            background: theme.colors.surface,
            borderRadius: theme.borderRadius.lg,
            border: `1px solid ${theme.colors.border}`,
            boxShadow: theme.colors.cardElevated,
            padding: '1rem 1rem 0.75rem',
            zIndex: 2600
          }}
        >
          <div
            style={{
              fontSize: theme.typography.sizes.xs,
              color: theme.colors.textLight,
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              marginBottom: 6
            }}
          >
            Paso {tourStepIndex + 1} de {TOUR_STEPS.length}
          </div>
          <h3
            id="tour-title"
            style={{
              margin: 0,
              fontSize: theme.typography.sizes.lg,
              color: theme.colors.text,
              fontWeight: 600,
              letterSpacing: '-0.01em'
            }}
          >
            {step.title}
          </h3>
          <p
            style={{
              margin: '0.4rem 0 0.9rem',
              fontSize: theme.typography.sizes.sm,
              color: theme.colors.textSecondary,
              lineHeight: 1.5
            }}
          >
            {step.body}
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem'
            }}
          >
            <button
              type="button"
              onClick={() => endTour(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: theme.colors.textLight,
                fontSize: theme.typography.sizes.sm,
                cursor: 'pointer',
                padding: '0.25rem 0.25rem',
                fontFamily: 'inherit'
              }}
            >
              Saltar
            </button>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {tourStepIndex > 0 && (
                <button
                  type="button"
                  onClick={prevTourStep}
                  style={{
                    background: theme.colors.background,
                    color: theme.colors.text,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: theme.borderRadius.md,
                    padding: '0.4rem 0.75rem',
                    fontSize: theme.typography.sizes.sm,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontWeight: 500
                  }}
                >
                  Atrás
                </button>
              )}
              <button
                type="button"
                onClick={handleNext}
                style={{
                  background: theme.colors.primary,
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: theme.borderRadius.md,
                  padding: '0.4rem 0.9rem',
                  fontSize: theme.typography.sizes.sm,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit'
                }}
              >
                {isLast ? 'Listo' : 'Siguiente'}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );

  return createPortal(<AnimatePresence>{overlay}</AnimatePresence>, document.body);
}
