import { useState } from "react";
import { fdate, isoToSerial } from "../lib/dates.js";
import { stTone, NEXT_STATUS } from "../lib/badges.js";
import { logActivity } from "../lib/activity.js";
import { useAppState } from "../hooks/useAppState.jsx";
import { Btn, Input, FieldLabel, Card, Badge, EmptyState, Hint } from "../components/ui.jsx";

export default function Milestones({ project, data, update, canAdd, canEdit, canDelete }) {
  const { profile } = useAppState();
  const { miles } = data;
  const [f, setF] = useState({ name: "", date: "", note: "" });
  const log = (action, detail) => logActivity(project.id, profile, action, detail);

  function submit(e) {
    e.preventDefault();
    const name = f.name.trim(); if (!name || !f.date) return;
    update(d => ({ ...d, miles: [...d.miles, { id: "m" + Date.now(), name, note: f.note.trim(), when: isoToSerial(f.date), status: "Not Started" }] }));
    log("milestone added", name);
    setF({ name: "", date: "", note: "" });
  }
  function cycleStatus(id) {
    const m = miles.find(x => x.id === id);
    const next = NEXT_STATUS[m.status];
    update(d => ({ ...d, miles: d.miles.map(x => x.id === id ? { ...x, status: next } : x) }));
    log("milestone status changed", `"${m.name}" → ${next}`);
  }
  function del(id) {
    const m = miles.find(x => x.id === id);
    if (!confirm("Delete this milestone?")) return;
    update(d => ({ ...d, miles: d.miles.filter(x => x.id !== id) }));
    log("milestone deleted", m?.name);
  }

  const sorted = [...miles].sort((a, b) => a.when - b.when);

  return (
    <div>
      {canAdd && (
        <div className="bg-[var(--panel)] border border-[var(--line)] border-l-4 border-l-[var(--green)] rounded-2xl shadow-[var(--shadow-sm)] p-4 mb-4.5">
          <h2 className="text-sm font-bold text-[var(--green)] mb-3">＋ Add a milestone</h2>
          <form onSubmit={submit} className="grid gap-2.5 sm:grid-cols-2">
            <div><FieldLabel>Milestone name</FieldLabel><Input required value={f.name} onChange={e => setF(v => ({ ...v, name: e.target.value }))} placeholder="e.g. Beta release to client" /></div>
            <div><FieldLabel>Target date</FieldLabel><Input type="date" required value={f.date} onChange={e => setF(v => ({ ...v, date: e.target.value }))} /></div>
            <div className="col-span-full"><FieldLabel>Note (optional)</FieldLabel><Input value={f.note} onChange={e => setF(v => ({ ...v, note: e.target.value }))} placeholder="What does this milestone mean?" /></div>
            <div className="col-span-full"><Btn type="submit">Add milestone</Btn></div>
          </form>
        </div>
      )}

      <Card>
        <h2 className="font-bold text-[15px] mb-1">Milestones</h2>
        <Hint>Tap a status badge to cycle it. Sorted by date.</Hint>
        {sorted.length === 0 ? <EmptyState>No milestones yet.</EmptyState> : sorted.map(m => (
          <div key={m.id} data-milestone={m.id} className="flex gap-3 items-start py-3.5 border-b border-dashed border-[var(--line)] last:border-none flex-wrap">
            <span className={`w-3 h-3 rounded-full mt-1 border-[3px] shrink-0 ${m.status === "Completed" ? "bg-[var(--green)] border-[var(--green-soft)]" : m.status === "In Progress" ? "bg-[var(--amber)] border-[var(--amber-soft)]" : "bg-white border-[var(--grey-soft)]"}`} />
            <div className="flex-1 min-w-[160px]">
              <h3 className="text-sm font-semibold">{m.name}</h3>
              {m.note && <p className="text-xs text-[var(--muted)]">{m.note}</p>}
            </div>
            <div className="flex gap-1.5 items-center shrink-0 ml-auto">
              <span className="text-[11.5px] text-[var(--muted)] whitespace-nowrap">{fdate(m.when)}</span>
              <Badge tone={stTone(m.status)} onClick={canEdit ? () => cycleStatus(m.id) : undefined}>{m.status}</Badge>
              {canDelete && <button onClick={() => del(m.id)} className="text-[var(--muted)] hover:bg-[var(--red-soft)] hover:text-[var(--red)] rounded-md px-2 py-1 text-lg leading-none">×</button>}
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
