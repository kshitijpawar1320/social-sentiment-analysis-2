import { SENTIMENT_COLORS } from "@/lib/api";

const LABELS = { positive: "Positive", neutral: "Neutral", negative: "Negative" };

export default function SentimentOverview({ breakdown = {}, total = 0 }) {
  const items = ["positive", "neutral", "negative"].map((k) => ({
    key: k,
    count: breakdown[k] || 0,
    pct: total ? Math.round(((breakdown[k] || 0) / total) * 100) : 0,
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-testid="sentiment-overview">
      {items.map((it) => (
        <div key={it.key} className="card-flat p-6 relative overflow-hidden hover-lift" data-testid={`sentiment-card-${it.key}`}>
          <div className="absolute top-0 left-0 h-1 w-full" style={{ background: SENTIMENT_COLORS[it.key] }} />
          <div className="flex items-baseline justify-between">
            <div className="text-[11px] uppercase tracking-[0.28em] font-body font-semibold text-neutral-500">{LABELS[it.key]}</div>
            <div className="font-mono text-xs text-neutral-400">{it.pct}%</div>
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <div className="font-mono text-4xl md:text-5xl font-medium tracking-tight" style={{ color: SENTIMENT_COLORS[it.key] }}>
              {it.count}
            </div>
            <div className="text-sm text-neutral-500">of {total}</div>
          </div>
          <div className="mt-4 h-2 w-full bg-neutral-100 rounded-sm overflow-hidden">
            <div className="h-full" style={{ width: `${it.pct}%`, background: SENTIMENT_COLORS[it.key] }} />
          </div>
        </div>
      ))}
    </div>
  );
}
