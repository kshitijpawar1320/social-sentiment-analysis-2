import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Search, Loader2, TrendingUp, GitCompare, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { runAnalysis, listAnalyses, getAnalysis, deleteAnalysis } from "@/lib/api";
import DashboardHeader from "@/components/DashboardHeader";
import EmptyState from "@/components/EmptyState";
import AnalyticsGrid from "@/components/AnalyticsGrid";
import RecentSidebar from "@/components/RecentSidebar";

export default function Dashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [recent, setRecent] = useState([]);

  const refreshRecent = async () => {
    try { setRecent(await listAnalyses()); } catch (e) { /* ignore */ }
  };

  useEffect(() => { refreshRecent(); }, []);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const doc = await getAnalysis(id);
        setAnalysis(doc);
        setKeyword(doc.keyword);
      } catch (e) {
        toast.error("Could not load that analysis");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleAnalyze = async (e) => {
    e?.preventDefault?.();
    const q = keyword.trim();
    if (!q) { toast.error("Enter a keyword to analyze"); return; }
    setLoading(true);
    setAnalysis(null);
    try {
      const doc = await runAnalysis(q, 15);
      setAnalysis(doc);
      navigate(`/analysis/${doc.id}`, { replace: true });
      refreshRecent();
      toast.success(`Analyzed ${doc.summary.total_posts} posts on "${q}"`);
    } catch (err) {
      const msg = err?.response?.data?.detail || "Analysis failed. Try a broader keyword.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (rid) => {
    try {
      await deleteAnalysis(rid);
      if (analysis?.id === rid) { setAnalysis(null); navigate("/"); }
      refreshRecent();
      toast.success("Analysis deleted");
    } catch { toast.error("Delete failed"); }
  };

  const handleOpen = async (rid) => {
    try {
      setLoading(true);
      const doc = await getAnalysis(rid);
      setAnalysis(doc);
      setKeyword(doc.keyword);
      navigate(`/analysis/${rid}`, { replace: true });
    } catch { toast.error("Could not load"); }
    finally { setLoading(false); }
  };

  return (
    <div className="grain-bg min-h-screen">
      <DashboardHeader />

      <main className="max-w-[1400px] mx-auto px-6 md:px-10 py-8 md:py-12">
        {/* Hero + Search */}
        <section className="mb-10 md:mb-14">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-[#E5E3DB] pb-8">
            <div className="max-w-3xl">
              <div className="text-xs uppercase tracking-[0.28em] text-neutral-500 font-body font-semibold mb-4">
                <span className="marquee-dot bg-[#059669] mr-2 align-middle" />
                Political Pulse · Live Analytics
              </div>
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-950 tracking-tight leading-[1.05]">
                The <em className="italic">sentiment</em> behind<br className="hidden md:block" /> every conversation.
              </h1>
              <p className="mt-5 text-neutral-600 max-w-xl text-base md:text-lg leading-relaxed">
                Search any politician, party, campaign, or issue. We scrape Reddit, YouTube, and global news, then let Claude Sonnet analyse tone, themes and engagement.
              </p>
            </div>
            <div className="hidden md:block text-right shrink-0">
              <div className="font-mono text-xs text-neutral-500">EDITION · {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</div>
              <div className="font-heading italic text-neutral-500 text-lg mt-1">"Data before doctrine."</div>
            </div>
          </div>

          <form onSubmit={handleAnalyze} className="mt-8 flex flex-col md:flex-row gap-3 md:gap-4 max-w-3xl" data-testid="search-form">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <Input
                data-testid="search-input"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder='e.g. "Modi 2026" · "US midterms" · "climate policy" · "Rishi Sunak"'
                className="h-14 pl-12 pr-4 text-base rounded-sm border-neutral-300 bg-white focus-visible:ring-2 focus-visible:ring-neutral-900 font-body"
                disabled={loading}
              />
            </div>
            <Button
              data-testid="analyze-button"
              type="submit"
              disabled={loading}
              className="h-14 px-8 rounded-sm bg-neutral-900 hover:bg-neutral-800 text-white text-base font-body font-medium tracking-wide"
            >
              {loading ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Analyzing…</>) : (<><TrendingUp className="h-4 w-4 mr-2" />Analyze</>)}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/compare")}
              data-testid="compare-button"
              className="h-14 px-6 rounded-sm border-neutral-300 bg-transparent hover:bg-neutral-100 text-neutral-800 font-body"
            >
              <GitCompare className="h-4 w-4 mr-2" /> Compare
            </Button>
          </form>

          {loading && (
            <div className="mt-6 text-sm text-neutral-500 font-mono">
              <Loader2 className="h-3.5 w-3.5 inline mr-2 animate-spin" />
              Scraping Reddit · Google News · YouTube… then routing to Claude Sonnet for sentiment. ~30-60s.
            </div>
          )}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10">
          <div>
            {analysis ? <AnalyticsGrid data={analysis} /> : !loading && <EmptyState onExample={(k) => { setKeyword(k); }} />}
          </div>
          <aside>
            <RecentSidebar items={recent} onOpen={handleOpen} onDelete={handleDelete} activeId={analysis?.id} />
          </aside>
        </div>
      </main>

      <footer className="border-t border-[#E5E3DB] mt-16">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-6 flex flex-col md:flex-row justify-between gap-3 text-xs text-neutral-500 font-mono uppercase tracking-widest">
          <span>Political Pulse · An editorial analytics workbench</span>
          <span>Sentiment engine · Claude Sonnet 4.6</span>
        </div>
      </footer>
    </div>
  );
}
