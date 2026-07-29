import { Link } from "react-router-dom";
import { Newspaper } from "lucide-react";

export default function DashboardHeader() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#F8F7F5]/85 border-b border-[#E5E3DB]">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group" data-testid="brand-link">
          <div className="h-9 w-9 bg-neutral-900 text-white grid place-items-center rounded-sm">
            <Newspaper className="h-4 w-4" />
          </div>
          <div>
            <div className="font-heading text-xl font-bold tracking-tight leading-none">Political Pulse</div>
            <div className="text-[10px] uppercase tracking-[0.28em] text-neutral-500 font-body mt-1">Sentiment · Engagement · Themes</div>
          </div>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-body">
          <Link to="/" data-testid="nav-dashboard" className="text-neutral-700 hover:text-neutral-950 transition-colors">Dashboard</Link>
          <Link to="/compare" data-testid="nav-compare" className="text-neutral-700 hover:text-neutral-950 transition-colors">Compare</Link>
          <a
            href="https://en.wikipedia.org/wiki/Political_consulting"
            target="_blank"
            rel="noreferrer"
            data-testid="nav-methodology"
            className="hidden md:inline text-neutral-500 hover:text-neutral-950 transition-colors"
          >
            Methodology
          </a>
        </nav>
      </div>
    </header>
  );
}
