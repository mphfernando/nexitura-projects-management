import { fdate, todaySerial } from "../lib/dates.js";
import { EmptyState, Card } from "../components/ui.jsx";

function Metric({ big, label, tone }) {
  const borders = { green: "var(--green)", amber: "var(--amber)", red: "var(--red)", blue: "var(--blue)" };
  return (
    <div className="bg-[var(--panel)] border border-[var(--line)] rounded-xl p-4 border-t-[3px]" style={{ borderTopColor: borders[tone] || "var(--line)" }}>
      <b className="block text-2xl font-bold font-display">{big}</b>
      <span className="text-[var(--muted)] text-[11px] uppercase tracking-wide">{label}</span>
    </div>
  );
}

export default function Overview({ data, showProg, showDev }) {
  if (!showProg) {
    return <EmptyState>Progress metrics are hidden for your role.</EmptyState>;
  }
  const { tasks, plan, miles } = data;
  const done = tasks.filter(t => t.status === "Completed").length;
  const inProg = tasks.filter(t => t.status === "In Progress").length;
  const notStarted = tasks.length - done - inProg;
  const bugs = tasks.filter(t => t.cat === "Bug" && t.status !== "Completed").length;
  const totDur = plan.reduce((a, r) => a + (r.end - r.start + 1), 0) || 1;
  const planPct = Math.round(plan.reduce((a, r) => a + (r.pct / 100) * (r.end - r.start + 1), 0) / totDur * 100);
  const launch = miles.find(m => /official launch/i.test(m.name));
  const nextMile = [...miles].filter(m => m.status !== "Completed").sort((a, b) => a.when - b.when)[0];
  const daysAway = nextMile ? nextMile.when - todaySerial() : null;

  const workload = {};
  if (showDev) {
    for (const t of tasks) {
      if (!t.who || t.status === "Completed") continue;
      workload[t.who] = (workload[t.who] || 0) + 1;
    }
  }
  const workloadRows = Object.entries(workload).sort((a, b) => b[1] - a[1]);
  const maxWorkload = Math.max(1, ...workloadRows.map(([, n]) => n));

  return (
    <div className="space-y-5">
      {tasks.length > 0 && (
        <Card>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)] mb-2.5">Task status</h2>
          <div className="flex h-4 rounded-full overflow-hidden bg-[var(--grey-soft)]">
            {done > 0 && <div style={{ width: `${done / tasks.length * 100}%`, background: "var(--green)" }} title={`${done} completed`} />}
            {inProg > 0 && <div style={{ width: `${inProg / tasks.length * 100}%`, background: "var(--amber)" }} title={`${inProg} in progress`} />}
            {notStarted > 0 && <div style={{ width: `${notStarted / tasks.length * 100}%`, background: "var(--grey-soft)" }} title={`${notStarted} not started`} />}
          </div>
          <div className="flex flex-wrap gap-4 mt-2.5 text-xs text-[var(--muted)]">
            <span className="inline-flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: "var(--green)" }} />{done} completed</span>
            <span className="inline-flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: "var(--amber)" }} />{inProg} in progress</span>
            <span className="inline-flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-sm inline-block bg-[var(--grey-soft)] border border-[var(--line)]" />{notStarted} not started</span>
          </div>
        </Card>
      )}

      <div className="grid gap-2.5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))" }}>
        <Metric big={`${done}/${tasks.length}`} label="Tasks done" tone="green" />
        <Metric big={inProg} label="In progress" tone="amber" />
        <Metric big={bugs} label="Open bugs" tone="red" />
        <Metric big={`${planPct || 0}%`} label="Plan progress" tone="blue" />
      </div>

      {nextMile && (
        <Card className="border-l-4 border-l-[var(--accent)]">
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Next milestone</span>
          <div className="flex items-baseline gap-3 mt-1 flex-wrap">
            <h2 className="text-lg font-bold">{nextMile.name}</h2>
            <span className="text-sm text-[var(--accent)] font-semibold">
              {daysAway === 0 ? "today" : daysAway > 0 ? `${daysAway} day${daysAway === 1 ? "" : "s"} away` : `${-daysAway} day${-daysAway === 1 ? "" : "s"} overdue`}
            </span>
          </div>
          <div className="text-xs text-[var(--muted)] mt-0.5">{fdate(nextMile.when)}{launch && launch.id !== nextMile.id ? ` · Official launch: ${fdate(launch.when)}` : ""}</div>
        </Card>
      )}

      {showDev && workloadRows.length > 0 && (
        <Card>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)] mb-3">Team workload (open tasks)</h2>
          <div className="space-y-2.5">
            {workloadRows.map(([who, count]) => (
              <div key={who} className="flex items-center gap-3">
                <span className="text-sm w-28 shrink-0 truncate">{who}</span>
                <div className="flex-1 h-2.5 rounded-full bg-[var(--grey-soft)] overflow-hidden">
                  <div className="h-full bg-[var(--accent)] rounded-full" style={{ width: `${count / maxWorkload * 100}%` }} />
                </div>
                <span className="text-xs text-[var(--muted)] w-16 text-right shrink-0">{count} open</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
