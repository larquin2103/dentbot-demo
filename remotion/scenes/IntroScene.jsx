import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'
import { brand, fontFamily } from '../theme.js'

export const IntroScene = () => {
  const frame = useCurrentFrame()
  const { fps, width, height } = useVideoConfig()

  const logoScale = spring({ frame, fps, config: { damping: 12, stiffness: 110, mass: 0.8 } })
  const logoOpacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' })

  const titleY = interpolate(frame, [20, 40], [40, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const titleOpacity = interpolate(frame, [20, 40], [0, 1], { extrapolateRight: 'clamp' })

  const tagOpacity = interpolate(frame, [40, 60], [0, 1], { extrapolateRight: 'clamp' })
  const tagY = interpolate(frame, [40, 60], [20, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  const exitOpacity = interpolate(frame, [75, 90], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  const orbDrift = Math.sin(frame / 18) * 18

  return (
    <AbsoluteFill style={{ background: brand.gradientHero, fontFamily, opacity: exitOpacity }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${50 + orbDrift}% 30%, rgba(20,184,166,0.35), transparent 55%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${50 - orbDrift}% 80%, rgba(14,79,102,0.45), transparent 60%)`,
        }}
      />

      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <div
          style={{
            opacity: logoOpacity,
            transform: `scale(${logoScale})`,
            width: 180,
            height: 180,
            borderRadius: 44,
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(255,255,255,0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 30px 80px rgba(0,0,0,0.35)',
            marginBottom: 40,
          }}
        >
          <ToothMark size={104} />
        </div>

        <div
          style={{
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            fontSize: 96,
            fontWeight: 800,
            color: '#fff',
            letterSpacing: -2,
            textShadow: '0 4px 30px rgba(0,0,0,0.3)',
          }}
        >
          SonríeBot
        </div>

        <div
          style={{
            opacity: tagOpacity,
            transform: `translateY(${tagY}px)`,
            marginTop: 18,
            fontSize: 32,
            fontWeight: 500,
            color: 'rgba(255,255,255,0.85)',
            letterSpacing: 0.5,
          }}
        >
          Inteligencia artificial para tu clínica dental
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}

const ToothMark = ({ size = 100 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M7.5 3C5.5 3 4 4.5 4 7c0 2.5.7 4 1.3 6.5.6 2.4.9 7.5 2.9 7.5 1.7 0 1.6-3.5 2.3-5.5.4-1 .9-1.5 1.5-1.5s1.1.5 1.5 1.5c.7 2 .6 5.5 2.3 5.5 2 0 2.3-5.1 2.9-7.5C19.3 11 20 9.5 20 7c0-2.5-1.5-4-3.5-4C14.5 3 13.5 4 12 4s-2.5-1-4.5-1Z"
      fill="#fff"
    />
  </svg>
)
