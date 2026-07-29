const REGION_NAMES = {
  US: "United States", IN: "India", GB: "United Kingdom", CA: "Canada", AU: "Australia",
  DE: "Germany", FR: "France", RU: "Russia", CN: "China", JP: "Japan", BR: "Brazil",
  ZA: "South Africa", MX: "Mexico", IT: "Italy", ES: "Spain", NG: "Nigeria",
  PK: "Pakistan", BD: "Bangladesh", ID: "Indonesia", TR: "Turkey", IR: "Iran",
  IL: "Israel", UA: "Ukraine", KR: "South Korea", SA: "Saudi Arabia",
};
const flag = (cc) => cc?.length === 2 ? String.fromCodePoint(...[...cc.toUpperCase()].map(c => 127397 + c.charCodeAt())) : "🌐";

export default function RegionsPanel({ regions = {} }) {
  const items = Object.entries(regions).sort((a, b) => b[1] - a[1]);
  const total = items.reduce((a, [, v]) => a + v, 0);
  return (
    <div className="card-flat p-6" data-testid="regions-panel">
      <div className="text-[11px] uppercase tracking-[0.28em] text-neutral-500 font-body font-semibold">Geography</div>
      <div className="font-heading text-xl font-semibold mt-1 mb-4">Where posts originate</div>
      {items.length === 0 && (
        <div className="text-sm text-neutral-500 border border-dashed border-[#E5E3DB] p-4 rounded-sm">
          No geographic signals detected for this keyword.
        </div>
      )}
      <ul className="space-y-3">
        {items.slice(0, 8).map(([cc, count]) => {
          const pct = total ? Math.round((count / total) * 100) : 0;
          return (
            <li key={cc} className="flex items-center gap-3" data-testid={`region-${cc}`}>
              <span className="text-xl leading-none w-6" aria-hidden>{flag(cc)}</span>
              <div className="flex-1">
                <div className="flex justify-between text-sm font-body">
                  <span className="text-neutral-800">{REGION_NAMES[cc] || cc}</span>
                  <span className="font-mono text-neutral-500">{count} · {pct}%</span>
                </div>
                <div className="h-1.5 bg-neutral-100 rounded-sm mt-1">
                  <div className="h-full bg-neutral-900" style={{ width: `${pct}%` }} />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
