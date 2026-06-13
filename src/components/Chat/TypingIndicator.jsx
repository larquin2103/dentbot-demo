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
          flexShrink: 0,
        }}
        aria-hidden="true"
      >
        <svg width="18" height="18" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M10.4 4C7.6 4 5.2 6.1 5.2 9.2c0 2.4.5 4.3 1.2 7.4.7 3.2 1 5.6 1.6 8.6.3 1.7 1.1 2.8 2.4 2.8 1.5 0 2-1.2 2.6-3.2.5-1.8 1-3.6 3-3.6s2.5 1.8 3 3.6c.6 2 1.1 3.2 2.6 3.2 1.3 0 2.1-1.1 2.4-2.8.6-3 .9-5.4 1.6-8.6.7-3.1 1.2-5 1.2-7.4 0-3.1-2.4-5.2-5.2-5.2-2.1 0-3.7.9-5.6.9s-3.5-.9-5.6-.9z"
            fill="currentColor"
          />
        </svg>
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
