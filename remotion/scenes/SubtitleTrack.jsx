import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion'
import { fontFamily } from '../theme.js'

export const SubtitleTrack = ({ cues, position = 'bottom' }) => {
  const frame = useCurrentFrame()
  const active = cues.find((c) => frame >= c.from && frame < c.to)
  if (!active) return null

  const local = frame - active.from
  const total = active.to - active.from
  const opacity = interpolate(
    local,
    [0, 6, total - 6, total],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  )
  const lift = interpolate(local, [0, 10], [12, 0], { extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill
      style={{
        fontFamily,
        pointerEvents: 'none',
        justifyContent: position === 'bottom' ? 'flex-end' : 'flex-start',
        alignItems: 'center',
        padding: position === 'bottom' ? '0 0 80px' : '80px 0 0',
      }}
    >
      <div
        style={{
          opacity,
          transform: `translateY(${lift}px)`,
          maxWidth: 1500,
          padding: '20px 36px',
          background: 'rgba(8, 18, 28, 0.78)',
          backdropFilter: 'blur(14px)',
          borderRadius: 18,
          border: '1px solid rgba(255,255,255,0.08)',
          color: '#fff',
          fontSize: 38,
          fontWeight: 600,
          letterSpacing: -0.3,
          lineHeight: 1.25,
          textAlign: 'center',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        }}
      >
        {active.text}
      </div>
    </AbsoluteFill>
  )
}
