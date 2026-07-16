import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase.js";
import { submitBugReport } from "../lib/bugs.js";
import { logActivity } from "../lib/activity.js";
import { useAppState } from "../hooks/useAppState.jsx";
import { Btn, Input, Textarea, FieldLabel, Card, Badge, EmptyState, Hint } from "../components/ui.jsx";

function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return Math.floor(s / 60) + "m ago";
  if (s < 86400) return Math.floor(s / 3600) + "h ago";
  return Math.floor(s / 86400) + "d ago";
}

export default function Bugs({ project, update }) {
  const { profile, isUnrestricted } = useAppState();
  const [reports, setReports] = useState(null);
  const [f, setF] = useState({ title: "", description: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "projects", project.id, "bugReports"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, snap => setReports(snap.docs.map(d => ({ id: d.id, ...d.data() }))), e => {
      console.error("Bug reports listener error:", e.message);
      setReports([]);
    });
    return unsub;
  }, [project.id]);

  async function submit(e) {
    e.preventDefault();
    const title = f.title.trim(); if (!title) return;
    setBusy(true);
    try {
      await submitBugReport({ project, title, description: f.description.trim(), profile });
      setF({ title: "", description: "" });
    } finally { setBusy(false); }
  }

  async function addToTracker(report) {
    update(d => {
      const week = d.weeks.find(w => w.start <= todaySerialSafe() && todaySerialSafe() <= w.end) || d.weeks[0];
      const task = { id: "t" + Date.now(), week: week.id, cat: "Bug", priority: "High", whoUid: "", who: "", whoEmail: "", name: report.title, desc: report.description, status: "Not Started" };
      return { ...d, tasks: [...d.tasks, task] };
    });
    await updateDoc(doc(db, "projects", project.id, "bugReports", report.id), { status: "added" });
    logActivity(project.id, profile, "task added", `${report.title} (from bug report)`);
  }

  function todaySerialSafe() {
    // local import avoided to keep this file self-contained; matches lib/dates.js todaySerial()
    return Math.floor((Date.now() - Date.UTC(1899, 11, 30)) / 86400000);
  }

  return (
    <div>
      <div className="bg-[var(--panel)] border border-[var(--line)] border-l-4 border-l-[var(--red)] rounded-2xl shadow-[var(--shadow-sm)] p-4 mb-4.5">
        <h2 className="text-sm font-bold text-[var(--red)] mb-1.5">🐞 Report a bug</h2>
        <Hint>Describe what went wrong — this notifies the project's Admins right away.</Hint>
        <form onSubmit={submit} className="space-y-2.5">
          <div><FieldLabel>Title</FieldLabel><Input required value={f.title} onChange={e => setF(v => ({ ...v, title: e.target.value }))} placeholder="e.g. Checkout button does nothing on mobile" /></div>
          <div><FieldLabel>Description (optional)</FieldLabel><Textarea rows={3} value={f.description} onChange={e => setF(v => ({ ...v, description: e.target.value }))} placeholder="Steps to reproduce, what you expected, what happened…" /></div>
          <Btn type="submit" variant="danger" disabled={busy}>{busy ? "Submitting…" : "Submit bug report"}</Btn>
        </form>
      </div>

      <Card>
        <h2 className="font-bold text-[15px] mb-1">Reported bugs</h2>
        <Hint>{isUnrestricted ? "Add a report straight to the Weekly Tracker once you've triaged it." : "Everyone with access to this project can see reports here."}</Hint>
        {reports === null ? (
          <EmptyState>Loading…</EmptyState>
        ) : reports.length === 0 ? (
          <EmptyState>No bugs reported yet.</EmptyState>
        ) : (
          <div className="divide-y divide-dashed divide-[var(--line)]">
            {reports.map(r => (
              <div key={r.id} className="py-3 flex flex-wrap gap-2.5 items-start first:pt-0">
                <div className="flex-1 min-w-[180px]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold">{r.title}</h3>
                    <Badge tone={r.status === "added" ? "done" : "high"}>{r.status === "added" ? "Added to tracker" : "New"}</Badge>
                  </div>
                  {r.description && <p className="text-xs text-[var(--muted)] mt-1">{r.description}</p>}
                  <p className="text-[11px] text-[var(--muted)] mt-1">Reported by {r.reportedBy} · {timeAgo(r.createdAt)}</p>
                </div>
                {isUnrestricted && r.status !== "added" && (
                  <Btn variant="secondary" onClick={() => addToTracker(r)}>Add to Tracker</Btn>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
