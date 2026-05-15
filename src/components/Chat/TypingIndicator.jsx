import { motion } from 'framer-motion';

export default function TypingIndicator({ theme }) {
  return (
    <div style={{
      display: 'flex',
      gap: theme.spacing.sm,
      alignItems: 'center',
      padding: theme.spacing.sm
    }}>
      <div style={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        background: theme.colors.gradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.sm,
        fontSize: '1.2rem'
      }}>
        🦷
      </div>
      <div style={{
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.lg,
        background: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        display: 'flex',
        gap: '4px'
      }}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -5, 0]
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.2
            }}
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: theme.colors.primary
            }}
          />
        ))}
      </div>
    </div>
  );
}