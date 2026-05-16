import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import {
  BOOKABLE_SERVICES,
  getNextAvailableDates,
  getAvailableSlotsForDate,
  formatDateLabel
} from '../../services/scheduling';

const AVATAR_OFFSET = 'calc(32px + 0.5rem)';

function WidgetWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.25 }}
      style={{
        marginLeft: AVATAR_OFFSET,
        marginTop: '0.5rem',
        maxWidth: `calc(100% - ${AVATAR_OFFSET})`,
      }}
    >
      {children}
    </motion.div>
  );
}

export function ServicePicker({ onSelect, theme }) {
  return (
    <WidgetWrapper>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '0.5rem',
        }}
      >
        {BOOKABLE_SERVICES.map((s) => (
          <motion.button
            key={s.id}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(s)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              padding: '0.625rem 0.75rem',
              background: theme.colors.surface,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.borderRadius.md,
              cursor: 'pointer',
              textAlign: 'left',
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
            <span style={{ fontSize: '1.5rem', lineHeight: 1, flexShrink: 0 }}>{s.emoji}</span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, color: theme.colors.text, fontSize: theme.typography.sizes.sm }}>
                {s.name}
              </div>
              <div style={{ color: theme.colors.textSecondary, fontSize: theme.typography.sizes.xs }}>
                {s.price} · {s.duration}
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </WidgetWrapper>
  );
}

export function DatePicker({ onSelect, theme }) {
  const dates = getNextAvailableDates(10);
  return (
    <WidgetWrapper>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
        {dates.map((d) => {
          const value = format(d, 'yyyy-MM-dd');
          const label = formatDateLabel(d);
          return (
            <motion.button
              key={value}
              whileTap={{ scale: 0.96 }}
              onClick={() => onSelect(value, label)}
              style={{
                padding: '0.5rem 0.75rem',
                background: theme.colors.surface,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.borderRadius.md,
                cursor: 'pointer',
                fontSize: theme.typography.sizes.sm,
                fontWeight: 500,
                color: theme.colors.text,
                textTransform: 'capitalize',
                whiteSpace: 'nowrap',
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
              {label}
            </motion.button>
          );
        })}
      </div>
    </WidgetWrapper>
  );
}

export function TimePicker({ date, onSelect, theme }) {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const slots = getAvailableSlotsForDate(dateObj);

  if (slots.length === 0) {
    return (
      <WidgetWrapper>
        <div
          style={{
            padding: '0.625rem 0.75rem',
            background: theme.colors.warningLight,
            color: theme.colors.warning,
            border: `1px solid ${theme.colors.warning}40`,
            borderRadius: theme.borderRadius.md,
            fontSize: theme.typography.sizes.sm,
            fontWeight: 500,
          }}
        >
          No quedan huecos para ese día. Elige otra fecha, por favor.
        </div>
      </WidgetWrapper>
    );
  }

  return (
    <WidgetWrapper>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))',
          gap: '0.375rem',
        }}
      >
        {slots.map((slot) => (
          <motion.button
            key={slot}
            whileTap={{ scale: 0.94 }}
            onClick={() => onSelect(slot)}
            style={{
              padding: '0.5rem 0',
              background: theme.colors.surface,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.borderRadius.md,
              cursor: 'pointer',
              fontSize: theme.typography.sizes.sm,
              fontWeight: 600,
              color: theme.colors.text,
              fontVariantNumeric: 'tabular-nums',
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
            {slot}
          </motion.button>
        ))}
      </div>
    </WidgetWrapper>
  );
}

export default function BookingWidget({ widget, theme, onAction }) {
  if (!widget) return null;
  switch (widget.type) {
    case 'service-picker':
      return (
        <ServicePicker
          theme={theme}
          onSelect={(service) =>
            onAction('service', service, `${service.emoji} ${service.name}`)
          }
        />
      );
    case 'date-picker':
      return (
        <DatePicker
          theme={theme}
          onSelect={(value, label) => onAction('date', value, label)}
        />
      );
    case 'time-picker':
      return (
        <TimePicker
          date={widget.date}
          theme={theme}
          onSelect={(slot) => onAction('time', slot, slot)}
        />
      );
    default:
      return null;
  }
}
