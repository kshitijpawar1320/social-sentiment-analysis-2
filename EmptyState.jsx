import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const EXAMPLES = ["Narendra Modi", "US midterms", "climate policy", "AI regulation", "Rishi Sunak", "Kamala Harris"];

export default function EmptyState({ onExample }) {
  return (
    <div className="card-flat p-10 md:p-14 stagger-in" data-testid="empty-state">
      <div className="text-xs uppercase tracking-[0.28em] text-neutral-500 font-body font-semibold mb-4">Nothing analysed yet</div>
      <h2 className="font-heading text-3xl md:text-4xl font-bold text-neutral-950 leading-tight max-w-lg">
        Every campaign starts with a single search.
      </h2>
      <p className="mt-4 text-neutral-600 max-w-lg leading-relaxed">
        Type any politician, party, or issue above. In under a minute you'll get sentiment, engagement, themes, top voices and a strategic briefing.
      </p>

      <div className="mt-8">
        <div className="text-[11px] uppercase tracking-[0.24em] text-neutral-500 font-body mb-3">Try one of these</div>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <Button
              key={ex}
              variant="outline"
              onClick={() => onExample(ex)}
              data-testid={`example-chip-${ex.replace(/\s+/g, "-").toLowerCase()}`}
              className="rounded-sm border-neutral-300 bg-white hover:bg-neutral-900 hover:text-white transition-colors font-body"
            >
              <Sparkles className="h-3.5 w-3.5 mr-2" /> {ex}
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-[#E5E3DB] pt-8">
        {[
          ["01", "Scrape", "Reddit · Google News · YouTube in parallel"],
          ["02", "Analyse", "Claude Sonnet tags every post with sentiment, emotion & themes"],
          ["03", "Brief", "You get charts, top voices, and a plain-English briefing"],
        ].map(([n, t, d]) => (
          <div key={n}>
            <div className="font-mono text-xs text-neutral-400">{n}</div>
            <div className="font-heading text-lg font-semibold mt-1">{t}</div>
            <div className="text-sm text-neutral-600 mt-1">{d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
