import { AVATAR_POOL, SENTIMENT_COLORS, formatNumber, PLATFORM_COLORS } from "@/lib/api";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ExternalLink } from "lucide-react";

export default function TopVoices({ voices = [] }) {
  return (
    <div className="card-flat p-6" data-testid="top-voices">
      <div className="text-[11px] uppercase tracking-[0.28em] text-neutral-500 font-body font-semibold">Top Voices</div>
      <div className="font-heading text-xl font-semibold mt-1 mb-4">Loudest accounts in the conversation</div>
      {voices.length === 0 && <div className="text-sm text-neutral-500">No top voices yet.</div>}
      <table className="w-full">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-widest text-neutral-500 font-body border-b border-[#E5E3DB]">
            <th className="py-2 font-semibold">Account</th>
            <th className="py-2 font-semibold">Platform</th>
            <th className="py-2 font-semibold text-right">Posts</th>
            <th className="py-2 font-semibold text-right">Engagement</th>
            <th className="py-2 font-semibold">Tone</th>
          </tr>
        </thead>
        <tbody>
          {voices.map((v, i) => (
            <tr key={`${v.author}-${i}`} className="border-b border-[#E5E3DB] last:border-0 hover:bg-neutral-50 transition-colors" data-testid={`voice-row-${i}`}>
              <td className="py-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 rounded-sm">
                    <AvatarImage src={AVATAR_POOL[i % AVATAR_POOL.length]} />
                    <AvatarFallback>{v.author?.[0]?.toUpperCase() || "?"}</AvatarFallback>
                  </Avatar>
                  <div className="font-body font-medium text-neutral-900 truncate max-w-[220px]">
                    {v.url ? (
                      <a href={v.url} target="_blank" rel="noreferrer" className="hover:underline inline-flex items-center gap-1">
                        {v.author}<ExternalLink className="h-3 w-3" />
                      </a>
                    ) : v.author}
                  </div>
                </div>
              </td>
              <td className="py-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-body">
                  <span className="h-1.5 w-1.5 rounded-sm" style={{ background: PLATFORM_COLORS[v.platform] || "#999" }} />
                  <span className="capitalize">{v.platform}</span>
                </span>
              </td>
              <td className="py-3 font-mono text-neutral-900 text-right">{v.posts}</td>
              <td className="py-3 font-mono text-neutral-900 text-right">{formatNumber(v.engagement)}</td>
              <td className="py-3">
                <span
                  className="text-[11px] px-2 py-0.5 rounded-sm font-mono uppercase"
                  style={{
                    color: SENTIMENT_COLORS[v.dominant_sentiment] || "#525252",
                    border: `1px solid ${SENTIMENT_COLORS[v.dominant_sentiment] || "#E5E3DB"}`,
                  }}
                >
                  {v.dominant_sentiment}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
