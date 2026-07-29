import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, GitCompare } from "lucide-react";
import { listAnalyses, compareAnalyses, SENTIMENT_COLORS } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import DashboardHeader from "@/components/DashboardHeader";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

export default function ComparePage() {
  const [list, setList] = useState([]);
  const [selected, setSelected] = useState([]);
  const [result, setResult] = useState(null);

  useEffect(() => { listAnalyses().then(setList).catch(() => {}); }, []);

  const toggle = (id) => setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : (s.length < 4 ? [...s, id] : s));

  const run = async () => {
    if (selected.length < 2) { toast.error("Pick at least two analyses"); return; }
    try {
      const r = await compareAnalyses(selected);
      setResult(r);
    } catch { toast.error("Compare failed"); }
  };

  const chartData = result?.analyses?.map((a) => ({
    name: a.keyword,
    positive: a.summary.sentiment_breakdown.positive || 0,
    neutral: a.summary.sentiment_breakdown.neutral || 0,
    negative: a.summary.sentiment_breakdown.negative || 0,
  })) || [];

  return (
    <div className="grain-bg min-h-screen">
      <DashboardHeader />
      <main className="max-w-[1400px] mx-auto px-6 md:px-10 py-8 md:py-12">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/" className="text-neutral-500 hover:text-neutral-900 transition-colors" data-testid="back-to-dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="text-[11px] uppercase tracking-[0.28em] text-neutral-500 font-body">Side-by-side</div>
        </div>

        <h1 className="font-heading text-4xl md:text-5xl font-bold text-neutral-950 mb-3 tracking-tight">Compare campaigns</h1>
        <p className="text-neutral-600 max-w-2xl mb-8">Select 2–4 past analyses to see how their sentiment landscapes stack up.</p>

        <div className="card-flat p-6 mb-8">
          <div className="text-[11px] uppercase tracking-[0.28em] text-neutral-500 font-body font-semibold mb-3">Pick analyses ({selected.length}/4)</div>
          {list.length === 0 && <div className="text-sm text-neutral-500">Run at least two analyses from the Dashboard first.</div>}
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {list.map((it) => (
              <li key={it.id} className="flex items-center gap-3 border border-[#E5E3DB] p-3 rounded-sm hover:bg-neutral-50 transition-colors">
                <Checkbox
                  checked={selected.includes(it.id)}
                  onCheckedChange={() => toggle(it.id)}
                  data-testid={`compare-check-${it.id}`}
                  className="rounded-sm"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-heading font-semibold truncate">{it.keyword}</div>
                  <div className="text-xs font-mono text-neutral-500">
                    {it.summary?.total_posts || 0} posts · +{it.summary?.sentiment_breakdown?.positive || 0} / −{it.summary?.sentiment_breakdown?.negative || 0}
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-5">
            <Button onClick={run} data-testid="run-compare" className="rounded-sm bg-neutral-900 hover:bg-neutral-800 text-white font-body">
              <GitCompare className="h-4 w-4 mr-2" /> Run comparison
            </Button>
          </div>
        </div>

        {result && (
          <div className="card-flat p-6" data-testid="compare-result">
            <div className="text-[11px] uppercase tracking-[0.28em] text-neutral-500 font-body font-semibold">Result</div>
            <div className="font-heading text-2xl font-semibold mt-1 mb-6">Sentiment counts side-by-side</div>
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={chartData}>
                <CartesianGrid stroke="#E5E3DB" strokeDasharray="2 4" />
                <XAxis dataKey="name" tick={{ fill: "#404040", fontSize: 12, fontFamily: "Chivo" }} stroke="#E5E3DB" />
                <YAxis tick={{ fill: "#737373", fontSize: 11, fontFamily: "IBM Plex Mono" }} stroke="#E5E3DB" allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 0, border: "1px solid #111", background: "#fff", fontFamily: "Chivo", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontFamily: "Chivo", fontSize: 12 }} />
                <Bar dataKey="positive" fill={SENTIMENT_COLORS.positive} />
                <Bar dataKey="neutral" fill={SENTIMENT_COLORS.neutral} />
                <Bar dataKey="negative" fill={SENTIMENT_COLORS.negative} />
              </BarChart>
            </ResponsiveContainer>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-8">
              {result.analyses.map((a) => (
                <div key={a.id} className="border border-[#E5E3DB] p-4 rounded-sm">
                  <div className="font-heading font-semibold text-lg truncate">{a.keyword}</div>
                  <div className="text-xs font-mono text-neutral-500 mt-1">{a.summary.total_posts} posts</div>
                  <div className="mt-3 space-y-1 text-sm font-body">
                    <div><span className="text-[#059669] font-mono mr-2">+{a.summary.sentiment_breakdown.positive || 0}</span> positive</div>
                    <div><span className="text-[#D97706] font-mono mr-2">={a.summary.sentiment_breakdown.neutral || 0}</span> neutral</div>
                    <div><span className="text-[#DC2626] font-mono mr-2">−{a.summary.sentiment_breakdown.negative || 0}</span> negative</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
