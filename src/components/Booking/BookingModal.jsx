import { useState } from 'react';
import { motion } from 'framer-motion';

const SERVICES = [
  { id: 'consulta', name: 'Primera consulta', price: 'Gratuita', duration: '30 min', icon: '🦷' },
  { id: 'limpieza', name: 'Limpieza dental', price: '60€', duration: '30 min', icon: '✨' },
  { id: 'blanqueamiento', name: 'Blanqueamiento', price: 'Desde 150€', duration: '90 min', icon: '😁' },
  { id: 'ortodoncia', name: 'Ortodoncia invisible', price: 'Consulta previa gratis', duration: '30 min', icon: '🦷' },
  { id: 'implante', name: 'Implante dental', price: 'Desde 1.200€', duration: '90 min', icon: '🔩' },
  { id: 'urgencia', name: 'Urgencia dental', price: '90€', duration: '30 min', icon: '⚡' }
];

export default function BookingModal({ onClose, theme }) {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => onClose(), 3000);
  };

  if (submitted) {
    return (
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '20px'
      }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{
            background: theme.colors.surface,
            borderRadius: theme.borderRadius.xl,
            padding: theme.spacing['2xl'],
            maxWidth: '500px',
            textAlign: 'center',
            boxShadow: theme.colors.cardHover
          }}
        >
          <div style={{ fontSize: '4rem', marginBottom: theme.spacing.lg }}>🎉</div>
          <h2 style={{ color: theme.colors.text, marginBottom: theme.spacing.md }}>
            ¡Cita Confirmada!
          </h2>
          <p style={{ color: theme.colors.textSecondary }}>
            Te hemos enviado un email con los detalles.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px'
    }} onClick={onClose}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: theme.colors.surface,
          borderRadius: theme.borderRadius.xl,
          padding: theme.spacing.xl,
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: theme.colors.cardHover
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: theme.spacing.lg
        }}>
          <h2 style={{ color: theme.colors.text, margin: 0 }}>
            📅 Agendar Cita
          </h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none',
            fontSize: '1.5rem', cursor: 'pointer',
            color: theme.colors.text
          }}>✕</button>
        </div>

        {step === 1 && (
          <div>
            <h3 style={{ color: theme.colors.text, marginBottom: theme.spacing.md }}>
              Selecciona el servicio
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
              {SERVICES.map((service) => (
                <motion.button
                  key={service.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedService(service);
                    setStep(2);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: theme.spacing.md,
                    padding: theme.spacing.md,
                    background: theme.colors.background,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: theme.borderRadius.md,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <span style={{ fontSize: '2rem' }}>{service.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: theme.colors.text }}>
                      {service.name}
                    </div>
                    <div style={{ fontSize: theme.typography.sizes.sm, color: theme.colors.textSecondary }}>
                      {service.duration} • {service.price}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit}>
            <button
              type="button"
              onClick={() => setStep(1)}
              style={{
                background: 'none', border: 'none',
                color: theme.colors.primary, cursor: 'pointer',
                marginBottom: theme.spacing.md
              }}
            >
              ← Volver
            </button>
            
            <h3 style={{ color: theme.colors.text, marginBottom: theme.spacing.md }}>
              Datos de la cita
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
              <div>
                <label style={{ display: 'block', marginBottom: theme.spacing.xs, color: theme.colors.text }}>
                  Nombre completo *
                </label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  style={{
                    width: '100%', padding: theme.spacing.md,
                    borderRadius: theme.borderRadius.md,
                    border: `1px solid ${theme.colors.border}`,
                    background: theme.colors.background,
                    color: theme.colors.text
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: theme.spacing.xs, color: theme.colors.text }}>
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  style={{
                    width: '100%', padding: theme.spacing.md,
                    borderRadius: theme.borderRadius.md,
                    border: `1px solid ${theme.colors.border}`,
                    background: theme.colors.background,
                    color: theme.colors.text
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: theme.spacing.xs, color: theme.colors.text }}>
                  Teléfono *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  style={{
                    width: '100%', padding: theme.spacing.md,
                    borderRadius: theme.borderRadius.md,
                    border: `1px solid ${theme.colors.border}`,
                    background: theme.colors.background,
                    color: theme.colors.text
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: theme.spacing.xs, color: theme.colors.text }}>
                  Fecha *
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  style={{
                    width: '100%', padding: theme.spacing.md,
                    borderRadius: theme.borderRadius.md,
                    border: `1px solid ${theme.colors.border}`,
                    background: theme.colors.background,
                    color: theme.colors.text
                  }}
                />
              </div>
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                width: '100%',
                padding: theme.spacing.md,
                marginTop: theme.spacing.lg,
                background: theme.colors.gradient,
                color: 'white',
                border: 'none',
                borderRadius: theme.borderRadius.lg,
                fontSize: theme.typography.sizes.lg,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Confirmar Cita →
            </motion.button>
          </form>
        )}
      </motion.div>
    </div>
  );
}