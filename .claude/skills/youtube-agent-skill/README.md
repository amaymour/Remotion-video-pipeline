# YouTube Agent Skill

This directory holds the prompt/brand templates used by the OmniRoute-powered
YouTube agent that writes viral scripts for the Remotion video pipeline.

Files:
- voice.md — brand rules & formatting boundaries for all narration.
- yt-viral.md — /yt-viral: isolate viral hook outliers from live_trends.csv.
- yt-script.md — /yt-script: structured script sequence with timing + SEO checks.

Usage (conceptual, run by generate_script.py on GitHub Actions):

  1. fetch_trends.py "<niche>" -> live_trends.csv
  2. Feed live_trends.csv through /yt-viral -> winning hook
  3. Feed hook through /yt-script -> final narration script
  4. edge-tts converts script -> data/voiceover.mp3
  5. Remotion renders script + audio into out/video.mp4

All model calls route through the OmniRoute gateway (OMNIROUTE_BASE_URL,
default http://localhost:20128/v1, key sk_omniroute) with a zero-cost template
fallback when the gateway is unreachable.
