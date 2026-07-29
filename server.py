from __future__ import annotations

import logging
import os
import uuid
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from starlette.middleware.cors import CORSMiddleware

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

from analyzer import analyse_posts_batch, executive_summary  # noqa: E402
from scraper import scrape_all  # noqa: E402

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI(title="Political Pulse Analytics")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


# ---------- Models ----------
class AnalyseRequest(BaseModel):
    keyword: str = Field(..., min_length=2, max_length=120)
    per_source: int = Field(default=15, ge=5, le=25)


class AnalysisSummary(BaseModel):
    id: str
    keyword: str
    created_at: str
    total_posts: int
    sentiment_breakdown: dict[str, int]


# ---------- Helpers ----------
def _iso_day(iso_ts: str | None) -> str | None:
    if not iso_ts:
        return None
    try:
        return datetime.fromisoformat(iso_ts.replace("Z", "+00:00")).strftime("%Y-%m-%d")
    except Exception:
        return None


def _build_summary(posts: list[dict[str, Any]]) -> dict[str, Any]:
    sentiment_counts = Counter(p.get("sentiment", "neutral") for p in posts)
    platform_counts = Counter(p["platform"] for p in posts)
    platform_sentiment: dict[str, dict[str, int]] = defaultdict(lambda: Counter())
    engagement_totals = Counter()
    theme_counter: Counter[str] = Counter()
    emotion_counter: Counter[str] = Counter()
    region_counter: Counter[str] = Counter()
    timeline: dict[str, dict[str, int]] = defaultdict(lambda: {"positive": 0, "negative": 0, "neutral": 0})

    for p in posts:
        s = p.get("sentiment", "neutral")
        platform_sentiment[p["platform"]][s] += 1
        eng = p.get("engagement", {}) or {}
        engagement_totals["likes"] += int(eng.get("likes") or 0)
        engagement_totals["comments"] += int(eng.get("comments") or 0)
        engagement_totals["shares"] += int(eng.get("shares") or 0)
        for t in p.get("themes") or []:
            theme_counter[t] += 1
        emotion_counter[p.get("emotion", "neutral")] += 1
        if p.get("region"):
            region_counter[p["region"]] += 1
        day = _iso_day(p.get("created_at"))
        if day:
            timeline[day][s] = timeline[day].get(s, 0) + 1

    # Top influencers: highest engagement authors
    author_stats: dict[str, dict[str, Any]] = {}
    for p in posts:
        a = p.get("author") or "anonymous"
        entry = author_stats.setdefault(
            a,
            {"author": a, "platform": p["platform"], "posts": 0, "engagement": 0, "url": p.get("author_url") or "", "sentiments": []},
        )
        entry["posts"] += 1
        eng = p.get("engagement", {}) or {}
        entry["engagement"] += int(eng.get("likes") or 0) + int(eng.get("comments") or 0)
        entry["sentiments"].append(p.get("sentiment", "neutral"))
    top_voices = sorted(author_stats.values(), key=lambda x: x["engagement"], reverse=True)[:6]
    for v in top_voices:
        c = Counter(v["sentiments"])
        v["dominant_sentiment"] = c.most_common(1)[0][0] if c else "neutral"
        del v["sentiments"]

    sorted_timeline = [
        {"date": d, **timeline[d]}
        for d in sorted(timeline.keys())
    ]

    return {
        "sentiment_breakdown": dict(sentiment_counts),
        "platform_breakdown": dict(platform_counts),
        "platform_sentiment": {k: dict(v) for k, v in platform_sentiment.items()},
        "engagement_totals": dict(engagement_totals),
        "top_themes": theme_counter.most_common(15),
        "emotions": dict(emotion_counter),
        "regions": dict(region_counter),
        "timeline": sorted_timeline,
        "top_voices": top_voices,
        "total_posts": len(posts),
    }


# ---------- Endpoints ----------
@api_router.get("/")
async def root():
    return {"message": "Political Pulse Analytics API", "status": "ok"}


@api_router.post("/analyze")
async def analyze(req: AnalyseRequest):
    """Scrape + analyse a keyword. Returns full analysis document."""
    logger.info(f"Analyzing keyword: {req.keyword}")

    raw_posts = await scrape_all(req.keyword, per_source=req.per_source)
    if not raw_posts:
        raise HTTPException(status_code=404, detail="No posts found from any source. Try a different keyword.")

    logger.info(f"Scraped {len(raw_posts)} posts. Running sentiment analysis...")
    enrichments = await analyse_posts_batch(raw_posts, req.keyword)

    for post, enrich in zip(raw_posts, enrichments):
        post.update(enrich)

    summary = _build_summary(raw_posts)
    briefing = await executive_summary(req.keyword, {
        "total_posts": summary["total_posts"],
        "sentiment_breakdown": summary["sentiment_breakdown"],
        "top_themes": summary["top_themes"][:8],
        "platform_breakdown": summary["platform_breakdown"],
        "engagement_totals": summary["engagement_totals"],
    })

    doc = {
        "id": str(uuid.uuid4()),
        "keyword": req.keyword,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "posts": raw_posts,
        "summary": summary,
        "briefing": briefing,
    }
    await db.analyses.insert_one({**doc, "_id": doc["id"]})
    return doc


@api_router.get("/analyses")
async def list_analyses():
    cursor = db.analyses.find({}, {"_id": 0, "posts": 0}).sort("created_at", -1).limit(50)
    items = await cursor.to_list(length=50)
    return items


@api_router.get("/analysis/{analysis_id}")
async def get_analysis(analysis_id: str):
    doc = await db.analyses.find_one({"id": analysis_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return doc


@api_router.delete("/analysis/{analysis_id}")
async def delete_analysis(analysis_id: str):
    result = await db.analyses.delete_one({"id": analysis_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return {"deleted": analysis_id}


@api_router.get("/compare")
async def compare(ids: str):
    """Compare multiple analyses by comma-separated ids."""
    id_list = [i.strip() for i in ids.split(",") if i.strip()]
    if len(id_list) < 2:
        raise HTTPException(status_code=400, detail="Provide at least two analysis ids")
    docs = await db.analyses.find({"id": {"$in": id_list}}, {"_id": 0, "posts": 0}).to_list(length=10)
    return {"analyses": docs}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
