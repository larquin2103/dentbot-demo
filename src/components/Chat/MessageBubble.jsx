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

      <div style={{ maxWidth: 'min(72%, calc(100% - 48px))' }}>
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
            color: isUser ? theme.colors.onPrimary : theme.colors.text,
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
