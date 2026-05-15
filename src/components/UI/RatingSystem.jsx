import { useState } from 'react';
import { motion } from 'framer-motion';
import { useChat } from '../../contexts/ChatContext';

function StarIcon({ filled, color }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? color : 'none'} stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export default function RatingSystem({ messageId, theme }) {
  const { dispatch } = useChat();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleRate = (value) => {
    setRating(value);
    setSubmitted(true);
    dispatch({ type: 'ADD_RATING', payload: { messageId, rating: value } });
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          fontSize: theme.typography.sizes.xs,
          color: theme.colors.textLight,
          padding: '0.25rem 0',
          marginLeft: 'calc(32px + 0.5rem)',
        }}
      >
        Gracias por tu valoración
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.375rem',
        padding: '0.25rem 0',
        fontSize: theme.typography.sizes.xs,
        color: theme.colors.textLight,
        marginLeft: 'calc(32px + 0.5rem)',
      }}
    >
      <span>¿Fue útil?</span>
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= (hoveredRating || rating);
        return (
          <button
            key={star}
            onClick={() => handleRate(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            aria-label={`Calificar con ${star} estrella${star > 1 ? 's' : ''}`}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '2px',
              display: 'inline-flex',
            }}
          >
            <StarIcon filled={active} color={active ? theme.colors.warning : theme.colors.textLight} />
          </button>
        );
      })}
    </motion.div>
  );
}
