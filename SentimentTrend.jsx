import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { SENTIMENT_COLORS } from "@/lib/api";

export default function SentimentTrend({ timeline = [] }) {
  const hasData = timeline.length >= 2;
  return (
    <div className="card-flat p-6" data-testid="sentiment-trend">
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.28em] text-neutral-500 font-body font-semibold">Trend</div>
          <div className="font-heading text-xl font-semibold mt-1">Sentiment over time</div>
        </div>
      </div>
      {hasData ? (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="g-pos" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={SENTIMENT_COLORS.positive} stopOpacity={0.3} /><stop offset="100%" stopColor={SENTIMENT_COLORS.positive} stopOpacity={0} /></linearGradient>
              <linearGradient id="g-neu" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={SENTIMENT_COLORS.neutral} stopOpacity={0.3} /><stop offset="100%" stopColor={SENTIMENT_COLORS.neutral} stopOpacity={0} /></linearGradient>
              <linearGradient id="g-neg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={SENTIMENT_COLORS.negative} stopOpacity={0.3} /><stop offset="100%" stopColor={SENTIMENT_COLORS.negative} stopOpacity={0} /></linearGradient>
            </defs>
            <CartesianGrid stroke="#E5E3DB" strokeDasharray="2 4" />
            <XAxis dataKey="date" tick={{ fill: "#737373", fontSize: 11, fontFamily: "IBM Plex Mono" }} stroke="#E5E3DB" />
            <YAxis tick={{ fill: "#737373", fontSize: 11, fontFamily: "IBM Plex Mono" }} stroke="#E5E3DB" allowDecimals={false} />
            <Tooltip contentStyle={{ borderRadius: 0, border: "1px solid #111", background: "#fff", fontFamily: "Chivo", fontSize: 12 }} />
            <Legend wrapperStyle={{ fontFamily: "Chivo", fontSize: 12 }} />
            <Area type="monotone" dataKey="positive" stroke={SENTIMENT_COLORS.positive} strokeWidth={2} fill="url(#g-pos)" />
            <Area type="monotone" dataKey="neutral" stroke={SENTIMENT_COLORS.neutral} strokeWidth={2} fill="url(#g-neu)" />
            <Area type="monotone" dataKey="negative" stroke={SENTIMENT_COLORS.negative} strokeWidth={2} fill="url(#g-neg)" />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[280px] grid place-items-center text-sm text-neutral-500 font-body border border-dashed border-[#E5E3DB]">
          Not enough dated posts to draw a trend. Try a more active topic.
        </div>
      )}
    </div>
  );
}
