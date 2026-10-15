# YouTube Agent Skill — /yt-script
#
# Purpose: Output a structured script sequence with timing constraints and
# keyword compliance checks for YouTube SEO, following voice.md brand rules.
#
# Input:  winning hook from /yt-viral + niche
# Output: Structured script with timestamped beats + SEO keyword checklist

TEMPLATE = """
/yt-script <hook> <niche>

Winning hook: "<hook>"
Niche: "<niche>"

Task:
Write a 45-60 second narration script. Structure it as timestamped beats:

[0:00-0:05] HOOK — restate the winning hook with energy.
[0:05-0:20] PROBLEM — why the viewer should care (1-2 sentences).
[0:20-0:40] SOLUTION — the payoff / insight (2-3 short sentences).
[0:40-0:55] CTA — one clear call-to-action.

SEO keyword compliance:
- Primary keyword "<niche>" appears naturally in hook + CTA.
- No keyword stuffing; max 3 mentions of "<niche>".
- Passes voice.md brand rules (checked).

Output plain text only; no code fences; no intro/outro chatter.
"""

EXAMPLE = """
/yt-script "Why your to-do app is lying to you" "AI Productivity"

[0:00-0:05] Your to-do app is lying to you. It promises productivity but delivers distraction.

[0:05-0:20] Most task managers gamify adding tasks, not finishing them. You get points for writing a list, zero points for doing the work.

[0:20-0:40] The fix: pick one outcome per day, ignore everything else until it's done. AI productivity isn't about more tools — it's about fewer decisions.

[0:40-0:55] Try the one-outcome rule tomorrow. Subscribe for more AI productivity breakdowns.

SEO: "AI Productivity" used in hook and CTA (2x, within limit). voice.md check: pass.
"""
