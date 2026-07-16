import { useState } from "react";
import { DOC } from "../lib/seed.js";
import { Btn, Input, Textarea, FieldLabel, Card, Badge, EmptyState, Hint } from "../components/ui.jsx";

export default function Requirements({ data, update }) {
  const { vers } = data;
  const [openDocs, setOpenDocs] = useState(() => new Set([0]));
  const [f, setF] = useState({ num: "", title: "", date: "", changes: "" });

  function submit(e) {
    e.preventDefault();
    const num = f.num.trim(), title = f.title.trim();
    if (!num || !title) return;
    update(d => ({
      ...d,
      vers: [...d.vers, {
        id: "v" + Date.now(), ver: num, title,
        date: f.date || new Date().toISOString().slice(0, 10),
        changes: f.changes.split("\n").map(s => s.trim()).filter(Boolean),
      }],
    }));
    setF({ num: "", title: "", date: "", changes: "" });
  }
  function del(id) {
    if (!confirm("Delete this version?")) return;
    update(d => ({ ...d, vers: d.vers.filter(v => v.id !== id) }));
  }
  function toggleDoc(i) {
    setOpenDocs(prev => { const next = new Set(prev); next.has(i) ? next.delete(i) : next.add(i); return next; });
  }

  const sorted = [...vers].sort((a, b) => (b.date || "").localeCompare(a.date || "") || b.ver.localeCompare(a.ver, undefined, { numeric: true }));

  return (
    <div>
      <div className="bg-[var(--panel)] border border-[var(--line)] border-l-4 border-l-[var(--purple)] rounded-2xl shadow-[var(--shadow-sm)] p-4 mb-4.5">
        <h2 className="text-sm font-bold text-[var(--purple)] mb-3">＋ Add a requirements version</h2>
        <form onSubmit={submit} className="grid gap-2.5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))" }}>
          <div><FieldLabel>Version</FieldLabel><Input required value={f.num} onChange={e => setF(v => ({ ...v, num: e.target.value }))} placeholder="e.g. 1.2" /></div>
          <div><FieldLabel>Title</FieldLabel><Input required value={f.title} onChange={e => setF(v => ({ ...v, title: e.target.value }))} placeholder="e.g. Client feedback round 2" /></div>
          <div><FieldLabel>Date</FieldLabel><Input type="date" value={f.date} onChange={e => setF(v => ({ ...v, date: e.target.value }))} /></div>
          <div className="col-span-full"><FieldLabel>Changes / new requirements (one per line)</FieldLabel><Textarea rows={3} value={f.changes} onChange={e => setF(v => ({ ...v, changes: e.target.value }))} placeholder="e.g. Buyer app: add loyalty points screen" /></div>
          <div className="col-span-full"><Btn type="submit" className="bg-[var(--purple)]">Add version</Btn></div>
        </form>
      </div>

      <Card className="mb-4.5">
        <h2 className="font-bold text-[15px] mb-3">Version history</h2>
        {sorted.length === 0 ? <EmptyState>No versions yet.</EmptyState> : sorted.map(v => (
          <div key={v.id} className="flex gap-2.5 items-start py-2.5 border-b border-dashed border-[var(--line)] last:border-none">
            <Badge tone="ver">v{v.ver}</Badge>
            <div className="flex-1 min-w-0">
              <h4 className="text-[13.5px] font-semibold">{v.title}</h4>
              <div className="text-[11.5px] text-[var(--muted)]">{v.date ? new Date(v.date + "T00:00:00Z").toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }) : ""}</div>
              {v.changes?.length > 0 && <ul className="mt-1.5 ml-4 list-disc text-xs space-y-0.5">{v.changes.map((c, i) => <li key={i}>{c}</li>)}</ul>}
            </div>
            <button onClick={() => del(v.id)} className="text-[var(--muted)] hover:bg-[var(--red-soft)] hover:text-[var(--red)] rounded-md px-2 py-1 text-lg leading-none">×</button>
          </div>
        ))}
      </Card>

      <h2 className="font-bold text-[15px] mb-2">Functional Flow — document content</h2>
      <Hint>Full content of the functional flow spec. Tap a section to expand.</Hint>
      <div className="space-y-2.5">
        {DOC.map((s, i) => (
          <div key={i} className="bg-[var(--panel)] border border-[var(--line)] rounded-2xl overflow-hidden shadow-[var(--shadow-sm)]">
            <button onClick={() => toggleDoc(i)} className="w-full flex items-center gap-2.5 px-4 py-3 text-left bg-[var(--panel-2)] font-display font-semibold text-[14.5px]">
              <span className={`text-[11px] text-[var(--muted)] transition-transform ${openDocs.has(i) ? "rotate-90" : ""}`}>▶</span>
              {s.sec}
            </button>
            {openDocs.has(i) && (
              <div className="px-4 pb-3.5 pt-1">
                {s.screens.map((sc, j) => (
                  <div key={j} className="border-t border-dashed border-[var(--line)] first:border-none py-2.5">
                    <h4 className="text-[13px] font-semibold mb-1.5">
                      {sc.n && <span className="text-[var(--muted)] font-medium text-[10.5px] uppercase tracking-wide mr-1.5">Screen {sc.n}</span>}
                      {sc.t}
                    </h4>
                    <ul className="ml-4 list-disc space-y-1 text-[13px]">
                      {sc.items.map((it, k) => <li key={k}>{it}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
