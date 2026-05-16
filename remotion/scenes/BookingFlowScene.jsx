import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'
import { brand, fontFamily } from '../theme.js'

const services = [
  { icon: '🦷', name: 'Limpieza dental', price: 'Desde $450', color: '#0EA5E9' },
  { icon: '✨', name: 'Blanqueamiento', price: 'Desde $1,200', color: '#10B981' },
  { icon: '🩺', name: 'Consulta', price: 'Gratuita', color: '#0E7490' },
  { icon: '🦴', name: 'Ortodoncia', price: 'Plan a meses', color: '#F59E0B' },
]

const timeSlots = ['09:00', '10:30', '12:00', '17:00', '17:30', '18:30']

const PHONE_WIDTH = 440
const PHONE_HEIGHT = 820

export const BookingFlowScene = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const phoneScale = spring({ frame, fps, config: { damping: 14, stiffness: 100 } })

  // Three screens, each ~90 frames
  const screenIndex = frame < 95 ? 0 : frame < 190 ? 1 : 2
  const slideX = interpolate(
    frame,
    [85, 105, 180, 200],
    [0, -PHONE_WIDTH, -PHONE_WIDTH, -PHONE_WIDTH * 2],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  )

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(135deg, #0A3A4D 0%, #0E4F66 100%)',
        fontFamily,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
      }}
    >
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(circle at 20% 30%, rgba(20,184,166,0.25), transparent 50%), radial-gradient(circle at 80% 70%, rgba(15,118,110,0.3), transparent 50%)',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 80, position: 'relative' }}>
        {/* Side info panel */}
        <div style={{ width: 480 }}>
          <div
            style={{
              fontSize: 22,
              color: '#5EEAD4',
              fontWeight: 700,
              letterSpacing: 5,
            }}
          >
            FLUJO DE AGENDAMIENTO
          </div>
          <div
            style={{
              marginTop: 14,
              fontSize: 64,
              color: '#fff',
              fontWeight: 800,
              letterSpacing: -1.5,
              lineHeight: 1.05,
            }}
          >
            Tres toques
            <br />
            y la cita
            <br />
            está hecha
          </div>

          <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 18 }}>
            {[
              { label: 'Elige el servicio', step: '01' },
              { label: 'Selecciona horario', step: '02' },
              { label: 'Confirmación instantánea', step: '03' },
            ].map((s, i) => {
              const active = screenIndex === i
              const done = screenIndex > i
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 18,
                    opacity: active || done ? 1 : 0.4,
                    transition: 'opacity 0.3s',
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: done ? '#10B981' : active ? '#5EEAD4' : 'rgba(255,255,255,0.15)',
                      color: done ? '#fff' : '#0A3A4D',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: 18,
                    }}
                  >
                    {done ? '✓' : s.step}
                  </div>
                  <div style={{ fontSize: 24, color: '#fff', fontWeight: 600 }}>{s.label}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Phone */}
        <div
          style={{
            transform: `scale(${phoneScale})`,
            width: PHONE_WIDTH,
            height: PHONE_HEIGHT,
            background: '#fff',
            borderRadius: 48,
            border: '12px solid #0A1620',
            boxShadow: '0 40px 100px rgba(0,0,0,0.5)',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Top status bar */}
          <div
            style={{
              background: brand.gradient,
              padding: '26px 22px 18px',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
              }}
            >
              🦷
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>SonríeBot</div>
              <div style={{ fontSize: 12, opacity: 0.85 }}>
                {screenIndex === 0 ? 'Elige tu servicio' : screenIndex === 1 ? 'Disponibilidad' : 'Confirmación'}
              </div>
            </div>
          </div>

          {/* Carousel content */}
          <div
            style={{
              display: 'flex',
              width: PHONE_WIDTH * 3,
              height: PHONE_HEIGHT - 80,
              transform: `translateX(${slideX}px)`,
              transition: 'none',
            }}
          >
            <ServicesScreen frame={frame} />
            <SlotsScreen frame={frame} />
            <ConfirmScreen frame={frame} />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  )
}

