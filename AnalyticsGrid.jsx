import BriefingCard from "@/components/panels/BriefingCard";
import SentimentOverview from "@/components/panels/SentimentOverview";
import SentimentTrend from "@/components/panels/SentimentTrend";
import EngagementPanel from "@/components/panels/EngagementPanel";
import ThemesPanel from "@/components/panels/ThemesPanel";
import PlatformBreakdown from "@/components/panels/PlatformBreakdown";
import TopVoices from "@/components/panels/TopVoices";
import RegionsPanel from "@/components/panels/RegionsPanel";
import PostsFeed from "@/components/panels/PostsFeed";

export default function AnalyticsGrid({ data }) {
  const s = data.summary;
  return (
    <div className="space-y-6" data-testid="analytics-grid">
      {/* Title row */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 pb-2">
        <div>
          <div className="text-[11px] uppercase tracking-[0.28em] text-neutral-500 font-body">Analysis Report</div>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-neutral-950 tracking-tight mt-1">
            <span className="headline-underline">{data.keyword}</span>
          </h2>
        </div>
        <div className="font-mono text-xs text-neutral-500 uppercase tracking-widest">
          {s.total_posts} posts analysed · {Object.keys(s.platform_breakdown).length} platforms
        </div>
      </div>

      <BriefingCard briefing={data.briefing} keyword={data.keyword} />

      <SentimentOverview breakdown={s.sentiment_breakdown} total={s.total_posts} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2"><SentimentTrend timeline={s.timeline} /></div>
        <EngagementPanel totals={s.engagement_totals} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2"><ThemesPanel themes={s.top_themes} emotions={s.emotions} /></div>
        <PlatformBreakdown platformSentiment={s.platform_sentiment} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2"><TopVoices voices={s.top_voices} /></div>
        <RegionsPanel regions={s.regions} />
      </div>

      <PostsFeed posts={data.posts} />
    </div>
  );
}
