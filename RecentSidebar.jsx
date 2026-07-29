import { X, Clock } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

export default function RecentSidebar({ items, onOpen, onDelete, activeId }) {
  return (
    <div className="lg:sticky lg:top-24" data-testid="recent-sidebar">
      <div className="text-[11px] uppercase tracking-[0.24em] text-neutral-500 font-body font-semibold mb-3 flex items-center gap-2">
        <Clock className="h-3 w-3" /> Recent Analyses
      </div>
      {(!items || items.length === 0) && (
        <div className="text-sm text-neutral-500 border border-dashed border-[#E5E3DB] p-4 rounded-sm">Your past searches will appear here.</div>
      )}
      <ul className="space-y-2">
        {items?.map((it) => (
          <li key={it.id}>
            <div
              className={`group card-flat p-3 hover-lift cursor-pointer ${activeId === it.id ? "border-neutral-900" : ""}`}
              onClick={() => onOpen(it.id)}
              data-testid={`recent-item-${it.id}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-heading font-semibold text-neutral-900 truncate">{it.keyword}</div>
                  <div className="text-xs text-neutral-500 font-mono mt-1">
                    {it.total_posts || it.summary?.total_posts || 0} posts · {dayjs(it.created_at).fromNow()}
                  </div>
                </div>
                <button
                  data-testid={`delete-recent-${it.id}`}
                  onClick={(e) => { e.stopPropagation(); onDelete(it.id); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-neutral-400 hover:text-red-600"
                  aria-label="Delete"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <SentimentBar breakdown={it.sentiment_breakdown || it.summary?.sentiment_breakdown} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SentimentBar({ breakdown }) {
  if (!breakdown) return null;
  const total = (breakdown.positive || 0) + (breakdown.negative || 0) + (breakdown.neutral || 0);
  if (!total) return null;
  const p = ((breakdown.positive || 0) / total) * 100;
  const n = ((breakdown.negative || 0) / total) * 100;
  const u = 100 - p - n;
  return (
    <div className="mt-3 flex h-1.5 w-full overflow-hidden rounded-sm">
      <div style={{ width: `${p}%`, background: "#059669" }} />
      <div style={{ width: `${u}%`, background: "#D97706" }} />
      <div style={{ width: `${n}%`, background: "#DC2626" }} />
    </div>
  );
}
