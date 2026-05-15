import { motion } from 'framer-motion';

export default function TypingIndicator({ theme }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: theme.spacing.sm,
        alignItems: 'flex-end',
        padding: `${theme.spacing.xs} 0`,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: theme.borderRadius.md,
          background: theme.colors.primaryLight,
          color: theme.colors.primary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.02em',
        }}
      >
        SB
      </div>
      <div
        style={{
          padding: '0.625rem 0.875rem',
          borderRadius: `${theme.borderRadius.lg} ${theme.borderRadius.lg} ${theme.borderRadius.lg} ${theme.borderRadius.xs}`,
          background: theme.colors.surface,
          border: `1px solid ${theme.colors.border}`,
          display: 'flex',
          gap: '4px',
          alignItems: 'center',
        }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: theme.colors.primary,
            }}
          />
        ))}
      </div>
    </div>
  );
}
