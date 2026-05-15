import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

function BotAvatar({ theme }) {
  return (
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
        marginRight: theme.spacing.sm,
        flexShrink: 0,
        fontSize: '0.75rem',
        fontWeight: 700,
        letterSpacing: '0.02em',
      }}
      aria-hidden="true"
    >
      SB
    </div>
  );
}

function UserAvatar({ theme }) {
  return (
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: theme.borderRadius.md,
        background: theme.colors.surfaceMuted || theme.colors.background,
        color: theme.colors.textSecondary,
        border: `1px solid ${theme.colors.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: theme.spacing.sm,
        flexShrink: 0,
      }}
      aria-hidden="true"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </div>
  );
}

export default function MessageBubble({ role, content, timestamp, theme }) {
  const isUser = role === 'user';

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: theme.spacing.sm,
        alignItems: 'flex-end',
      }}
    >
      {!isUser && <BotAvatar theme={theme} />}

      <div style={{ maxWidth: '72%' }}>
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            padding: '0.75rem 1rem',
            borderRadius: isUser
              ? `${theme.borderRadius.lg} ${theme.borderRadius.lg} ${theme.borderRadius.xs} ${theme.borderRadius.lg}`
              : `${theme.borderRadius.lg} ${theme.borderRadius.lg} ${theme.borderRadius.lg} ${theme.borderRadius.xs}`,
            background: isUser ? theme.colors.primary : theme.colors.surface,
            color: isUser ? '#FFFFFF' : theme.colors.text,
            border: isUser ? 'none' : `1px solid ${theme.colors.border}`,
            boxShadow: isUser ? 'none' : theme.colors.cardShadow,
            lineHeight: 1.55,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            fontSize: theme.typography.sizes.base,
          }}
        >
          <div>{content}</div>
          {timestamp && (
            <div
              style={{
                fontSize: '0.6875rem',
                color: isUser ? 'rgba(255,255,255,0.75)' : theme.colors.textLight,
                marginTop: '0.375rem',
                textAlign: 'right',
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '0.02em',
              }}
            >
              {format(new Date(timestamp), 'HH:mm', { locale: es })}
            </div>
          )}
        </motion.div>
      </div>

      {isUser && <UserAvatar theme={theme} />}
    </div>
  );
}
