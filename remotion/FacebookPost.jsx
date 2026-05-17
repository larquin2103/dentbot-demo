import { AbsoluteFill } from 'remotion'
import { brand, fontFamily } from './theme.js'

// Facebook 4:5 portrait post — the highest-engagement aspect ratio in FB feed.
// Base canvas 1080x1350, rendered at 2x density via Composition (2160x2700).
//
// Hook framework used:
//   - Pattern interrupt with a SPECIFIC number (+73) that beats round numbers
//   - Loss-aversion subtext ("sin contestar una sola llamada")
//   - Time framing ("el mes pasado") that implies social proof / recency
//   - Visual proof: phone confirmation screen = "this is real, not theory"
//   - Stat bar to anchor credibility
//   - Bullets that pre-empt the top objections (lengua, costo, complejidad)

export const FacebookPost = () => {
  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(160deg, #061620 0%, #0A3A4D 38%, #0F766E 100%)',
        fontFamily,
        color: '#fff',
        padding: '90px 100px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Background glow orbs */}
      <div
        style={{
          position: 'absolute',
          top: -260,
          right: -240,
          width: 900,
          height: 900,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(20,184,166,0.5), transparent 65%)',
          filter: 'blur(20px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -220,
          left: -220,
          width: 800,
          height: 800,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(94,234,212,0.35), transparent 65%)',
          filter: 'blur(20px)',
        }}
      />

      {/* === ROW 1: Eyebrow === */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          fontSize: 28,
          fontWeight: 800,
          letterSpacing: 8,
          color: '#5EEAD4',
          textTransform: 'uppercase',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: '#10B981',
            boxShadow: '0 0 30px #10B981',
          }}
        />
        Para clínicas dentales 🇲🇽
      </div>

      {/* === ROW 2: HOOK — the scroll-stopper === */}
      <div style={{ marginTop: 30, position: 'relative' }}>
        <div
          style={{
            fontSize: 260,
            fontWeight: 900,
            letterSpacing: -12,
            lineHeight: 0.88,
            color: '#5EEAD4',
            textShadow: '0 14px 70px rgba(94,234,212,0.45)',
          }}
        >
          +73 citas
        </div>
        <div
          style={{
            fontSize: 108,
            fontWeight: 900,
            letterSpacing: -4,
            lineHeight: 1,
            color: '#fff',
            marginTop: 10,
          }}
        >
          el mes pasado.
        </div>
        <div
          style={{
            fontSize: 54,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.9)',
            marginTop: 30,
            lineHeight: 1.2,
          }}
        >
          Sin contestar{' '}
          <span style={{ color: '#FCD34D', fontWeight: 800 }}>ni una sola llamada.</span>
        </div>
      </div>

      {/* === ROW 3: STAT BAR (credibility anchor) === */}
      <div
        style={{
          marginTop: 60,
          display: 'flex',
          gap: 24,
          position: 'relative',
        }}
      >
        <Stat number="0" label="llamadas contestadas" accent="#FCD34D" />
        <Stat number="24/7" label="agenda activa" accent="#5EEAD4" />
        <Stat number="100%" label="español natural" accent="#10B981" />
      </div>

      {/* === ROW 4: Phone + bullets === */}
      <div
        style={{
          marginTop: 60,
          display: 'flex',
          alignItems: 'center',
          gap: 50,
          position: 'relative',
        }}
      >
        <PhoneCard />
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 26,
          }}
        >
          <Bullet text="Atiende en español 24/7" />
          <Bullet text="Agenda y confirma sola" />
          <Bullet text="Sin secretaria adicional" />
          <Bullet text="Setup en 10 minutos" />
        </div>
      </div>

      {/* === ROW 5: CTA + brand === */}
      <div
        style={{
          marginTop: 'auto',
          paddingTop: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
        }}
      >
        <div
          style={{
            padding: '32px 56px',
            background: '#fff',
            color: '#0A3A4D',
            borderRadius: 999,
            fontSize: 48,
            fontWeight: 900,
            letterSpacing: -0.5,
            boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
          }}
        >
          Pruébalo gratis →
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div
            style={{
              width: 82,
              height: 82,
              borderRadius: 22,
              background: 'rgba(255,255,255,0.12)',
              border: '2px solid rgba(255,255,255,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(20px)',
            }}
          >
            <ToothMark size={48} />
          </div>
          <div>
            <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: -1 }}>SonríeBot</div>
            <div
              style={{
                fontSize: 18,
                color: 'rgba(255,255,255,0.65)',
                letterSpacing: 3,
                fontWeight: 700,
              }}
            >
              SONRIEBOT.COM
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  )
}

