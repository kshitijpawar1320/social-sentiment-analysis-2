"""LLM-powered sentiment + theme analysis using Claude Sonnet via Emergent LLM key."""
from __future__ import annotations

import json
import os
import re
from typing import Any

from emergentintegrations.llm.chat import LlmChat, UserMessage

EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")

SYSTEM_PROMPT = """You are a senior political analyst specialising in social media sentiment.
You analyse posts, headlines, and comments to extract sentiment, emotion, key themes, and geographic signals.
You are impartial, precise, and never editorialise. Output ONLY valid JSON matching the requested schema."""


def _extract_json(text: str) -> Any:
    """Grab the first JSON object/array in a possibly noisy LLM response."""
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    try:
        return json.loads(text)
    except Exception:
        pass
    # Try to find first [...] or {...} block
    for pattern in (r"\[.*\]", r"\{.*\}"):
        m = re.search(pattern, text, re.DOTALL)
        if m:
            try:
                return json.loads(m.group(0))
            except Exception:
                continue
    raise ValueError("No valid JSON found in LLM response")


async def analyse_posts_batch(posts: list[dict[str, Any]], keyword: str) -> list[dict[str, Any]]:
    """Batch-analyse posts. Returns a per-post enrichment: sentiment, score, emotion, themes, region."""
    if not posts:
        return []

    items = [
        {"i": idx, "platform": p["platform"], "text": (p.get("text") or p.get("title") or "")[:600]}
        for idx, p in enumerate(posts)
    ]

    user_prompt = f"""Analyse the following {len(items)} social-media posts about "{keyword}".

For EACH post return an object with:
- i: the original index
- sentiment: "positive" | "negative" | "neutral"
- score: -1.0 to 1.0 (float, -1 very negative, +1 very positive)
- emotion: one of "anger", "joy", "fear", "sadness", "trust", "disgust", "surprise", "neutral"
- themes: array of 1-3 short lowercase topic tags (e.g. ["economy", "corruption", "youth"])
- region: 2-letter country code if the post clearly references a specific country, else null

Return ONLY a JSON array of these objects. No prose.

POSTS:
{json.dumps(items, ensure_ascii=False)}"""

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"sentiment-{keyword[:20]}",
        system_message=SYSTEM_PROMPT,
    ).with_model("anthropic", "claude-sonnet-4-6")

    response = await chat.send_message(UserMessage(text=user_prompt))
    try:
        parsed = _extract_json(response)
    except Exception as e:
        print(f"[analyzer] JSON parse failed: {e}. Raw: {response[:500]}")
        return [{"i": i, "sentiment": "neutral", "score": 0.0, "emotion": "neutral", "themes": [], "region": None} for i in range(len(posts))]

    # Normalise
    by_idx = {int(o["i"]): o for o in parsed if isinstance(o, dict) and "i" in o}
    out = []
    for idx in range(len(posts)):
        o = by_idx.get(idx, {})
        out.append(
            {
                "sentiment": o.get("sentiment", "neutral"),
                "score": float(o.get("score", 0.0)),
                "emotion": o.get("emotion", "neutral"),
                "themes": [str(t).lower() for t in (o.get("themes") or [])][:3],
                "region": o.get("region"),
            }
        )
    return out


async def executive_summary(keyword: str, summary_stats: dict[str, Any]) -> str:
    """Generate a short editorial exec summary of the sentiment landscape."""
    prompt = f"""You are briefing a senior political consultant.
Keyword: "{keyword}"
Aggregate data: {json.dumps(summary_stats, ensure_ascii=False)}

Write a concise, editorial 3-4 sentence briefing on the sentiment landscape.
Be objective. Highlight the dominant sentiment, key themes, notable engagement, and any red flags.
No markdown. No bullet points. Plain paragraph."""

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"summary-{keyword[:20]}",
        system_message=SYSTEM_PROMPT,
    ).with_model("anthropic", "claude-sonnet-4-6")

    response = await chat.send_message(UserMessage(text=prompt))
    return response.strip().strip('"')
