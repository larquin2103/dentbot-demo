import { motion } from 'framer-motion';

export default function QuickResponses({ responses, onAction, theme }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: theme.spacing.sm,
        padding: theme.spacing.sm,
        justifyContent: 'center'
      }}
    >
      {responses.map((response) => (
        <motion.button
          key={response.id}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onAction(response.action)}
          style={{
            padding: `${theme.spacing.sm} ${theme.spacing.md}`,
            background: theme.colors.surface,
            color: theme.colors.text,
            border: `2px solid ${theme.colors.border}`,
            borderRadius: theme.borderRadius.xl,
            cursor: 'pointer',
            fontSize: theme.typography.sizes.sm,
            fontWeight: 500,
            transition: 'all 0.2s',
            boxShadow: theme.colors.cardShadow
          }}
        >
          {response.text}
        </motion.button>
      ))}
    </motion.div>
  );
}