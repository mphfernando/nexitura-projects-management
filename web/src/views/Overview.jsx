import { fdate } from "../lib/dates.js";
import { EmptyState } from "../components/ui.jsx";

function Metric({ big, label }) {
  return (
    <div className="bg-[var(--panel)] border border-[var(--line)] rounded-xl p-4">
      <b className="block text-2xl font-bold font-display">{big}</b>
      <span className="text-[var(--muted)] text-[11px] uppercase tracking-wide">{label}</span>
    </div>
  );
}

export default function Overview({ data, showProg }) {
  if (!showProg) {
    return <EmptyState>Progress metrics are hidden for your role.</EmptyState>;
  }
  const { tasks, plan, miles } = data;
  const done = tasks.filter(t => t.status === "Completed").length;
  const bugs = tasks.filter(t => t.cat === "Bug" && t.status !== "Completed").length;
  const inProg = tasks.filter(t => t.status === "In Progress").length;
  const totDur = plan.reduce((a, r) => a + (r.end - r.start + 1), 0) || 1;
  const planPct = Math.round(plan.reduce((a, r) => a + (r.pct / 100) * (r.end - r.start + 1), 0) / totDur * 100);
  const launch = miles.find(m => /official launch/i.test(m.name));
  const nextMile = [...miles].filter(m => m.status !== "Completed").sort((a, b) => a.when - b.when)[0];

  return (
    <div className="grid gap-2.5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))" }}>
      <Metric big={`${done}/${tasks.length}`} label="Tasks done" />
      <Metric big={inProg} label="In progress" />
      <Metric big={bugs} label="Open bugs" />
      <Metric big={`${planPct || 0}%`} label="Plan progress" />
      <Metric big={launch ? fdate(launch.when) : "—"} label="Official launch" />
      <Metric big={nextMile ? fdate(nextMile.when) : "—"} label={nextMile ? "Next: " + nextMile.name : "Next milestone"} />
    </div>
  );
}
