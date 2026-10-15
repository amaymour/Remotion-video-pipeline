# YouTube Agent Skill — /yt-viral
#
# Purpose: Isolate viral hook outliers from harvested live_trends.csv.
# Input:  live_trends.csv (niche, title, source, link, published)
# Output: A ranked shortlist of the 3 strongest hook candidates with a one-line
#         rationale for each, plus the single winning hook.

TEMPLATE = """
/yt-viral <niche>

Given these live trends for "<niche>":
{{live_trends_csv}}

Task:
1. Identify the 3 highest viral-potential hooks (timeliness + curiosity gap + controversy/utility).
2. Rank them 1-3 with a one-line rationale each.
3. Declare the single winning hook: "WINNER: <hook>"

Constraints:
- Hooks must be <= 12 words.
- Hooks must pass the voice.md brand rules.
- Output plain text only; no code fences.
"""

EXAMPLE = """
/yt-viral "AI Productivity"

Trends:
- "5 AI agents that automate your entire workday" (TechCrunch)
- "Why your to-do app is lying to you" (The Verge)
- "New Chrome extension blocks all distractions" (Wired)

1. "5 AI agents that automate your entire workday" — high utility, listicle format.
2. "Why your to-do app is lying to you" — curiosity gap, contrarian angle.
3. "New Chrome extension blocks all distractions" — utility, lower viral ceiling.

WINNER: Why your to-do app is lying to you
"""
