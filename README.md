# remotion-video-pipeline

Zero-cost, cloud-based automated video generation pipeline.

- **Dashboard:** `index.html` — dark Tailwind control panel. Pick a niche, click **🚀 Initialize Cloud Video Engine**, which fires a GitHub `repository_dispatch` (`trigger-video-generation`) with `{"event_type": "trigger-video-generation", "client_payload": {"niche": "..."}}`.
- **Trends:** `fetch_trends.py` harvests public Google News RSS (no API key) into `live_trends.csv`.
- **Script + voiceover:** `scripts/generate_script.py` routes through the local **OmniRoute gateway** (`http://localhost:20128/v1`, key `sk_omniroute`) with a zero-cost template fallback, then renders `data/voiceover.mp3` via **edge-tts**.
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

Render locally:

```bash
npm run build            # remotion render src/index.ts Demo out/video.mp4
```

> Rendering requires a headless Chromium/Chrome (Remotion renders frames through
> a browser before ffmpeg encodes the MP4). GitHub Actions `ubuntu-latest`
> runners ship Chrome, so the CI pipeline renders end-to-end. On this arm64 /
> Termux box there is no Chromium available, so local `remotion render` needs a
> browser installed first — CI is the production render target.

## Connect your new GitHub account & push

This repo is initialized locally with no remote. From inside the repo:

```bash
git init -b main
git add -A
git commit -m "chore: bootstrap remotion video pipeline"

# Add your new-account remote (replace with your repo URL):
git remote add origin https://github.com/<YOUR_NEW_ACCOUNT>/remotion-video-pipeline.git

# Push (auth with your GitHub Classic PAT when prompted):
git push -u origin main
```

Then enable GitHub Pages in repo settings (Build source: GitHub Actions) so `index.html` is served at `https://<account>.github.io/remotion-video-pipeline/`.

## Dashboard → CI wiring

1. In `index.html`, set `REPO_OWNER` and `REPO_NAME` to your new account/repo.
2. Paste a GitHub Classic PAT with `repo` scope into the token field (it is **never stored** — read only at dispatch time).
3. Click **🚀 Initialize Cloud Video Engine** → `repository_dispatch` → `generate-video.yml` runs on GitHub Actions.
4. When the run completes, the `#download-zone` opens with a link to the run / `video.mp4` artifact.

## OmniRoute (local AI gateway)

The pipeline targets `OMNIROUTE_BASE_URL` (default `http://localhost:20128/v1`) with `OMNIROUTE_API_KEY` (default `sk_omniroute`), mapping to free-tier models such as `auto/coding`, `oc/deepseek-v4-flash-free`, or Qwen coder configurations via your OmniRoute instance.

GitHub-hosted runners cannot reach `localhost:20128` on your machine, so `scripts/generate_script.py` falls back to a pure-Python template script when the gateway is unreachable — keeping the pipeline **100% free and functional with no API keys**. To use OmniRoute from CI, expose it (tunnel) and set the `OMNIROUTE_BASE_URL` repository variable, or run on a self-hosted runner.

## License

MIT — fully open-source, zero proprietary dependencies.
