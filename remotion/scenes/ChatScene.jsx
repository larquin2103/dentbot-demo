import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'
import { brand, fontFamily } from '../theme.js'

const messages = [
  { from: 'user', text: 'Hola, me duele una muela 😣', at: 0 },
  { from: 'bot', text: '¡Hola! Lo siento. ¿Quieres una cita urgente para hoy?', at: 25 },
  { from: 'user', text: 'Sí por favor, ¿qué tenéis disponible?', at: 60 },
  { from: 'bot', text: 'Tengo hueco a las 17:30 con Dr. García ✨', at: 90 },
  { from: 'user', text: 'Perfecto, lo confirmo', at: 130 },
  { from: 'bot', text: '✅ Cita reservada. Te envío el recordatorio al email.', at: 160 },
]

export const ChatScene = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const phoneScale = spring({ frame, fps, config: { damping: 14, stiffness: 90 } })
  const titleOpacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill
      style={{
        background: brand.gradient,
        fontFamily,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        padding: '40px 0',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          opacity: titleOpacity,
          marginBottom: 24,
        }}
      >
        <div style={{ fontSize: 24, color: 'rgba(255,255,255,0.7)', fontWeight: 600, letterSpacing: 6 }}>
          ATIENDE 24/7
        </div>
        <div
          style={{
            fontSize: 56,
            color: '#fff',
            fontWeight: 800,
            marginTop: 6,
            letterSpacing: -1,
          }}
        >
          Conversa como un humano
        </div>
      </div>

      <div
        style={{
          transform: `scale(${phoneScale})`,
          width: 460,
          height: 820,
          background: '#fff',
          borderRadius: 56,
          border: '14px solid #0A1620',
          boxShadow: '0 40px 100px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            background: brand.gradient,
            padding: '36px 28px 24px',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 26,
            }}
          >
            🦷
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>SonríeBot</div>
            <div style={{ fontSize: 14, opacity: 0.85, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#10B981',
                  display: 'inline-block',
                }}
              />
              En línea
            </div>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            background: '#F8FAFC',
            padding: 22,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            overflow: 'hidden',
          }}
        >
          {messages.map((m, i) => {
            const localFrame = frame - m.at
            if (localFrame < 0) return null
            const opacity = interpolate(localFrame, [0, 10], [0, 1], { extrapolateRight: 'clamp' })
            const y = interpolate(localFrame, [0, 12], [16, 0], { extrapolateRight: 'clamp' })
            const isUser = m.from === 'user'
            return (
              <div
                key={i}
                style={{
                  opacity,
                  transform: `translateY(${y}px)`,
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                  maxWidth: '78%',
                  padding: '12px 16px',
                  borderRadius: 18,
                  background: isUser ? brand.primary : '#fff',
                  color: isUser ? '#fff' : '#0F172A',
                  fontSize: 18,
                  lineHeight: 1.35,
                  border: isUser ? 'none' : '1px solid #E2E8F0',
                  boxShadow: isUser ? 'none' : '0 1px 2px rgba(15,23,42,0.04)',
                  borderBottomRightRadius: isUser ? 6 : 18,
                  borderBottomLeftRadius: isUser ? 18 : 6,
                }}
              >
                {m.text}
              </div>
            )
          })}
        </div>
      </div>
    </AbsoluteFill>
  )
}
