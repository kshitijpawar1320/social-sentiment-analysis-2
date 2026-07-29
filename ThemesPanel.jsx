export default function ThemesPanel({ themes = [], emotions = {} }) {
  const max = themes[0]?.[1] || 1;
  const emoList = Object.entries(emotions).sort((a, b) => b[1] - a[1]);
  return (
    <div className="card-flat p-6" data-testid="themes-panel">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="text-[11px] uppercase tracking-[0.28em] text-neutral-500 font-body font-semibold">Top Themes</div>
          <div className="font-heading text-xl font-semibold mt-1 mb-5">What people are talking about</div>
          {themes.length === 0 && <div className="text-sm text-neutral-500">No themes detected.</div>}
          <div className="flex flex-wrap gap-2">
            {themes.slice(0, 14).map(([t, c]) => {
              const size = 12 + Math.round(((c || 0) / max) * 14);
              const weight = 400 + Math.round(((c || 0) / max) * 4) * 100;
              return (
                <span
                  key={t}
                  data-testid={`theme-${t}`}
                  className="border border-[#E5E3DB] px-3 py-1 rounded-sm bg-white text-neutral-800 hover:bg-neutral-900 hover:text-white transition-colors cursor-default"
                  style={{ fontSize: `${size}px`, fontWeight: weight }}
                >
                  {t} <span className="font-mono text-xs opacity-60 ml-1">{c}</span>
                </span>
              );
            })}
          </div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-[0.28em] text-neutral-500 font-body font-semibold">Emotion Mix</div>
          <div className="font-heading text-xl font-semibold mt-1 mb-5">Dominant feelings</div>
          {emoList.length === 0 && <div className="text-sm text-neutral-500">No emotions detected.</div>}
          <ul className="space-y-3">
            {emoList.slice(0, 6).map(([e, c]) => {
              const total = emoList.reduce((a, [, v]) => a + v, 0);
              const pct = total ? Math.round((c / total) * 100) : 0;
              return (
                <li key={e}>
                  <div className="flex justify-between text-sm mb-1 font-body">
                    <span className="capitalize text-neutral-800">{e}</span>
                    <span className="font-mono text-neutral-500">{c} · {pct}%</span>
                  </div>
                  <div className="h-1.5 bg-neutral-100 rounded-sm">
                    <div className="h-full bg-neutral-900" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
