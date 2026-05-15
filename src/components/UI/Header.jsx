import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

function LogoMark({ color }) {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M10.4 4C7.6 4 5.2 6.1 5.2 9.2c0 2.4.5 4.3 1.2 7.4.7 3.2 1 5.6 1.6 8.6.3 1.7 1.1 2.8 2.4 2.8 1.5 0 2-1.2 2.6-3.2.5-1.8 1-3.6 3-3.6s2.5 1.8 3 3.6c.6 2 1.1 3.2 2.6 3.2 1.3 0 2.1-1.1 2.4-2.8.6-3 .9-5.4 1.6-8.6.7-3.1 1.2-5 1.2-7.4 0-3.1-2.4-5.2-5.2-5.2-2.1 0-3.7.9-5.6.9s-3.5-.9-5.6-.9z"
        fill={color}
      />
    </svg>
  );
}

function ChatIcon({ color }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function CalendarIcon({ color }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function SunIcon({ color }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon({ color }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function Header({ view, onViewChange }) {
  const { isDark, toggleTheme, theme } = useTheme();

  const navButton = (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0.875rem',
    background: active ? theme.colors.primary : 'transparent',
    color: active ? '#FFFFFF' : theme.colors.textSecondary,
    border: 'none',
    borderRadius: theme.borderRadius.md,
    cursor: 'pointer',
    fontSize: theme.typography.sizes.sm,
    fontWeight: active ? 600 : 500,
    transition: 'all 0.15s ease',
  });

  return (
    <motion.header
      className="app-header"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.25 }}
      style={{
        background: theme.colors.surface,
        borderBottom: `1px solid ${theme.colors.border}`,
        padding: '0.875rem 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '0.75rem',
        zIndex: 1000,
      }}
    >
      <div className="app-header__brand" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flex: '1 1 auto' }}>
        <div
          className="app-header__logo"
          style={{
            width: 40,
            height: 40,
            borderRadius: theme.borderRadius.md,
            background: theme.colors.primaryLight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <LogoMark color={theme.colors.primary} />
        </div>
        <div style={{ minWidth: 0 }}>
          <h1
            className="app-header__title"
            style={{
              margin: 0,
              fontSize: theme.typography.sizes.lg,
              color: theme.colors.text,
              fontWeight: 600,
              letterSpacing: '-0.015em',
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            Clínica Dental Sonrisa Perfecta
          </h1>
          <p
            className="app-header__subtitle"
            style={{
              margin: 0,
              fontSize: theme.typography.sizes.xs,
              color: theme.colors.textSecondary,
              fontWeight: 500,
              letterSpacing: '0.02em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            Panel de atención y agenda clínica
          </p>
        </div>
      </div>

      <nav className="app-header__nav" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
        <div
          className="app-header__tabs"
          style={{
            display: 'flex',
            gap: 2,
            padding: 3,
            background: theme.colors.surfaceMuted || theme.colors.background,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: theme.borderRadius.md,
          }}
        >
          <button onClick={() => onViewChange('chat')} style={navButton(view === 'chat')} aria-label="Conversación">
            <ChatIcon color={view === 'chat' ? '#FFFFFF' : theme.colors.textSecondary} />
            <span className="app-header__tab-label">Chat</span>
          </button>
          <button onClick={() => onViewChange('calendar')} style={navButton(view === 'calendar')} aria-label="Agenda">
            <CalendarIcon color={view === 'calendar' ? '#FFFFFF' : theme.colors.textSecondary} />
            <span className="app-header__tab-label">Agenda</span>
          </button>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
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
          }}
        >
          {isDark ? <SunIcon color={theme.colors.textSecondary} /> : <MoonIcon color={theme.colors.textSecondary} />}
        </motion.button>
      </nav>
    </motion.header>
  );
}
