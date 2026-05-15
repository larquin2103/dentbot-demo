import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function MessageBubble({ role, content, timestamp, theme }) {
  const isUser = role === 'user';
  
  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: theme.spacing.sm
    }}>
      {!isUser && (
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
      )}
      
      <div style={{ maxWidth: '70%' }}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{
            padding: theme.spacing.md,
            borderRadius: isUser 
              ? `${theme.borderRadius.lg} ${theme.borderRadius.lg} 0 ${theme.borderRadius.lg}`
              : `${theme.borderRadius.lg} ${theme.borderRadius.lg} ${theme.borderRadius.lg} 0`,
            background: isUser 
              ? theme.colors.gradient 
              : theme.colors.surface,
            color: isUser ? 'white' : theme.colors.text,
            boxShadow: theme.colors.cardShadow,
            border: isUser ? 'none' : `1px solid ${theme.colors.border}`,
            lineHeight: 1.5,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}
        >
          <div style={{ fontSize: theme.typography.sizes.base }}>
            {content}
          </div>
          {timestamp && (
            <div style={{
              fontSize: theme.typography.sizes.xs,
              color: isUser ? 'rgba(255,255,255,0.7)' : theme.colors.textLight,
              marginTop: theme.spacing.xs,
              textAlign: 'right'
            }}>
              {format(new Date(timestamp), 'HH:mm', { locale: es })}
            </div>
          )}
        </motion.div>
      </div>
      
      {isUser && (
        <div style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: theme.colors.background,
          border: `2px solid ${theme.colors.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: theme.spacing.sm,
          fontSize: '1.2rem'
        }}>
          👤
        </div>
      )}
    </div>
  );
}