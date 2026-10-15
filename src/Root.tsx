import { Composition as RemotionComposition } from "remotion"
import { Demo } from "./Composition"

export const Root = () => (
  <RemotionComposition
    id="Demo"
    component={Demo}
    durationInFrames={180} // 6 seconds @ 30fps
    fps={30}
    width={1920}
    height={1080}
    // Render-time props (script, audio) are injected via --props / --props-file
    // in .github/workflows/generate-video.yml (from data/script.json).
  />
)
