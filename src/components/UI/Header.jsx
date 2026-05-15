import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

export default function Header({ view, onViewChange }) {
  const { isDark, toggleTheme, theme } = useTheme();

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      style={{
        background: theme.colors.surface,
        borderBottom: `1px solid ${theme.colors.border}`,
        padding: `${theme.spacing.sm} ${theme.spacing.xl}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: theme.colors.cardShadow,
        zIndex: 1000
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ fontSize: '2rem' }}
        >
          🦷
        </motion.div>
        <div>
          <h1 style={{
            margin: 0,
            fontSize: theme.typography.sizes.xl,
            color: theme.colors.text,
            fontWeight: 700
          }}>
            SonríeBot
          </h1>
          <p style={{
            margin: 0,
            fontSize: theme.typography.sizes.xs,
            color: theme.colors.textSecondary
          }}>
            Clínica Dental Sonrisa Perfecta
          </p>
        </div>
      </div>

      <nav style={{ display: 'flex', gap: theme.spacing.sm }}>
        <button
          onClick={() => onViewChange('chat')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing.xs,
            padding: `${theme.spacing.sm} ${theme.spacing.md}`,
            background: view === 'chat' ? theme.colors.primary : theme.colors.background,
            color: view === 'chat' ? 'white' : theme.colors.text,
            border: `1px solid ${view === 'chat' ? theme.colors.primary : theme.colors.border}`,
            borderRadius: theme.borderRadius.lg,
            cursor: 'pointer',
            fontSize: theme.typography.sizes.sm,
            fontWeight: view === 'chat' ? 600 : 400,
          }}
        >
          💬 Chat
        </button>
        <button
          onClick={() => onViewChange('calendar')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing.xs,
            padding: `${theme.spacing.sm} ${theme.spacing.md}`,
            background: view === 'calendar' ? theme.colors.primary : theme.colors.background,
            color: view === 'calendar' ? 'white' : theme.colors.text,
            border: `1px solid ${view === 'calendar' ? theme.colors.primary : theme.colors.border}`,
            borderRadius: theme.borderRadius.lg,
            cursor: 'pointer',
            fontSize: theme.typography.sizes.sm,
            fontWeight: view === 'calendar' ? 600 : 400,
          }}
        >
          📅 Calendario
        </button>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleTheme}
          style={{
            background: theme.colors.background,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: theme.borderRadius.lg,
            padding: theme.spacing.sm,
            cursor: 'pointer',
            fontSize: '1.5rem',
          }}
        >
          {isDark ? '☀️' : '🌙'}
        </motion.button>
      </nav>
    </motion.header>
  );
}