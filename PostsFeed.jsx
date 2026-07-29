import { useState } from "react";
import { ExternalLink, ArrowUpRight } from "lucide-react";
import { SENTIMENT_COLORS, PLATFORM_COLORS, formatNumber } from "@/lib/api";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const FILTERS = [
  { key: "all", label: "All posts" },
  { key: "positive", label: "Positive" },
  { key: "neutral", label: "Neutral" },
  { key: "negative", label: "Negative" },
];

export default function PostsFeed({ posts = [] }) {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? posts : posts.filter((p) => p.sentiment === filter);

  return (
    <div className="card-flat p-6" data-testid="posts-feed">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.28em] text-neutral-500 font-body font-semibold">Feed</div>
          <div className="font-heading text-xl font-semibold mt-1">Raw signal · {filtered.length} posts</div>
        </div>
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList className="bg-neutral-100 rounded-sm">
            {FILTERS.map((f) => (
              <TabsTrigger key={f.key} value={f.key} data-testid={`filter-${f.key}`} className="rounded-sm font-body data-[state=active]:bg-neutral-900 data-[state=active]:text-white">
                {f.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <ul className="divide-y divide-[#E5E3DB]">
        {filtered.slice(0, 30).map((p, i) => (
          <li key={`${p.url}-${i}`} className="py-4 flex items-start gap-4 group" data-testid={`post-${i}`}>
            <div className="flex flex-col items-center pt-1">
              <span
                className="h-2 w-2 rounded-sm"
                style={{ background: SENTIMENT_COLORS[p.sentiment] || "#999" }}
                title={p.sentiment}
              />
              <span
                className="w-px flex-1 mt-2"
                style={{ background: SENTIMENT_COLORS[p.sentiment] || "#E5E3DB", opacity: 0.4 }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-neutral-500">
                <span style={{ color: PLATFORM_COLORS[p.platform] || "#999" }} className="capitalize">{p.platform}</span>
                <span>·</span>
                <span>{p.author}</span>
                {p.subreddit && (<><span>·</span><span>r/{p.subreddit}</span></>)}
                {p.emotion && (<><span>·</span><span className="lowercase italic">{p.emotion}</span></>)}
              </div>
              <a
                href={p.url}
                target="_blank"
                rel="noreferrer"
                className="block font-heading text-lg leading-snug text-neutral-900 hover:underline mt-1"
              >
                {p.title}
                <ArrowUpRight className="inline h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
              </a>
              {p.text && p.text !== p.title && (
                <p className="text-sm text-neutral-600 mt-1 line-clamp-2 max-w-3xl">{p.text}</p>
              )}
              <div className="mt-2 flex items-center gap-4 text-xs font-mono text-neutral-500">
                <span>▲ {formatNumber(p.engagement?.likes)}</span>
                <span>💬 {formatNumber(p.engagement?.comments)}</span>
                {p.themes?.length > 0 && (
                  <span className="flex flex-wrap gap-1">
                    {p.themes.map((t) => (
                      <span key={t} className="border border-[#E5E3DB] px-1.5 py-0.5 rounded-sm text-neutral-600">{t}</span>
                    ))}
                  </span>
                )}
              </div>
            </div>
            <a
              href={p.url}
              target="_blank"
              rel="noreferrer"
              className="text-neutral-400 hover:text-neutral-900 transition-colors shrink-0"
              aria-label="Open source"
              data-testid={`post-link-${i}`}
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
