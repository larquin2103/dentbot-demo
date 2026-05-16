import { Composition } from 'remotion'
import { PromoVideo, PROMO_DURATION, FPS } from './PromoVideo.jsx'

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="SonrieBotPromo"
        component={PromoVideo}
        durationInFrames={PROMO_DURATION}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="SonrieBotPromoVertical"
        component={PromoVideo}
        durationInFrames={PROMO_DURATION}
        fps={FPS}
        width={1080}
        height={1920}
      />
    </>
  )
}
