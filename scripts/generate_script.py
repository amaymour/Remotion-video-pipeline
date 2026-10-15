#!/usr/bin/env python3
"""
generate_script.py
------------------
Zero-cost script + voiceover generator for the Remotion video pipeline.

Runs on GitHub Actions (headless Ubuntu runner). Steps:
  1. Read live_trends.csv (produced by fetch_trends.py).
  2. Try the OmniRoute gateway at OMNIROUTE_BASE_URL
     (default http://localhost:20128/v1, key sk_omniroute) to run the
     /yt-viral + /yt-script skill logic and produce a narration script.
  3. If the gateway is unreachable (expected on github-hosted runners unless a
     tunnel is exposed), fall back to a pure-Python template script — no API
     key, no paid service, 100% free.
  4. Write data/script.json (script text + audio path) for Remotion render.
  5. Generate public/voiceover.mp3 via edge-tts (Microsoft Edge TTS, free).

Environment:
  OMNIROUTE_BASE_URL  base context of the OmniRoute gateway (default http://localhost:20128/v1)
  OMNIROUTE_API_KEY   bearer token (default sk_omniroute)
  NICHE               niche keyword (default "Tech Tools")

Usage:
    python scripts/generate_script.py
"""

import csv
import json
import os
import subprocess
import sys
import urllib.error
import urllib.request

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
PUBLIC_DIR = os.path.join(BASE_DIR, "public")
SCRIPT_JSON = os.path.join(DATA_DIR, "script.json")
TRENDS_CSV = os.path.join(BASE_DIR, "live_trends.csv")
# Remotion only web-serves the public/ directory, so the voiceover must live
# there (referenced as staticFile("voiceover.mp3")) to be picked up in the render.
VOICEOVER_MP3 = os.path.join(PUBLIC_DIR, "voiceover.mp3")

OMNIROUTE_BASE = os.environ.get("OMNIROUTE_BASE_URL", "http://localhost:20128/v1")
if OMNIROUTE_BASE.endswith("/"):
    OMNIROUTE_BASE = OMNIROUTE_BASE.rstrip("/")
# Normalize to end in /v1 (chat/completions lives under /v1)
if not OMNIROUTE_BASE.endswith("/v1"):
    OMNIROUTE_BASE = OMNIROUTE_BASE + "/v1"
OMNIROUTE_KEY = os.environ.get("OMNIROUTE_API_KEY", "sk_omniroute")
NICHE = os.environ.get("NICHE", "Tech Tools")


def read_trends() -> list[dict]:
    if not os.path.exists(TRENDS_CSV):
        return []
    rows = []
    with open(TRENDS_CSV, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            rows.append(row)
    return rows


def trends_to_text(rows: list[dict]) -> str:
    lines = [f"Niche: {NICHE}", "Live trends:"]
    for r in rows[:10]:
        lines.append(f"- {r.get('title','')} ({r.get('source','')})")
    return "\n".join(lines)


def call_omniroute(system_prompt: str, user_prompt: str, model: str = "auto") -> str | None:
    """POST to OmniRoute chat/completions. Return content or None on failure."""
    url = OMNIROUTE_BASE + "/chat/completions"
    body = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": 0.7,
        "max_tokens": 600,
    }
    data = json.dumps(body).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {OMNIROUTE_KEY}",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            payload = json.loads(resp.read().decode("utf-8"))
        return payload["choices"][0]["message"]["content"].strip()
    except Exception as exc:  # noqa: BLE001 — any failure means fallback
        print(f"generate_script: OmniRoute unreachable ({exc}); using template fallback")
        return None


def template_script(rows: list[dict]) -> str:
    """Pure-Python fallback script following voice.md brand rules."""
    top = rows[0]["title"] if rows else "today's top story"
    return f"""[{NICHE}] The story everyone is talking about: {top}.

Most people miss the real signal beneath the noise. They chase every headline
and finish none of them.

Here is the move: pick one insight from {NICHE}, act on it today, ignore the
rest. That is how you turn information into results.

Try it this week. Subscribe for more {NICHE} breakdowns."""


def generate_script(rows: list[dict]) -> str:
    trends_text = trends_to_text(rows)

    system_prompt = (
        "You are a YouTube scriptwriter. Follow these brand rules exactly: "
        "confident, energetic, concise tone; hook in the first 5 seconds; "
        "one idea per sentence, max 20 words; active voice; no filler words; "
        "end with one clear call-to-action; output ONLY the narration script, "
        "no markdown fences, no 'here is your script' preface."
    )
    user_prompt = (
        f"Write a 45-60 second YouTube narration script for the niche '{NICHE}'.\n\n"
        f"{trends_text}\n\n"
        "Structure:\n"
        "[0:00-0:05] HOOK\n"
        "[0:05-0:20] PROBLEM\n"
        "[0:20-0:40] SOLUTION\n"
        "[0:40-0:55] CTA\n\n"
        "Weave the keyword naturally. Max 3 keyword mentions. Plain text only."
    )

    ai_script = call_omniroute(system_prompt, user_prompt)
    if ai_script:
        print("generate_script: script written via OmniRoute")
        return ai_script

    print("generate_script: using template fallback script")
    return template_script(rows)


def generate_voiceover(script: str) -> None:
    """Render script to public/voiceover.mp3 using edge-tts (free, headless)."""
    os.makedirs(PUBLIC_DIR, exist_ok=True)
    try:
        import edge_tts  # type: ignore
        import asyncio

        async def _run() -> None:
            communicate = edge_tts.Communicate(script, voice="en-US-AriaNeural")
            await communicate.save(VOICEOVER_MP3)

        asyncio.run(_run())
        print(f"generate_script: voiceover -> {VOICEOVER_MP3}")
    except ImportError:
        # edge-tts not installed: create a silent placeholder mp3 so Remotion
        # render still works; real audio is produced when edge-tts is present.
        print("generate_script: edge-tts not installed; writing silent placeholder audio")
        subprocess.run(
            [
                "ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo",
                "-t", "60", "-c:a", "libmp3lame", "-q:a", "4", VOICEOVER_MP3,
            ],
            check=False,
            capture_output=True,
        )


def main() -> int:
    os.makedirs(DATA_DIR, exist_ok=True)
    rows = read_trends()
    script = generate_script(rows)
    generate_voiceover(script)

    payload = {
        "niche": NICHE,
        "script": script,
        "audio": "voiceover.mp3",
        "trends_count": len(rows),
    }
    with open(SCRIPT_JSON, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)

    print(f"generate_script: {len(rows)} trends -> data/script.json ({len(script)} chars)")
    print(script[:400])
    return 0


if __name__ == "__main__":
    sys.exit(main())
