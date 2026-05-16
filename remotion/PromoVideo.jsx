import { AbsoluteFill, Sequence, Audio, useCurrentFrame, interpolate } from 'remotion'
import { IntroScene } from './scenes/IntroScene.jsx'
import { ProblemScene } from './scenes/ProblemScene.jsx'
import { ChatScene } from './scenes/ChatScene.jsx'
import { BookingScene } from './scenes/BookingScene.jsx'
import { FeaturesScene } from './scenes/FeaturesScene.jsx'
import { CTAScene } from './scenes/CTAScene.jsx'

import introVO from './audio/01-intro.wav'
import problemVO from './audio/02-problem.wav'
import chatVO from './audio/03-chat.wav'
import bookingVO from './audio/04-booking.wav'
import featuresVO from './audio/05-features.wav'
import ctaVO from './audio/06-cta.wav'

const FPS = 30

const sceneDurations = {
  intro: 144,
  problem: 207,
  chat: 252,
  booking: 204,
  features: 264,
  cta: 210,
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
        <Audio src={introVO} volume={1} />
      </Sequence>
      <Sequence from={cumulative.problem} durationInFrames={sceneDurations.problem}>
        <FadeWrap from={0} duration={sceneDurations.problem}>
          <ProblemScene />
        </FadeWrap>
        <Audio src={problemVO} volume={1} />
      </Sequence>
      <Sequence from={cumulative.chat} durationInFrames={sceneDurations.chat}>
        <FadeWrap from={0} duration={sceneDurations.chat}>
          <ChatScene />
        </FadeWrap>
        <Audio src={chatVO} volume={1} />
      </Sequence>
      <Sequence from={cumulative.booking} durationInFrames={sceneDurations.booking}>
        <FadeWrap from={0} duration={sceneDurations.booking}>
          <BookingScene />
        </FadeWrap>
        <Audio src={bookingVO} volume={1} />
      </Sequence>
      <Sequence from={cumulative.features} durationInFrames={sceneDurations.features}>
        <FadeWrap from={0} duration={sceneDurations.features}>
          <FeaturesScene />
        </FadeWrap>
        <Audio src={featuresVO} volume={1} />
      </Sequence>
      <Sequence from={cumulative.cta} durationInFrames={sceneDurations.cta}>
        <FadeWrap from={0} duration={sceneDurations.cta}>
          <CTAScene />
        </FadeWrap>
        <Audio src={ctaVO} volume={1} />
      </Sequence>
    </AbsoluteFill>
  )
}

export { FPS }
