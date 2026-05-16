import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'
import { brand, fontFamily } from '../theme.js'

export const CTAScene = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const titleScale = spring({ frame, fps, config: { damping: 14, stiffness: 110 } })
  const titleOpacity = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: 'clamp' })

  const subOpacity = interpolate(frame, [18, 32], [0, 1], { extrapolateRight: 'clamp' })
  const subY = interpolate(frame, [18, 32], [20, 0], { extrapolateRight: 'clamp' })

  const btnScale = spring({
    frame: frame - 38,
    fps,
    config: { damping: 12, stiffness: 130 },
  })
  const btnOpacity = interpolate(frame, [38, 52], [0, 1], { extrapolateRight: 'clamp' })

  const pulse = 1 + Math.sin(frame / 6) * 0.025

  return (
    <AbsoluteFill
      style={{
        background: brand.gradientHero,
        fontFamily,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
      }}
    >
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(94,234,212,0.25), transparent 60%)',
        }}
      />

      <div
        style={{
          opacity: titleOpacity,
          transform: `scale(${titleScale})`,
          fontSize: 110,
          fontWeight: 900,
          color: '#fff',
          letterSpacing: -3,
          textAlign: 'center',
          lineHeight: 1,
          textShadow: '0 6px 40px rgba(0,0,0,0.3)',
        }}
      >
        Empieza hoy
      </div>

      <div
        style={{
          opacity: subOpacity,
          transform: `translateY(${subY}px)`,
          marginTop: 30,
          fontSize: 32,
          color: 'rgba(255,255,255,0.88)',
          fontWeight: 500,
          textAlign: 'center',
          maxWidth: 1200,
        }}
      >
        Convierte cada visita a tu web en una cita confirmada.
      </div>

      <div
        style={{
          opacity: btnOpacity,
          transform: `scale(${btnScale * pulse})`,
          marginTop: 56,
          padding: '24px 56px',
          background: '#fff',
          color: brand.primaryDark,
          borderRadius: 999,
          fontSize: 32,
          fontWeight: 800,
          letterSpacing: 0.5,
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        }}
      >
        Prueba SonríeBot →
      </div>

      <div
        style={{
          opacity: btnOpacity,
          marginTop: 28,
          fontSize: 20,
          color: 'rgba(255,255,255,0.7)',
          letterSpacing: 4,
          fontWeight: 600,
        }}
      >
        SONRIEBOT.COM
      </div>
    </AbsoluteFill>
  )
}
