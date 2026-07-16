import { useState } from "react";
import { PHASES } from "../lib/seed.js";
import { d, fdate, todaySerial, isoToSerial, serialToISO } from "../lib/dates.js";
import { Btn, Input, Select, FieldLabel, Hint } from "../components/ui.jsx";

function planStart(plan) { return Math.min(...plan.map(p => p.start), 46174); }
function planEnd(plan) { return Math.max(...plan.map(p => p.end), 46326); }

export default function Plan({ data, update, showDev, showProg }) {
  const { plan } = data;
  const [editingId, setEditingId] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [f, setF] = useState(null);

  function openEditor(id) {
    if (id) {
      const r = plan.find(x => x.id === id);
      setF({ name: r.name, owner: r.owner, phase: r.phase, start: serialToISO(r.start), end: serialToISO(r.end), pct: r.pct, status: r.status });
      setEditingId(id);
    } else {
      setF({ name: "", owner: "", phase: 1, start: "", end: "", pct: 0, status: "Not Started" });
      setEditingId(null);
    }
    setEditorOpen(true);
  }
  function closeEditor() { setEditorOpen(false); setF(null); setEditingId(null); }
  function save() {
    const name = f.name.trim(); if (!name) return;
    let s = f.start ? isoToSerial(f.start) : todaySerial();
    let en = f.end ? isoToSerial(f.end) : s; if (en < s) en = s;
    const pct = Math.max(0, Math.min(100, +f.pct || 0));
    const phase = +f.phase;
    update(d0 => {
      if (editingId) {
        return { ...d0, plan: d0.plan.map(r => r.id === editingId ? { ...r, name, owner: f.owner.trim(), phase, start: s, end: en, pct, status: f.status } : r) };
      }
      const code = phase + "." + (d0.plan.filter(x => x.phase === phase).length + 1);
      return { ...d0, plan: [...d0.plan, { id: "p" + Date.now(), code, phase, name, owner: f.owner.trim(), start: s, end: en, pct, status: f.status }] };
    });
    closeEditor();
  }
  function del() {
    if (!editingId || !confirm("Delete this plan task?")) return;
    update(d0 => ({ ...d0, plan: d0.plan.filter(x => x.id !== editingId) }));
    closeEditor();
  }

  const start = planStart(plan), end = planEnd(plan), span = end - start + 1, t = todaySerial();
  const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  let cur = d(start); cur = new Date(Date.UTC(cur.getUTCFullYear(), cur.getUTCMonth(), 1));
  const parts = [];
  while (cur.getTime() <= d(end).getTime()) {
    const mS = Math.max(start, Math.floor((cur.getTime() - Date.UTC(1899, 11, 30)) / 86400000));
    const nxt = new Date(Date.UTC(cur.getUTCFullYear(), cur.getUTCMonth() + 1, 1));
    const mE = Math.min(end + 1, Math.floor((nxt.getTime() - Date.UTC(1899, 11, 30)) / 86400000));
    parts.push({ label: names[cur.getUTCMonth()], w: (mE - mS) / span * 100 });
    cur = nxt;
  }
  const sorted = [...plan].sort((a, b) => a.phase - b.phase || a.start - b.start || a.code.localeCompare(b.code, undefined, { numeric: true }));
  let lastPhase = 0;

  return (
    <div>
      <div className="flex flex-wrap gap-2 items-center mb-3.5">
        <Btn onClick={() => openEditor(null)}>＋ Add task</Btn>
        <span className="text-xs text-[var(--muted)] flex-1">Tap any row to edit. Timeline: 1 Jun – 31 Oct 2026.</span>
      </div>

      {editorOpen && (
        <div className="bg-[var(--panel)] border border-[var(--line)] border-l-4 border-l-[var(--blue)] rounded-2xl shadow-[var(--shadow-sm)] p-4 mb-3.5">
          <h2 className="text-sm font-bold text-[var(--blue)] mb-3">{editingId ? "Edit task" : "New task"}</h2>
          <div className="grid gap-2.5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))" }}>
            <div className="sm:col-span-2"><FieldLabel>Task name</FieldLabel><Input value={f.name} onChange={e => setF(v => ({ ...v, name: e.target.value }))} /></div>
            <div><FieldLabel>Owner</FieldLabel><Input value={f.owner} onChange={e => setF(v => ({ ...v, owner: e.target.value }))} /></div>
            <div><FieldLabel>Phase</FieldLabel>
              <Select value={f.phase} onChange={e => setF(v => ({ ...v, phase: e.target.value }))}>
                {Object.entries(PHASES).map(([n, p]) => <option key={n} value={n}>{n}. {p.name}</option>)}
              </Select>
            </div>
            <div><FieldLabel>Start date</FieldLabel><Input type="date" value={f.start} onChange={e => setF(v => ({ ...v, start: e.target.value }))} /></div>
            <div><FieldLabel>End date</FieldLabel><Input type="date" value={f.end} onChange={e => setF(v => ({ ...v, end: e.target.value }))} /></div>
            <div><FieldLabel>% complete</FieldLabel><Input type="number" min="0" max="100" step="5" value={f.pct} onChange={e => setF(v => ({ ...v, pct: e.target.value }))} /></div>
            <div><FieldLabel>Status</FieldLabel>
              <Select value={f.status} onChange={e => setF(v => ({ ...v, status: e.target.value }))}>
                <option>Not Started</option><option>In Progress</option><option>Completed</option>
              </Select>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap mt-3">
            <Btn onClick={save}>Save</Btn>
            <Btn variant="secondary" onClick={closeEditor}>Cancel</Btn>
            {editingId && <Btn variant="danger" className="ml-auto" onClick={del}>Delete</Btn>}
          </div>
        </div>
      )}

      <div className="bg-[var(--panel)] border border-[var(--line)] rounded-2xl shadow-[var(--shadow-sm)] p-4 overflow-x-auto">
        <div className="min-w-[860px] relative">
          <div className="flex ml-[260px] border-b border-[var(--line)] text-[10.5px] uppercase tracking-wide text-[var(--muted)]">
            {parts.map((p, i) => <div key={i} style={{ width: p.w + "%" }} className="border-l border-[var(--line)] px-1.5 py-0.5 overflow-hidden">{p.label}</div>)}
          </div>
          <div className="relative">
            {t >= start && t <= end && (
              <div className="absolute top-0 bottom-0 w-0.5 bg-[var(--red)] z-10" style={{ left: `calc(260px + (100% - 260px)*${(t - start) / span})` }}>
                <span className="absolute -top-0.5 left-1 text-[9.5px] text-[var(--red)] font-semibold">Today</span>
              </div>
            )}
            {sorted.map(r => {
              const showPhaseHead = r.phase !== lastPhase;
              lastPhase = r.phase;
              const ph = PHASES[r.phase] || { name: "Phase " + r.phase, color: "#6B7370" };
              const left = (r.start - start) / span * 100, w = Math.max((r.end - r.start + 1) / span * 100, 0.6);
              return (
                <div key={r.id}>
                  {showPhaseHead && <div className="bg-[var(--grey-soft)] font-semibold text-xs h-7 flex items-center pl-2 rounded-md my-2 font-display" style={{ color: ph.color }}>{r.phase}. {ph.name}</div>}
                  <div onClick={() => openEditor(r.id)} className={`flex items-center h-8 border-b border-dashed border-[var(--line)] cursor-pointer hover:bg-[var(--panel-2)] ${r.id === editingId ? "bg-[var(--accent-soft)]" : ""}`}>
                    <div className="w-[260px] shrink-0 text-xs pr-2.5 whitespace-nowrap overflow-hidden text-ellipsis">
                      {r.code} {r.name} {showDev && <small className="text-[var(--muted)]">· {r.owner}</small>}
                    </div>
                    <div className="relative flex-1 h-full">
                      <div className="absolute top-1.5 h-[18px] rounded-md text-[9.5px] text-white flex items-center px-1.5 overflow-hidden whitespace-nowrap" style={{ left: left + "%", width: w + "%", background: ph.color }}>
                        {showProg && r.pct > 0 && r.pct < 100 && <span className="absolute inset-0 bg-white/35" style={{ width: r.pct + "%" }} />}
                        <span className="relative">{fdate(r.start)}–{fdate(r.end)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mt-3 text-[11.5px] text-[var(--muted)]">
          {Object.entries(PHASES).map(([n, p]) => (
            <span key={n} className="inline-flex items-center gap-1"><i className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: p.color }} />{p.name}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
