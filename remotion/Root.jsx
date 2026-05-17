import { Composition } from 'remotion'
import { PromoVideo, PROMO_DURATION, FPS } from './PromoVideo.jsx'
import { FacebookPost } from './FacebookPost.jsx'

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
      {/* Facebook 4:5 portrait — feed-optimal aspect ratio, rendered at 2x density */}
      <Composition
        id="FacebookPost45"
        component={FacebookPost}
        durationInFrames={1}
        fps={30}
        width={2160}
        height={2700}
      />
      {/* Facebook 1:1 square — universal, also fits Instagram */}
      <Composition
        id="FacebookPost11"
        component={FacebookPost}
        durationInFrames={1}
        fps={30}
        width={2160}
        height={2160}
      />
    </>
  )
}
