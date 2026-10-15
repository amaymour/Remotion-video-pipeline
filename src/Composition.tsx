import React from "react"
import {
  Audio,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion"

interface Props {
  /** Narration script text (injected via --props-file in CI). */
  script?: string
  /** Path to voiceover audio (injected via --props-file in CI). */
  audio?: string
}

/**
 * Demo — kinetic typography composition.
 *
 * Renders the script as popping kinetic words, with auto-wrapped subtitles and
 * an optional voiceover background track via Remotion's <Audio /> system.
 * Uses standard HTML elements (Remotion v4 does not ship a <Text> primitive).
 */
export const Demo = (props: Props) => {
  const frame = useCurrentFrame()
  const { width, height } = useVideoConfig()
  const script = props.script || "Remotion cloud video pipeline — kinetic typography rendered on GitHub Actions."
  const audio = props.audio

  const words = script.split(/\s+/)
  const wordDuration = 10 // frames per word
  const revealStart = 20 // frames before the first word appears

  return (
    <div
      style={{
        width,
        height,
        background: "#0b0f19",
        color: "#ffffff",
        overflow: "hidden",
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      {/* Background: soft accent shapes (no layout shift) */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width,
          height,
          zIndex: 0,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-12%",
            left: "-8%",
            width: 700,
            height: 700,
            background: "rgba(99, 102, 241, 0.07)",
            borderRadius: "50%",
            filter: "blur(70px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-10%",
            right: "-12%",
            width: 600,
            height: 600,
            background: "rgba(168, 85, 247, 0.06)",
            borderRadius: "50%",
            filter: "blur(60px)",
          }}
        />
      </div>

      {/* Kinetic typography layer */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {words.map((word, i) => {
          const start = revealStart + i * wordDuration
          // Fade in + scale pop over 6 frames
          const opacity = interpolate(frame, [start, start + 6], [0, 1])
          const scale = interpolate(frame, [start, start + 6], [0.7, 1])

          return (
            <span
              key={i}
              style={{
                position: "absolute",
                top: "42%",
                left: "50%",
                transform: `translate(-50%, -50%) scale(${scale})`,
                opacity,
                fontSize: 60,
                fontWeight: 900,
                whiteSpace: "nowrap",
                letterSpacing: "-0.03em",
                color: "#ffffff",
                textShadow: "0 0 28px rgba(99, 102, 241, 0.55)",
              }}
            >
              {word}
            </span>
          )
        })}
      </div>

      {/* Auto-wrapped subtitles / captions layer */}
      <div
        style={{
          position: "absolute",
          bottom: 140,
          left: 140,
          right: 140,
          zIndex: 1,
          maxWidth: width - 280,
        }}
      >
        <p
          style={{
            fontSize: 30,
            fontWeight: 700,
            color: "#e2e8f0",
            lineHeight: 1.5,
            margin: 0,
            textShadow: "0 0 16px rgba(0, 0, 0, 0.7)",
          }}
        >
          {script}
        </p>
      </div>

      {/* Voiceover / ambient background audio via Remotion <Audio /> */}
      {audio && <Audio src={audio} />}
    </div>
  )
}
