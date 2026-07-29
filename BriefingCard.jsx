import { Quote } from "lucide-react";

export default function BriefingCard({ briefing, keyword }) {
  return (
    <div className="card-flat p-6 md:p-8 stagger-in" data-testid="briefing-card">
      <div className="flex items-start gap-4">
        <Quote className="h-6 w-6 text-neutral-900 shrink-0 mt-1" />
        <div>
          <div className="text-[11px] uppercase tracking-[0.28em] text-neutral-500 font-body font-semibold">Strategic Briefing · {keyword}</div>
          <p className="mt-3 font-heading italic text-xl md:text-2xl leading-relaxed text-neutral-900 max-w-4xl">
            {briefing || "Briefing not available."}
          </p>
        </div>
      </div>
    </div>
  );
}
