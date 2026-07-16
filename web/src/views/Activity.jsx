import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../firebase.js";
import { Card, EmptyState, Btn } from "../components/ui.jsx";

const ACTION_ICONS = {
  "task added": "＋", "task edited": "✎", "task status changed": "↻", "task deleted": "×",
  "milestone added": "＋", "milestone status changed": "↻",
  "requirement version added": "＋",
  "plan task saved": "✎", "plan task deleted": "×",
};

function fmtDate(ts) {
  return new Date(ts).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}
function fmtTime(ts) {
  return new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export default function Activity({ projectId }) {
  const [pageSize, setPageSize] = useState(100);
  const [entries, setEntries] = useState(null);

  useEffect(() => {
    setEntries(null);
    const q = query(collection(db, "activityLog", projectId, "entries"), orderBy("timestamp", "desc"), limit(pageSize));
    const unsub = onSnapshot(q, snap => setEntries(snap.docs.map(d => ({ id: d.id, ...d.data() }))), e => {
      console.error("Activity listener error:", e.message);
      setEntries([]);
    });
    return unsub;
  }, [projectId, pageSize]);

  if (entries === null) return <EmptyState>Loading…</EmptyState>;
  if (entries.length === 0) return <EmptyState>No activity logged yet.</EmptyState>;

  const groups = [];
  let lastDay = null;
  for (const e of entries) {
    const day = new Date(e.timestamp).toDateString();
    if (day !== lastDay) { groups.push({ day, items: [] }); lastDay = day; }
    groups[groups.length - 1].items.push(e);
  }

  return (
    <div className="space-y-4">
      {groups.map(g => (
        <Card key={g.day}>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)] mb-3">{fmtDate(g.items[0].timestamp)}</h2>
          <div className="divide-y divide-dashed divide-[var(--line)]">
            {g.items.map(e => (
              <div key={e.id} className="flex gap-3 items-start py-2.5 first:pt-0">
                <span className="w-6 h-6 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center text-xs font-bold shrink-0">
                  {ACTION_ICONS[e.action] || "•"}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm"><strong>{e.who}</strong> {e.action}{e.detail ? `: ${e.detail}` : ""}</div>
                  <div className="text-[11px] text-[var(--muted)]">{fmtTime(e.timestamp)}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}
      {entries.length >= pageSize && (
        <div className="text-center"><Btn variant="secondary" onClick={() => setPageSize(n => n + 100)}>Load more</Btn></div>
      )}
    </div>
  );
}
