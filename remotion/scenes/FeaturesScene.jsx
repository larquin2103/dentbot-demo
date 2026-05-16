import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'
import { brand, fontFamily } from '../theme.js'

const features = [
  {
    icon: '🤖',
    title: 'IA Conversacional',
    desc: 'Modelos Claude, GPT-4 y Llama con fallback automático',
  },
  {
    icon: '📅',
    title: 'Google Calendar',
    desc: 'Sincroniza las citas con la agenda de tu clínica',
  },
  {
    icon: '📄',
    title: 'Reportes PDF',
    desc: 'Resumen del día listo para WhatsApp y email',
  },
  {
    icon: '🌗',
    title: 'Tema claro & oscuro',
    desc: 'Diseño profesional adaptado a tu marca',
  },
]

export const FeaturesScene = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const titleOpacity = interpolate(frame, [0, 16], [0, 1], { extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill
      style={{
        background: brand.background,
        fontFamily,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
      }}
    >
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(circle at 80% 20%, rgba(15,118,110,0.35), transparent 50%), radial-gradient(circle at 20% 80%, rgba(14,79,102,0.4), transparent 50%)',
        }}
      />
      <div
        style={{
          opacity: titleOpacity,
          textAlign: 'center',
          marginBottom: 70,
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
          TODO INCLUIDO
        </div>
        <div
          style={{
            fontSize: 70,
            color: '#fff',
            fontWeight: 800,
            marginTop: 10,
            letterSpacing: -1.5,
          }}
        >
          Una solución completa
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 28,
          width: 1200,
          position: 'relative',
        }}
      >
        {features.map((f, i) => {
          const delay = 20 + i * 10
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
                padding: 36,
                background: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 24,
                display: 'flex',
                gap: 24,
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: 20,
                  background: brand.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 48,
                  flexShrink: 0,
                  boxShadow: '0 10px 30px rgba(15,118,110,0.4)',
                }}
              >
                {f.icon}
              </div>
              <div>
                <div style={{ fontSize: 30, fontWeight: 700, color: '#fff' }}>{f.title}</div>
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 20,
                    color: 'rgba(255,255,255,0.7)',
                    lineHeight: 1.4,
                  }}
                >
                  {f.desc}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </AbsoluteFill>
  )
}
