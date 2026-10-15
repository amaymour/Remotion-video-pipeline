import React from "react"
import {
  Audio,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion"

export interface DemoProps {
  /** Narration script text (injected via --props in CI). */
  script?: string
  /** Voiceover file name relative to public/ (injected via --props). */
  audio?: string
}

const WORDS_PER_CAPTION = 7

/**
 * Demo — kinetic typography composition.
 *
 * Reveals the script one word at a time, shows timed caption chunks, and plays
 * an optional voiceover from public/ via Remotion's <Audio /> system. The clip
 * length is decided by calculateMetadata in Root.tsx (audio duration), so the
 * timings below adapt to whatever durationInFrames the render is given.
 */
export const Demo = (props: DemoProps) => {
  const frame = useCurrentFrame()
  const { width, height, durationInFrames, fps } = useVideoConfig()
  const script =
    props.script ||
    "Remotion cloud video pipeline — kinetic typography rendered on GitHub Actions."
  const audio = props.audio

  const words = script.split(/\s+/).filter(Boolean)
  const revealStart = Math.round(0.35 * fps)
  const tail = Math.round(0.45 * fps)
  const span = Math.max(1, durationInFrames - revealStart - tail)

  // --- Kinetic word reveal -------------------------------------------------
  const wordDuration = span / Math.max(1, words.length)
  const progress = (frame - revealStart) / wordDuration
  const activeWord = Math.min(
    words.length - 1,
    Math.max(0, Math.floor(progress)),
  )
  const local = progress - activeWord
  const fadeIn = Math.min(1, Math.max(0, local / 0.25))
  const fadeOut = 1 - Math.min(1, Math.max(0, (local - 0.8) / 0.2))
  const wordOpacity = fadeIn * fadeOut
  const wordScale = 0.85 + 0.15 * Math.min(1, Math.max(0, local / 0.25))

  // --- Timed captions ------------------------------------------------------
  const captionCount = Math.max(1, Math.ceil(words.length / WORDS_PER_CAPTION))
  const captionDuration = span / captionCount
  const activeCaption = Math.min(
    captionCount - 1,
    Math.max(0, Math.floor((frame - revealStart) / captionDuration)),
  )
  const captionText = words
    .slice(activeCaption * WORDS_PER_CAPTION, (activeCaption + 1) * WORDS_PER_CAPTION)
    .join(" ")

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
      {/* Background: soft accent shapes */}
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
          position: "absolute",
          top: 0,
          left: 0,
          width,
          height,
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            transform: `scale(${wordScale})`,
            opacity: wordOpacity,
            fontSize: 84,
            fontWeight: 900,
            letterSpacing: "-0.03em",
            color: "#ffffff",
            textAlign: "center",
            maxWidth: width - 320,
            textShadow: "0 0 28px rgba(99, 102, 241, 0.55)",
          }}
        >
          {words[activeWord]}
        </span>
      </div>

      {/* Caption card */}
      <div
        style={{
          position: "absolute",
          bottom: 120,
          left: 140,
          right: 140,
          zIndex: 1,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            background: "rgba(15, 23, 42, 0.72)",
            border: "1px solid rgba(148, 163, 184, 0.25)",
            borderRadius: 18,
            padding: "22px 36px",
            maxWidth: width - 320,
            opacity: interpolate(
              frame,
              [revealStart - 6, revealStart + 6],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            ),
          }}
        >
          <p
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: "#e2e8f0",
              lineHeight: 1.45,
              margin: 0,
              textAlign: "center",
            }}
          >
            {captionText}
          </p>
        </div>
      </div>

      {/* Voiceover / ambient background audio via Remotion <Audio /> */}
      {audio && <Audio src={staticFile(audio)} />}
    </div>
  )
}
