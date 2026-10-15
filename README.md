# remotion-video-pipeline

Zero-cost, cloud-based automated video generation pipeline.

- **Dashboard:** `index.html` — dark Tailwind control panel. Pick a niche, click **🚀 Initialize Cloud Video Engine**, which fires a GitHub `repository_dispatch` (`trigger-video-generation`) with `{"event_type": "trigger-video-generation", "client_payload": {"niche": "..."}}`.
- **Trends:** `fetch_trends.py` harvests public Google News RSS (no API key) into `live_trends.csv`.
- **Script + voiceover:** `scripts/generate_script.py` routes through the local **OmniRoute gateway** (`http://localhost:20128/v1`, key `sk_omniroute`) with a zero-cost template fallback, then renders `public/voiceover.mp3` via **edge-tts** (served to Remotion via `staticFile`, and used to size the clip length).
- **Render:** `src/Root.tsx` + `src/Composition.tsx` build a kinetic-typography Remotion composition (`<Audio />` for voiceover/ambience) and compile `out/video.mp4`.
- **CI:** `.github/workflows/generate-video.yml` runs the whole pipeline on headless GitHub Actions Ubuntu runners and uploads `video` artifact.
- **Pages:** `.github/workflows/deploy-pages.yml` hosts the dashboard on GitHub Pages.

## Repo structure

```
index.html                 # web dashboard (Tailwind, vanilla JS)
fetch_trends.py            # public trends -> live_trends.csv
scripts/generate_script.py # OmniRoute script + edge-tts voiceover
src/index.ts               # Remotion entry (registerRoot)
src/Root.tsx               # <Composition> config
src/Composition.tsx        # kinetic typography + <Audio />
.claude/skills/youtube-agent-skill/
  voice.md                 # brand rules
  yt-viral.md              # /yt-viral hook template
  yt-script.md             # /yt-script template + SEO checks
.github/workflows/
  generate-video.yml       # repository_dispatch pipeline
  deploy-pages.yml         # GitHub Pages deploy
```

## Local setup

```bash
cd remotion-video-pipeline
npm ci
npm run typecheck        # tsc --noEmit
npm run dev              # remotion preview (local)
```

Render locally (CI is the production render target):

```bash
npm run build -- --props=data/script.json
```

> Remotion 4.0.535 renders frames through a headless browser and then encodes the
> MP4 with its bundled ffmpeg. It downloads and uses its own pinned **Chrome
> Headless Shell** (not the runner's system Chrome), so no system browser setup
> is needed. GitHub Actions `ubuntu-latest` is the production render target.
>
> Input props are passed with `--props=<path-to-json>` (a JSON string or path to
> a JSON file). There is no `--props-file` flag. `calculateMetadata` sizes the
> clip from the real TTS audio duration, so the narration always fits.

## Repository

Live at **https://github.com/amaymour/Remotion-video-pipeline** (account `amaymour`).

- **Dashboard:** https://amaymour.github.io/Remotion-video-pipeline/
- **Run the pipeline:** pick a niche on the dashboard (paste a Classic PAT with
  `repo` scope), or `gh workflow run generate-video.yml -f niche="Tech Tools"`.
- **Output:** each run uploads a `video` artifact (h264 1080p + AAC voiceover).

GitHub Pages is configured with `build_type: workflow`; `deploy-pages.yml`
publishes `index.html` on every push to `main`.

## Dashboard → CI wiring

1. In `index.html`, set `REPO_OWNER` and `REPO_NAME` to your new account/repo.
2. Paste a GitHub Classic PAT with `repo` scope into the token field (it is **never stored** — read only at dispatch time).
3. Click **🚀 Initialize Cloud Video Engine** → `repository_dispatch` → `generate-video.yml` runs on GitHub Actions. The workflow renders with `--props=data/script.json` so the generated script + voiceover reach the composition.
4. When the run completes, the `#download-zone` opens with a link to the run / `video.mp4` artifact.

## OmniRoute (local AI gateway)

The pipeline targets `OMNIROUTE_BASE_URL` (default `http://localhost:20128/v1`) with `OMNIROUTE_API_KEY` (default `sk_omniroute`), mapping to free-tier models such as `auto/coding`, `oc/deepseek-v4-flash-free`, or Qwen coder configurations via your OmniRoute instance.

GitHub-hosted runners cannot reach `localhost:20128` on your machine, so `scripts/generate_script.py` falls back to a pure-Python template script when the gateway is unreachable — keeping the pipeline **100% free and functional with no API keys**. To use OmniRoute from CI, expose it (tunnel) and set the `OMNIROUTE_BASE_URL` repository variable, or run on a self-hosted runner.

## License

MIT — fully open-source, zero proprietary dependencies.
