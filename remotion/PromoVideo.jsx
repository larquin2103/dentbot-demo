import { AbsoluteFill, Sequence, useCurrentFrame, interpolate } from 'remotion'
import { IntroScene } from './scenes/IntroScene.jsx'
import { ProblemScene } from './scenes/ProblemScene.jsx'
import { ChatScene } from './scenes/ChatScene.jsx'
import { BookingScene } from './scenes/BookingScene.jsx'
import { FeaturesScene } from './scenes/FeaturesScene.jsx'
import { CTAScene } from './scenes/CTAScene.jsx'

const FPS = 30

const sceneDurations = {
  intro: 90,
  problem: 90,
  chat: 210,
  booking: 180,
  features: 150,
  cta: 120,
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

const FadeWrap = ({ children, from, duration }) => {
  const frame = useCurrentFrame()
  const local = frame - from
  const opacity = interpolate(
    local,
    [0, OVERLAP, duration - OVERLAP, duration],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  )
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>
}

export const PromoVideo = () => {
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <Sequence from={cumulative.intro} durationInFrames={sceneDurations.intro}>
        <FadeWrap from={0} duration={sceneDurations.intro}>
          <IntroScene />
        </FadeWrap>
      </Sequence>
      <Sequence from={cumulative.problem} durationInFrames={sceneDurations.problem}>
        <FadeWrap from={0} duration={sceneDurations.problem}>
          <ProblemScene />
        </FadeWrap>
      </Sequence>
      <Sequence from={cumulative.chat} durationInFrames={sceneDurations.chat}>
        <FadeWrap from={0} duration={sceneDurations.chat}>
          <ChatScene />
        </FadeWrap>
      </Sequence>
      <Sequence from={cumulative.booking} durationInFrames={sceneDurations.booking}>
        <FadeWrap from={0} duration={sceneDurations.booking}>
          <BookingScene />
        </FadeWrap>
      </Sequence>
      <Sequence from={cumulative.features} durationInFrames={sceneDurations.features}>
        <FadeWrap from={0} duration={sceneDurations.features}>
          <FeaturesScene />
        </FadeWrap>
      </Sequence>
      <Sequence from={cumulative.cta} durationInFrames={sceneDurations.cta}>
        <FadeWrap from={0} duration={sceneDurations.cta}>
          <CTAScene />
        </FadeWrap>
      </Sequence>
    </AbsoluteFill>
  )
}

export { FPS }
