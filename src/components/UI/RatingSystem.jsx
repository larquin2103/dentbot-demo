import { useState } from 'react';
import { motion } from 'framer-motion';
import { useChat } from '../../contexts/ChatContext';

export default function RatingSystem({ messageId, theme }) {
  const { dispatch } = useChat();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleRate = (value) => {
    setRating(value);
    setSubmitted(true);
    dispatch({
      type: 'ADD_RATING',
      payload: { messageId, rating: value }
    });
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          fontSize: theme.typography.sizes.sm,
          color: theme.colors.success,
          padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
          textAlign: 'right'
        }}
      >
        ✅ ¡Gracias por tu valoración!
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing.sm,
        padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.textSecondary
      }}
    >
      <span>¿Fue útil?</span>
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleRate(star)}
          onMouseEnter={() => setHoveredRating(star)}
          onMouseLeave={() => setHoveredRating(0)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.2rem',
            filter: star <= (hoveredRating || rating) ? 'none' : 'grayscale(100%)',
            opacity: star <= (hoveredRating || rating) ? 1 : 0.3,
          }}
        >
          ⭐
        </motion.button>
      ))}
    </motion.div>
  );
}