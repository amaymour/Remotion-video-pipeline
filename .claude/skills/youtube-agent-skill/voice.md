# YouTube Agent Skill — Brand Rules (voice.md)
#
# Purpose: Dictate formatting boundaries and voice for all generated YouTube
# scripts produced by the OmniRoute / yt-agent pipeline.
#
# Brand: "Cloud Video Engine" — punchy, modern, creator-first, zero-fluff.

VOICE = {
  "tone": "confident, energetic, concise",
  "audience": "creators, indie hackers, tech enthusiasts",
  "pace": "fast hooks, rapid payoff, no long intros",
}

RULES = [
  "Hook in the first 5 seconds — no 'hey guys, welcome back' openings.",
  "One idea per sentence; max 20 words per sentence.",
  "Use active voice and concrete verbs.",
  "No filler words: 'basically', 'literally', 'you know', 'um'.",
  "End with a clear, single call-to-action.",
  "Keep total script length readable in under 60 seconds at ~150 wpm.",
  "All caps reserved for on-screen emphasis only, never in narration.",
]

FORMAT_BOUNDARIES = """
- Output ONLY the narration script text (no stage directions unless bracketed [like this]).
- Do not include markdown code fences around the script.
- Do not preface with 'Here is your script:'.
- Keep SEO keywords naturally woven in, never stuffed.
"""