const Stat = ({ number, label, accent }) => (
  <div
    style={{
      flex: 1,
      padding: '28px 24px',
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.12)',
      backdropFilter: 'blur(20px)',
      borderRadius: 24,
      textAlign: 'center',
    }}
  >
    <div
      style={{
        fontSize: 80,
        fontWeight: 900,
        color: accent,
        letterSpacing: -3,
        lineHeight: 1,
      }}
    >
      {number}
    </div>
    <div
      style={{
        marginTop: 8,
        fontSize: 22,
        fontWeight: 700,
        color: 'rgba(255,255,255,0.85)',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
      }}
    >
      {label}
    </div>
  </div>
)

const Bullet = ({ text }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 22,
      fontSize: 42,
      fontWeight: 700,
      color: '#fff',
    }}
  >
    <div
      style={{
        width: 56,
        height: 56,
        borderRadius: '50%',
        background: '#10B981',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 30,
        color: '#fff',
        flexShrink: 0,
        boxShadow: '0 8px 24px rgba(16,185,129,0.45)',
      }}
    >
      ✓
    </div>
    {text}
  </div>
)

const PhoneCard = () => (
  <div
    style={{
      width: 460,
      background: '#fff',
      borderRadius: 48,
      border: '14px solid #0A1620',
      boxShadow: '0 50px 100px rgba(0,0,0,0.55)',
      overflow: 'hidden',
      transform: 'rotate(-4deg)',
      flexShrink: 0,
    }}
  >
    <div
      style={{
        background: brand.gradient,
        color: '#fff',
        padding: '28px 22px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.22)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 22,
        }}
      >
        🦷
      </div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800 }}>SonríeBot</div>
        <div style={{ fontSize: 14, opacity: 0.85 }}>● En línea</div>
      </div>
    </div>
    <div style={{ padding: '40px 26px 32px', textAlign: 'center', background: '#F8FAFC' }}>
      <div
        style={{
          width: 110,
          height: 110,
          borderRadius: '50%',
          background: '#10B981',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 62,
          margin: '0 auto',
          boxShadow: '0 18px 40px rgba(16,185,129,0.45)',
        }}
      >
        ✓
      </div>
      <div style={{ fontSize: 30, fontWeight: 800, color: '#0F172A', marginTop: 16 }}>
        ¡Cita confirmada!
      </div>
      <div style={{ fontSize: 18, color: '#64748B', marginTop: 8, fontWeight: 600 }}>
        Limpieza · 17:30
      </div>
      <div
        style={{
          marginTop: 18,
          padding: '10px 18px',
          background: '#ECFDF5',
          color: '#065F46',
          borderRadius: 999,
          fontSize: 14,
          fontWeight: 900,
          letterSpacing: 2,
          display: 'inline-block',
        }}
      >
        +1 PACIENTE
      </div>
    </div>
  </div>
)

const ToothMark = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M7.5 3C5.5 3 4 4.5 4 7c0 2.5.7 4 1.3 6.5.6 2.4.9 7.5 2.9 7.5 1.7 0 1.6-3.5 2.3-5.5.4-1 .9-1.5 1.5-1.5s1.1.5 1.5 1.5c.7 2 .6 5.5 2.3 5.5 2 0 2.3-5.1 2.9-7.5C19.3 11 20 9.5 20 7c0-2.5-1.5-4-3.5-4C14.5 3 13.5 4 12 4s-2.5-1-4.5-1Z"
      fill="#fff"
    />
  </svg>
)
