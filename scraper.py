"""Multi-source social media scraper.

Scrapes Reddit (public JSON), Google News RSS, and YouTube (HTML) for a keyword.
No API keys required. Returns a unified schema of posts with engagement metrics.
"""
from __future__ import annotations

import asyncio
import html
import json
import re
import urllib.parse
from datetime import datetime, timezone
from typing import Any

import httpx

USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
)
HEADERS = {"User-Agent": USER_AGENT, "Accept-Language": "en-US,en;q=0.9"}
TIMEOUT = 20.0


def _clean(text: str | None) -> str:
    if not text:
        return ""
    text = html.unescape(text)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


async def scrape_reddit(client: httpx.AsyncClient, query: str, limit: int = 20) -> list[dict[str, Any]]:
    url = f"https://www.reddit.com/search.json?q={urllib.parse.quote(query)}&sort=relevance&limit={limit}&t=month"
    try:
        r = await client.get(url, headers=HEADERS, timeout=TIMEOUT)
        r.raise_for_status()
        data = r.json()
    except Exception as e:
        print(f"[reddit] failed: {e}")
        return []

    out: list[dict[str, Any]] = []
    for child in data.get("data", {}).get("children", []):
        p = child.get("data", {})
        title = _clean(p.get("title"))
        text = _clean(p.get("selftext"))
        if not title:
            continue
        combined = f"{title}. {text}" if text else title
        ts = p.get("created_utc")
        created_iso = (
            datetime.fromtimestamp(ts, tz=timezone.utc).isoformat() if ts else None
        )
        out.append(
            {
                "platform": "reddit",
                "title": title,
                "text": combined[:1500],
                "author": p.get("author") or "anonymous",
                "author_url": f"https://reddit.com/user/{p.get('author')}" if p.get("author") else "",
                "url": f"https://reddit.com{p.get('permalink', '')}",
                "subreddit": p.get("subreddit"),
                "engagement": {
                    "likes": int(p.get("ups") or 0),
                    "comments": int(p.get("num_comments") or 0),
                    "shares": 0,
                },
                "created_at": created_iso,
                "region": None,
            }
        )
    return out


async def scrape_news(client: httpx.AsyncClient, query: str, limit: int = 20) -> list[dict[str, Any]]:
    """Google News RSS — headlines + snippets for a keyword."""
    url = f"https://news.google.com/rss/search?q={urllib.parse.quote(query)}&hl=en-US&gl=US&ceid=US:en"
    try:
        r = await client.get(url, headers=HEADERS, timeout=TIMEOUT)
        r.raise_for_status()
        text = r.text
    except Exception as e:
        print(f"[news] failed: {e}")
        return []

    items = re.findall(r"<item>(.*?)</item>", text, re.DOTALL)
    out: list[dict[str, Any]] = []
    for it in items[:limit]:
        title = _clean(re.search(r"<title>(.*?)</title>", it, re.DOTALL).group(1)) if re.search(r"<title>", it) else ""
        link_m = re.search(r"<link>(.*?)</link>", it, re.DOTALL)
        link = link_m.group(1).strip() if link_m else ""
        pub_m = re.search(r"<pubDate>(.*?)</pubDate>", it, re.DOTALL)
        pub = pub_m.group(1).strip() if pub_m else ""
        src_m = re.search(r"<source[^>]*>(.*?)</source>", it, re.DOTALL)
        source = _clean(src_m.group(1)) if src_m else "News"
        desc_m = re.search(r"<description>(.*?)</description>", it, re.DOTALL)
        desc = _clean(desc_m.group(1)) if desc_m else ""

        try:
            created_iso = datetime.strptime(pub, "%a, %d %b %Y %H:%M:%S %Z").replace(tzinfo=timezone.utc).isoformat()
        except Exception:
            created_iso = None

        if not title:
            continue
        combined = f"{title}. {desc}" if desc else title
        out.append(
            {
                "platform": "news",
                "title": title,
                "text": combined[:1500],
                "author": source,
                "author_url": "",
                "url": link,
                "subreddit": None,
                "engagement": {"likes": 0, "comments": 0, "shares": 0},
                "created_at": created_iso,
                "region": None,
            }
        )
    return out


async def scrape_youtube(client: httpx.AsyncClient, query: str, limit: int = 15) -> list[dict[str, Any]]:
    """YouTube search results page — extract initial data JSON."""
    url = f"https://www.youtube.com/results?search_query={urllib.parse.quote(query)}"
    try:
        r = await client.get(url, headers=HEADERS, timeout=TIMEOUT)
        r.raise_for_status()
        html_text = r.text
    except Exception as e:
        print(f"[youtube] failed: {e}")
        return []

    m = re.search(r"var ytInitialData = ({.*?});</script>", html_text, re.DOTALL)
    if not m:
        return []
    try:
        data = json.loads(m.group(1))
    except Exception:
        return []

    out: list[dict[str, Any]] = []

    def walk(node: Any):
        if len(out) >= limit:
            return
        if isinstance(node, dict):
            if "videoRenderer" in node:
                v = node["videoRenderer"]
                title = ""
                if "title" in v and "runs" in v["title"]:
                    title = "".join(r.get("text", "") for r in v["title"]["runs"])
                vid = v.get("videoId")
                if not vid or not title:
                    return
                channel = ""
                if "ownerText" in v and "runs" in v["ownerText"]:
                    channel = v["ownerText"]["runs"][0].get("text", "")
                views_text = ""
                if "viewCountText" in v:
                    views_text = v["viewCountText"].get("simpleText", "") or ""
                views = 0
                m2 = re.search(r"([\d,]+)", views_text)
                if m2:
                    try:
                        views = int(m2.group(1).replace(",", ""))
                    except Exception:
                        views = 0
                desc_snips = v.get("detailedMetadataSnippets") or []
                desc = ""
                if desc_snips and "snippetText" in desc_snips[0]:
                    desc = "".join(r.get("text", "") for r in desc_snips[0]["snippetText"].get("runs", []))
                combined = f"{title}. {desc}" if desc else title
                out.append(
                    {
                        "platform": "youtube",
                        "title": _clean(title),
                        "text": _clean(combined)[:1500],
                        "author": channel or "YouTube",
                        "author_url": "",
                        "url": f"https://www.youtube.com/watch?v={vid}",
                        "subreddit": None,
                        "engagement": {"likes": views, "comments": 0, "shares": 0},
                        "created_at": None,
                        "region": None,
                    }
                )
                return
            for v in node.values():
                walk(v)
                if len(out) >= limit:
                    return
        elif isinstance(node, list):
            for v in node:
                walk(v)
                if len(out) >= limit:
                    return

    walk(data)
    return out


async def scrape_all(query: str, per_source: int = 15) -> list[dict[str, Any]]:
    """Run all scrapers in parallel and return a merged list."""
    async with httpx.AsyncClient(follow_redirects=True) as client:
        results = await asyncio.gather(
            scrape_reddit(client, query, per_source),
            scrape_news(client, query, per_source),
            scrape_youtube(client, query, per_source),
            return_exceptions=True,
        )
    merged: list[dict[str, Any]] = []
    for r in results:
        if isinstance(r, list):
            merged.extend(r)
    return merged
