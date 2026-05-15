import { motion } from 'framer-motion';

export default function QuickResponses({ responses, onAction, theme }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.3 }}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: theme.spacing.sm,
        padding: `${theme.spacing.sm} 0`,
        justifyContent: 'flex-start',
        marginLeft: 'calc(32px + 0.5rem)',
      }}
    >
      {responses.map((response) => (
        <motion.button
          key={response.id}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onAction(response.action)}
          style={{
            padding: '0.5rem 0.875rem',
            background: theme.colors.surface,
            color: theme.colors.text,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: theme.borderRadius.full,
            cursor: 'pointer',
            fontSize: theme.typography.sizes.sm,
            fontWeight: 500,
            transition: 'border-color 0.15s ease, background 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = theme.colors.primary;
            e.currentTarget.style.background = theme.colors.primaryLight;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = theme.colors.border;
            e.currentTarget.style.background = theme.colors.surface;
          }}
        >
          {response.text}
        </motion.button>
      ))}
    </motion.div>
  );
}
