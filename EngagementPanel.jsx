import { ThumbsUp, MessageCircle, Share2 } from "lucide-react";
import { formatNumber } from "@/lib/api";

const CONFIG = [
  { key: "likes", label: "Likes & Views", Icon: ThumbsUp },
  { key: "comments", label: "Comments", Icon: MessageCircle },
  { key: "shares", label: "Shares", Icon: Share2 },
];

export default function EngagementPanel({ totals = {} }) {
  return (
    <div className="card-flat p-6" data-testid="engagement-panel">
      <div className="text-[11px] uppercase tracking-[0.28em] text-neutral-500 font-body font-semibold">Engagement</div>
      <div className="font-heading text-xl font-semibold mt-1 mb-5">Aggregate reach</div>
      <div className="space-y-5">
        {CONFIG.map(({ key, label, Icon }) => (
          <div key={key} className="flex items-center justify-between border-b border-[#E5E3DB] pb-3 last:border-0">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-neutral-100 grid place-items-center rounded-sm">
                <Icon className="h-4 w-4 text-neutral-800" />
              </div>
              <div className="font-body text-sm text-neutral-700">{label}</div>
            </div>
            <div className="font-mono text-2xl font-medium text-neutral-950" data-testid={`engagement-${key}`}>
              {formatNumber(totals[key] || 0)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
