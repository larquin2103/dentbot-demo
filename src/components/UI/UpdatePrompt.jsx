import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { registerSW } from 'virtual:pwa-register'
import { useTheme } from '../../contexts/ThemeContext'

// Aviso de versión nueva. El service worker se genera con `registerType:
// 'prompt'`, así que descarga la actualización pero no la activa: recargar sola
// la página mientras alguien mira la agenda del día le cambia la pantalla
// debajo de las manos. La decisión de recargar es de quien está delante.
export default function UpdatePrompt() {
  const { theme } = useTheme()
  const [needRefresh, setNeedRefresh] = useState(false)
  // `registerSW` devuelve la función que activa el SW en espera y recarga.
  // Se guarda en una ref porque no participa en el render.
  const updateSW = useRef(null)

  useEffect(() => {
    updateSW.current = registerSW({
      // `immediate` registra al montar en vez de esperar al evento `load`, que
      // para cuando React monta ya puede haber pasado: sin esto el registro se
      // quedaría sin disparar.
      immediate: true,
      onNeedRefresh: () => setNeedRefresh(true)
    })
  }, [])

  return (
    <AnimatePresence>
      {needRefresh && (
        <motion.div
          role="status"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.25 }}
          style={{
            position: 'fixed',
            left: '50%',
            transform: 'translateX(-50%)',
            bottom: `calc(env(safe-area-inset-bottom, 0px) + ${theme.spacing.lg})`,
            // Por debajo del tour (2500) y de la bienvenida (3000): a quien
            // entra por primera vez no se le tapa el onboarding con un aviso
            // de actualización.
            zIndex: 2400,
            width: 'calc(100% - 2rem)',
            maxWidth: '420px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: theme.spacing.sm,
            padding: `${theme.spacing.md} ${theme.spacing.lg}`,
            background: theme.colors.surface,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: theme.borderRadius.xl,
            boxShadow: theme.colors.cardElevated,
            fontFamily: theme.typography.fontFamily
          }}
        >
          <span style={{
            flex: '1 1 12rem',
            fontSize: theme.typography.sizes.sm,
            color: theme.colors.text
          }}>
            Hay una versión nueva del panel.
          </span>
          <button
            onClick={() => updateSW.current?.()}
            style={{
              background: theme.colors.primary,
              color: theme.colors.onPrimary,
              border: 'none',
              borderRadius: theme.borderRadius.md,
              padding: '0.375rem 0.875rem',
              fontSize: theme.typography.sizes.sm,
              fontWeight: theme.typography.weights.semibold,
              fontFamily: 'inherit',
              cursor: 'pointer'
            }}
          >
            Actualizar
          </button>
          <button
            onClick={() => setNeedRefresh(false)}
            style={{
              background: 'transparent',
              color: theme.colors.textSecondary,
              border: `1px solid ${theme.colors.borderStrong}`,
              borderRadius: theme.borderRadius.md,
              padding: '0.375rem 0.875rem',
              fontSize: theme.typography.sizes.sm,
              fontWeight: theme.typography.weights.semibold,
              fontFamily: 'inherit',
              cursor: 'pointer'
            }}
          >
            Ahora no
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
