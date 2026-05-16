import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'
import { brand, fontFamily } from '../theme.js'

const steps = [
  { icon: '🦷', label: 'Servicio', value: 'Limpieza dental' },
  { icon: '📅', label: 'Fecha', value: 'Lun 20 May' },
  { icon: '⏰', label: 'Hora', value: '17:30' },
  { icon: '👤', label: 'Datos', value: 'Ana Martínez' },
  { icon: '✅', label: 'Confirmado', value: 'Cita reservada' },
]

export const BookingScene = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const titleOpacity = interpolate(frame, [0, 16], [0, 1], { extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill
      style={{
        background: '#F8FAFC',
        fontFamily,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 100,
          left: 0,
          right: 0,
          textAlign: 'center',
          opacity: titleOpacity,
        }}
      >
        <div style={{ fontSize: 26, color: brand.primary, fontWeight: 700, letterSpacing: 6 }}>
          AGENDA INTELIGENTE
        </div>
        <div
          style={{
            fontSize: 64,
            color: brand.text,
            fontWeight: 800,
            marginTop: 10,
            letterSpacing: -1,
          }}
        >
          Reserva en segundos
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          marginTop: 120,
          padding: '0 80px',
        }}
      >
        {steps.map((step, i) => {
          const delay = 18 + i * 14
          const scale = spring({
            frame: frame - delay,
            fps,
            config: { damping: 12, stiffness: 130 },
          })
          const opacity = interpolate(frame, [delay, delay + 12], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })
          const isLast = i === steps.length - 1
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <div
                style={{
                  opacity,
                  transform: `scale(${scale})`,
                  width: 220,
                  background: '#fff',
                  borderRadius: 22,
                  padding: 28,
                  border: `2px solid ${isLast ? brand.success : '#E2E8F0'}`,
                  boxShadow: '0 10px 30px rgba(15,23,42,0.06)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 60 }}>{step.icon}</div>
                <div
                  style={{
                    marginTop: 10,
                    fontSize: 16,
                    color: brand.textMuted,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: 1.5,
                  }}
                >
                  {step.label}
                </div>
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 22,
                    color: isLast ? brand.success : brand.text,
                    fontWeight: 700,
                  }}
                >
                  {step.value}
                </div>
              </div>
              {i < steps.length - 1 && (
                <div
                  style={{
                    opacity: interpolate(frame, [delay + 8, delay + 18], [0, 1], {
                      extrapolateLeft: 'clamp',
                      extrapolateRight: 'clamp',
                    }),
                    fontSize: 32,
                    color: brand.primary,
                    fontWeight: 700,
                  }}
                >
                  →
                </div>
              )}
            </div>
          )
        })}
      </div>
    </AbsoluteFill>
  )
}
