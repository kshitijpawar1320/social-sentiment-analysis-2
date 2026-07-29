import { PLATFORM_COLORS } from "@/lib/api";

const NAMES = { reddit: "Reddit", news: "News", youtube: "YouTube" };

export default function PlatformBreakdown({ platformSentiment = {} }) {
  const platforms = Object.keys(platformSentiment);
  return (
    <div className="card-flat p-6" data-testid="platform-breakdown">
      <div className="text-[11px] uppercase tracking-[0.28em] text-neutral-500 font-body font-semibold">Platforms</div>
      <div className="font-heading text-xl font-semibold mt-1 mb-5">Sentiment by source</div>
      {platforms.length === 0 && <div className="text-sm text-neutral-500">No platform data.</div>}
      <div className="space-y-5">
        {platforms.map((p) => {
          const s = platformSentiment[p];
          const total = (s.positive || 0) + (s.neutral || 0) + (s.negative || 0);
          const pos = total ? ((s.positive || 0) / total) * 100 : 0;
          const neu = total ? ((s.neutral || 0) / total) * 100 : 0;
          const neg = total ? ((s.negative || 0) / total) * 100 : 0;
          return (
            <div key={p} data-testid={`platform-row-${p}`}>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-sm" style={{ background: PLATFORM_COLORS[p] || "#999" }} />
                  <span className="font-body font-medium text-neutral-800">{NAMES[p] || p}</span>
                </div>
                <span className="font-mono text-xs text-neutral-500">{total} posts</span>
              </div>
              <div className="flex h-2 w-full overflow-hidden rounded-sm">
                <div style={{ width: `${pos}%`, background: "#059669" }} />
                <div style={{ width: `${neu}%`, background: "#D97706" }} />
                <div style={{ width: `${neg}%`, background: "#DC2626" }} />
              </div>
              <div className="flex justify-between text-[11px] font-mono text-neutral-500 mt-1">
                <span>+ {s.positive || 0}</span>
                <span>= {s.neutral || 0}</span>
                <span>− {s.negative || 0}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