const ServicesScreen = ({ frame }) => {
  return (
    <div
      style={{
        width: PHONE_WIDTH,
        background: '#F8FAFC',
        padding: 18,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      {services.map((s, i) => {
        const delay = 10 + i * 8
        const opacity = interpolate(frame, [delay, delay + 12], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
        const y = interpolate(frame, [delay, delay + 14], [20, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
        const selected = i === 0 && frame > 60
        return (
          <div
            key={i}
            style={{
              opacity,
              transform: `translateY(${y}px)`,
              padding: 18,
              background: '#fff',
              border: `2px solid ${selected ? brand.primary : '#E2E8F0'}`,
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              boxShadow: selected ? '0 6px 18px rgba(14,79,102,0.25)' : '0 1px 3px rgba(15,23,42,0.05)',
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: `${s.color}22`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 30,
              }}
            >
              {s.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#0F172A' }}>{s.name}</div>
              <div style={{ fontSize: 14, color: '#64748B', marginTop: 2 }}>{s.price}</div>
            </div>
            {selected && (
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background: brand.primary,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                ✓
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

const SlotsScreen = ({ frame }) => {
  // local frame after sliding in (~frame 100+)
  const local = frame - 105
  const calOpacity = interpolate(local, [0, 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const days = [
    { d: 'L', n: 19 },
    { d: 'M', n: 20, active: true },
    { d: 'M', n: 21 },
    { d: 'J', n: 22 },
    { d: 'V', n: 23 },
    { d: 'S', n: 24 },
    { d: 'D', n: 25 },
  ]

  return (
    <div
      style={{
        width: PHONE_WIDTH,
        background: '#F8FAFC',
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        opacity: calOpacity,
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: 1.5 }}>
        Mayo 2026
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
        {days.map((day, i) => (
          <div
            key={i}
            style={{
              padding: '10px 0',
              borderRadius: 12,
              background: day.active ? brand.primary : '#fff',
              color: day.active ? '#fff' : '#0F172A',
              textAlign: 'center',
              border: day.active ? 'none' : '1px solid #E2E8F0',
              boxShadow: day.active ? '0 4px 12px rgba(14,79,102,0.3)' : 'none',
            }}
          >
            <div style={{ fontSize: 11, opacity: 0.7 }}>{day.d}</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{day.n}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 14, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 4 }}>
        Horarios disponibles
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {timeSlots.map((slot, i) => {
          const delay = 14 + i * 6
          const op = interpolate(local, [delay, delay + 10], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })
          const sel = slot === '17:30' && local > 60
          return (
            <div
              key={i}
              style={{
                opacity: op,
                padding: '14px 0',
                borderRadius: 12,
                background: sel ? brand.primary : '#fff',
                color: sel ? '#fff' : '#0F172A',
                textAlign: 'center',
                fontSize: 17,
                fontWeight: 700,
                border: sel ? 'none' : '1px solid #E2E8F0',
                boxShadow: sel ? '0 6px 16px rgba(14,79,102,0.3)' : 'none',
              }}
            >
              {slot}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const ConfirmScreen = ({ frame }) => {
  const local = frame - 200
  const checkScale = spring({
    frame: Math.max(0, local),
    fps: 30,
    config: { damping: 10, stiffness: 120 },
  })
  const detailOpacity = interpolate(local, [12, 26], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  return (
    <div
      style={{
        width: PHONE_WIDTH,
        background: '#F8FAFC',
        padding: '40px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 18,
      }}
    >
      <div
        style={{
          transform: `scale(${checkScale})`,
          width: 110,
          height: 110,
          borderRadius: '50%',
          background: '#10B981',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 64,
          fontWeight: 800,
          boxShadow: '0 20px 50px rgba(16,185,129,0.4)',
        }}
      >
        ✓
      </div>

      <div style={{ fontSize: 26, fontWeight: 800, color: '#0F172A', marginTop: 6 }}>¡Cita confirmada!</div>

      <div
        style={{
          opacity: detailOpacity,
          width: '100%',
          background: '#fff',
          borderRadius: 18,
          border: '1px solid #E2E8F0',
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          boxShadow: '0 4px 14px rgba(15,23,42,0.05)',
        }}
      >
        <Row label="Servicio" value="Limpieza dental" />
        <Row label="Fecha" value="Mar 20 May · 17:30" />
        <Row label="Doctor" value="Dr. García" />
        <div style={{ height: 1, background: '#E2E8F0', margin: '4px 0' }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <Pill text="📧 Email" />
          <Pill text="📅 Calendar" />
          <Pill text="💬 WhatsApp" />
        </div>
      </div>
    </div>
  )
}

const Row = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <span style={{ fontSize: 14, color: '#64748B', fontWeight: 500 }}>{label}</span>
    <span style={{ fontSize: 15, color: '#0F172A', fontWeight: 700 }}>{value}</span>
  </div>
)

const Pill = ({ text }) => (
  <div
    style={{
      flex: 1,
      textAlign: 'center',
      padding: '8px 6px',
      borderRadius: 999,
      background: '#ECFDF5',
      color: '#065F46',
      fontSize: 12,
      fontWeight: 700,
    }}
  >
    {text}
  </div>
)
