import { AbsoluteFill, Sequence, useCurrentFrame, interpolate } from 'remotion'
import { IntroScene } from './scenes/IntroScene.jsx'
import { ProblemScene } from './scenes/ProblemScene.jsx'
import { ChatScene } from './scenes/ChatScene.jsx'
import { BookingFlowScene } from './scenes/BookingFlowScene.jsx'
import { BookingScene } from './scenes/BookingScene.jsx'
import { BenefitsScene } from './scenes/BenefitsScene.jsx'
import { FeaturesScene } from './scenes/FeaturesScene.jsx'
import { CTAScene } from './scenes/CTAScene.jsx'
import { SubtitleTrack } from './scenes/SubtitleTrack.jsx'

const FPS = 30

const sceneDurations = {
  intro: 120,
  problem: 180,
  chat: 240,
  bookingFlow: 285,
  booking: 195,
  benefits: 240,
  features: 210,
  cta: 195,
}

const OVERLAP = 12

const cumulative = (() => {
  const keys = Object.keys(sceneDurations)
  let acc = 0
  const out = {}
  keys.forEach((k, i) => {
    out[k] = acc
    acc += sceneDurations[k] - (i < keys.length - 1 ? OVERLAP : 0)
  })
  out.__total = acc
  return out
})()

export const PROMO_DURATION = cumulative.__total

const subtitleCues = {
  intro: [{ from: 18, to: 110, text: 'SonríeBot · Tu asistente dental con inteligencia artificial' }],
  problem: [
    { from: 12, to: 90, text: 'Cada llamada perdida es un paciente perdido' },
    { from: 96, to: 175, text: '4 de cada 10 personas te contactan fuera de horario' },
  ],
  chat: [
    { from: 14, to: 110, text: 'Atiende en español, las 24 horas' },
    { from: 116, to: 230, text: 'Entiende la consulta, sugiere la cita y la confirma al instante' },
  ],
  bookingFlow: [
    { from: 14, to: 95, text: 'El paciente elige el servicio que necesita…' },
    { from: 105, to: 195, text: '…selecciona el horario disponible que prefiere…' },
    { from: 205, to: 275, text: '…y recibe su confirmación al instante' },
  ],
  booking: [{ from: 14, to: 185, text: 'Todo el proceso en 5 pasos · Sin formularios eternos' }],
  benefits: [
    { from: 18, to: 120, text: 'Más citas confirmadas. Menos llamadas perdidas.' },
    { from: 128, to: 230, text: 'Hasta 3× más conversión de visita web a paciente real' },
  ],
  features: [{ from: 14, to: 200, text: 'IA, Google Calendar, reportes PDF y diseño profesional · Todo incluido' }],
  cta: [
    { from: 16, to: 105, text: 'Empieza hoy y convierte cada visita en una cita' },
    { from: 112, to: 185, text: 'Prueba SonríeBot en tu clínica' },
  ],
}

const FadeWrap = ({ children, duration }) => {
  const frame = useCurrentFrame()
  const opacity = interpolate(
    frame,
    [0, OVERLAP, duration - OVERLAP, duration],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  )
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>
}

const SceneSlot = ({ from, duration, Scene, cues }) => (
  <Sequence from={from} durationInFrames={duration}>
    <FadeWrap duration={duration}>
      <Scene />
      <SubtitleTrack cues={cues} />
    </FadeWrap>
  </Sequence>
)

export const PromoVideo = () => {
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <SceneSlot from={cumulative.intro} duration={sceneDurations.intro} Scene={IntroScene} cues={subtitleCues.intro} />
      <SceneSlot from={cumulative.problem} duration={sceneDurations.problem} Scene={ProblemScene} cues={subtitleCues.problem} />
      <SceneSlot from={cumulative.chat} duration={sceneDurations.chat} Scene={ChatScene} cues={subtitleCues.chat} />
      <SceneSlot from={cumulative.bookingFlow} duration={sceneDurations.bookingFlow} Scene={BookingFlowScene} cues={subtitleCues.bookingFlow} />
      <SceneSlot from={cumulative.booking} duration={sceneDurations.booking} Scene={BookingScene} cues={subtitleCues.booking} />
      <SceneSlot from={cumulative.benefits} duration={sceneDurations.benefits} Scene={BenefitsScene} cues={subtitleCues.benefits} />
      <SceneSlot from={cumulative.features} duration={sceneDurations.features} Scene={FeaturesScene} cues={subtitleCues.features} />
      <SceneSlot from={cumulative.cta} duration={sceneDurations.cta} Scene={CTAScene} cues={subtitleCues.cta} />
    </AbsoluteFill>
  )
}

export { FPS }
