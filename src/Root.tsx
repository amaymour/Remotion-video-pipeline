import { Composition as RemotionComposition, staticFile } from "remotion"
import { getAudioDurationInSeconds } from "@remotion/media-utils"
import { Demo, DemoProps } from "./Composition"

const FPS = 30
const MIN_SECONDS = 8
/** Rough speaking rate (words/second) used when no audio is available. */
const WORDS_PER_SECOND = 2.5
/** Extra seconds after the narration finishes. */
const TAIL_SECONDS = 1.5

const estimateSeconds = (script: string | undefined): number => {
  const words = (script ?? "").split(/\s+/).filter(Boolean).length
  return Math.max(MIN_SECONDS, words / WORDS_PER_SECOND + TAIL_SECONDS)
}

/**
 * calculateMetadata runs in the browser at render time (and in the Studio), so
 * it can measure the real TTS voiceover and size the clip to fit it. Falls back
 * to a word-count estimate if the audio is missing or unreadable.
 */
const calculateDemoMetadata = async ({ props }: { props: DemoProps }) => {
  let seconds = estimateSeconds(props.script)
  if (props.audio) {
    try {
      const audioSeconds = await getAudioDurationInSeconds(staticFile(props.audio))
      if (Number.isFinite(audioSeconds) && audioSeconds > 1) {
        seconds = audioSeconds + TAIL_SECONDS
      }
    } catch {
      // keep the word-count estimate
    }
  }
  return { durationInFrames: Math.ceil(seconds * FPS) }
}

export const Root = () => (
  <RemotionComposition
    id="Demo"
    component={Demo}
    durationInFrames={Math.ceil(MIN_SECONDS * FPS)}
    fps={FPS}
    width={1920}
    height={1080}
    calculateMetadata={calculateDemoMetadata}
    // Render-time props (script, audio) are injected via --props=data/script.json
    // in .github/workflows/generate-video.yml. (The flag is --props, not
    // --props-file; Remotion accepts a JSON string or a path to a JSON file.)
  />
)
