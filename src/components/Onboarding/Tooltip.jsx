import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { useOnboarding } from '../../contexts/OnboardingContext';

export default function Tooltip({
  id,
  text,
  title,
  placement = 'bottom',
  size = 16,
  dismissible = true,
  style
}) {
  const { theme } = useTheme();
  const { isTooltipDismissed, dismissTooltip } = useOnboarding();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const dismissed = dismissible && id ? isTooltipDismissed(id) : false;

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

  if (dismissed) return null;

  const placementStyles = {
    bottom: { top: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)' },
    top:    { bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)' },
    right:  { top: '50%', left: 'calc(100% + 8px)', transform: 'translateY(-50%)' },
    left:   { top: '50%', right: 'calc(100% + 8px)', transform: 'translateY(-50%)' }
  };

  return (
    <span
      ref={wrapperRef}
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', ...style }}
    >
      <button
        type="button"
        aria-label={title || 'Ayuda'}
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: theme.colors.primaryLight,
          color: theme.colors.primary,
          border: `1px solid ${theme.colors.primary}40`,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: Math.max(10, size - 6),
          fontWeight: 700,
          cursor: 'pointer',
          lineHeight: 1,
          padding: 0,
          fontFamily: 'inherit'
        }}
      >
        ?
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="tooltip"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              zIndex: 2000,
              minWidth: 220,
              maxWidth: 280,
              padding: '0.75rem 0.875rem',
              background: theme.colors.surface,
              color: theme.colors.text,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.borderRadius.md,
              boxShadow: theme.colors.cardElevated,
              fontSize: theme.typography.sizes.sm,
              lineHeight: 1.45,
              textAlign: 'left',
              ...placementStyles[placement]
            }}
          >
            {title && (
              <div style={{ fontWeight: 600, marginBottom: 4, color: theme.colors.text }}>
                {title}
              </div>
            )}
            <div style={{ color: theme.colors.textSecondary }}>{text}</div>
            {dismissible && id && (
              <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => { dismissTooltip(id); setOpen(false); }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: theme.colors.textLight,
                    fontSize: theme.typography.sizes.xs,
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  No volver a mostrar
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}
