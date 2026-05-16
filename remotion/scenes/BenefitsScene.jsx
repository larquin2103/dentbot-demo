import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'
import { brand, fontFamily } from '../theme.js'

const benefits = [
  {
    metric: '+45%',
    label: 'citas confirmadas',
    detail: 'Pacientes que sí se presentan a su cita',
    color: '#10B981',
    icon: '📈',
  },
  {
    metric: '-70%',
    label: 'llamadas perdidas',
    detail: 'Tu equipo deja de perder tiempo al teléfono',
    color: '#0EA5E9',
    icon: '📞',
  },
  {
    metric: '3×',
    label: 'más conversión',
    detail: 'De visitante a paciente real en tu agenda',
    color: '#F59E0B',
    icon: '🎯',
  },
  {
    metric: '24/7',
    label: 'disponibilidad',
    detail: 'Atiende fines de semana y madrugadas',
    color: '#A855F7',
    icon: '⏰',
  },
]

export const BenefitsScene = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const titleOpacity = interpolate(frame, [0, 16], [0, 1], { extrapolateRight: 'clamp' })
  const titleY = interpolate(frame, [0, 20], [30, 0], { extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill
      style={{
        background: '#08121C',
        fontFamily,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
      }}
    >
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(circle at 30% 20%, rgba(16,185,129,0.18), transparent 50%), radial-gradient(circle at 70% 80%, rgba(14,165,233,0.18), transparent 50%)',
        }}
      />

      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          textAlign: 'center',
          marginBottom: 60,
          position: 'relative',
        }}
      >
        <div
          style={{
            fontSize: 26,
            color: '#5EEAD4',
            fontWeight: 700,
            letterSpacing: 6,
          }}
        >
          RESULTADOS REALES
        </div>
        <div
          style={{
            fontSize: 76,
            color: '#fff',
            fontWeight: 800,
            marginTop: 10,
            letterSpacing: -1.5,
            lineHeight: 1.05,
          }}
        >
          Más citas. <span style={{ color: '#5EEAD4' }}>Más ingresos.</span>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 22,
          width: 1500,
          position: 'relative',
        }}
      >
        {benefits.map((b, i) => {
          const delay = 22 + i * 14
          const scale = spring({
            frame: frame - delay,
            fps,
            config: { damping: 14, stiffness: 110 },
          })
          const opacity = interpolate(frame, [delay, delay + 14], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })
          return (
            <div
              key={i}
              style={{
                opacity,
                transform: `scale(${scale})`,
                padding: '32px 24px',
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(16px)',
                border: `1px solid ${b.color}33`,
                borderRadius: 24,
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: -40,
                  right: -40,
                  width: 140,
                  height: 140,
                  borderRadius: '50%',
                  background: `${b.color}22`,
                  filter: 'blur(20px)',
                }}
              />
              <div style={{ fontSize: 40, position: 'relative' }}>{b.icon}</div>
              <div
                style={{
                  marginTop: 12,
                  fontSize: 78,
                  fontWeight: 900,
                  color: b.color,
                  letterSpacing: -3,
                  lineHeight: 1,
                  position: 'relative',
                }}
              >
                {b.metric}
              </div>
              <div
                style={{
                  marginTop: 10,
                  fontSize: 20,
                  fontWeight: 700,
                  color: '#fff',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  position: 'relative',
                }}
              >
                {b.label}
              </div>
              <div
                style={{
                  marginTop: 10,
                  fontSize: 16,
                  color: 'rgba(255,255,255,0.6)',
                  lineHeight: 1.4,
                  position: 'relative',
                }}
              >
                {b.detail}
              </div>
            </div>
          )
        })}
      </div>
    </AbsoluteFill>
  )
}
