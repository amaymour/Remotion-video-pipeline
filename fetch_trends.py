#!/usr/bin/env python3
"""
fetch_trends.py
---------------
Zero-cost public trends fetching engine.

Scrapes current high-performing topics from Google News RSS (no developer API key
required) using only the standard library, and exports findings to live_trends.csv.

The niche keyword is taken as the first positional argument — this is the string
passed through the GitHub repository_dispatch client_payload from the web dashboard.

Usage:
    python fetch_trends.py "Tech Tools"
    python fetch_trends.py "Tech Tools" --out live_trends.csv --max 25
"""

import argparse
import csv
import sys
import xml.etree.ElementTree as ET
from urllib.request import Request, urlopen
from urllib.parse import quote

GOOGLE_NEWS_RSS = (
    "https://news.google.com/rss/search?q={query}&hl=en-US&gl=US&ceid=US:en"
)
USER_AGENT = "Mozilla/5.0 (compatible; remotion-video-pipeline/1.0)"


def fetch_trends(niche: str, max_items: int = 25) -> list[dict]:
    """Return a list of trend dicts for the given niche from Google News RSS."""
    url = GOOGLE_NEWS_RSS.format(query=quote(niche))
    req = Request(url, headers={"User-Agent": USER_AGENT, "Accept": "application/rss+xml"})

    with urlopen(req, timeout=30) as resp:
        raw = resp.read()

    root = ET.fromstring(raw)
    items: list[dict] = []
    for item in root.findall(".//item")[:max_items]:
        items.append(
            {
                "niche": niche,
                "title": (item.findtext("title") or "").strip(),
                "source": (item.findtext("source") or "").strip(),
                "link": (item.findtext("link") or "").strip(),
                "published": (item.findtext("pubDate") or "").strip(),
            }
        )
    return items


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(
        description="Fetch public Google News trends for a niche into live_trends.csv"
    )
    ap.add_argument("niche", help="Niche keyword (from dispatch client_payload)")
    ap.add_argument("--out", default="live_trends.csv", help="Output CSV path")
    ap.add_argument("--max", type=int, default=25, help="Max items to harvest")
    args = ap.parse_args(argv)

    items = fetch_trends(args.niche, args.max)

    with open(args.out, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(
            f, fieldnames=["niche", "title", "source", "link", "published"]
        )
        writer.writeheader()
        writer.writerows(items)

    print(f"fetch_trends: wrote {len(items)} trends for niche '{args.niche}' -> {args.out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
