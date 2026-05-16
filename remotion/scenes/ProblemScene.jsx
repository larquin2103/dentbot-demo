import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'
import { brand, fontFamily } from '../theme.js'

export const ProblemScene = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const headlineY = interpolate(frame, [0, 20], [40, 0], { extrapolateRight: 'clamp' })
  const headlineOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' })

  const stats = [
    { value: '40%', label: 'llamadas sin contestar' },
    { value: '24/7', label: 'horario sin cubrir' },
    { value: '30%', label: 'citas perdidas' },
  ]

  return (
    <AbsoluteFill
      style={{
        background: '#0B1E2A',
        fontFamily,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          opacity: headlineOpacity,
          transform: `translateY(${headlineY}px)`,
          fontSize: 78,
          fontWeight: 800,
          color: '#fff',
          letterSpacing: -1.5,
          textAlign: 'center',
          maxWidth: 1400,
          lineHeight: 1.1,
        }}
      >
        Tu clínica pierde pacientes
        <br />
        <span style={{ color: '#F87171' }}>mientras duerme.</span>
      </div>

      <div style={{ display: 'flex', gap: 36, marginTop: 80 }}>
        {stats.map((stat, i) => {
          const delay = 25 + i * 10
          const cardScale = spring({
            frame: frame - delay,
            fps,
            config: { damping: 14, stiffness: 120 },
          })
          const cardOpacity = interpolate(frame, [delay, delay + 12], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })
          return (
            <div
              key={i}
              style={{
                opacity: cardOpacity,
                transform: `scale(${cardScale})`,
                width: 320,
                padding: '40px 32px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 24,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 86, fontWeight: 800, color: '#F87171', letterSpacing: -2 }}>
                {stat.value}
              </div>
              <div
                style={{
                  marginTop: 12,
                  fontSize: 22,
                  color: 'rgba(255,255,255,0.75)',
                  fontWeight: 500,
                }}
              >
                {stat.label}
              </div>
            </div>
          )
        })}
      </div>
    </AbsoluteFill>
  )
}
