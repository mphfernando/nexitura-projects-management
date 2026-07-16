import { useEffect, useState } from "react";
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase.js";
import { submitBugReport } from "../lib/bugs.js";
import { logActivity } from "../lib/activity.js";
import { notifyAssignment } from "../lib/notify.js";
import { useAppState } from "../hooks/useAppState.jsx";
import { Btn, Input, Select, Textarea, FieldLabel, Card, Badge, EmptyState, Hint } from "../components/ui.jsx";

function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return Math.floor(s / 60) + "m ago";
  if (s < 86400) return Math.floor(s / 3600) + "h ago";
  return Math.floor(s / 86400) + "d ago";
}

// Resolves a report's real-time display status by checking the linked
// Tracker task, so a bug shows "Completed" the moment that task is done —
// not just "Added to tracker" forever.
function reportStatus(report, tasks) {
  if (report.status !== "added" || !report.taskId) return report.status === "added" ? "added" : "new";
  const task = tasks.find(t => t.id === report.taskId);
  if (!task) return "added";
  return task.status === "Completed" ? "completed" : "added";
}

function AddToTrackerForm({ project, weeks, onDone }) {
  const members = project.members || [];
  const now = Math.floor((Date.now() - Date.UTC(1899, 11, 30)) / 86400000);
  const cur = weeks.find(x => x.start <= now && now <= x.end);
  const [weekId, setWeekId] = useState(cur ? cur.id : (weeks[0] ? weeks[0].id : ""));
  const [whoUid, setWhoUid] = useState("");

  async function confirm() {
    if (!weekId) return;
    const m = members.find(x => x.uid === whoUid);
    await onDone(weekId, m);
  }

  return (
    <div className="mt-2.5 p-3 bg-[var(--accent-soft)] rounded-xl flex flex-wrap gap-2 items-end">
      <div className="min-w-[140px]">
        <FieldLabel>Week</FieldLabel>
        <Select value={weekId} onChange={e => setWeekId(e.target.value)}>
          {weeks.map(w => <option key={w.id} value={w.id}>{w.label}</option>)}
        </Select>
      </div>
      <div className="min-w-[140px]">
        <FieldLabel>Assign to</FieldLabel>
        <Select value={whoUid} onChange={e => setWhoUid(e.target.value)}>
          <option value="">Unassigned</option>
          {members.map(m => <option key={m.uid} value={m.uid}>{m.name}</option>)}
        </Select>
      </div>
      <Btn onClick={confirm}>Confirm</Btn>
    </div>
  );
}

export default function Bugs({ project, data, update }) {
  const { profile } = useAppState();
  const [reports, setReports] = useState(null);
  const [f, setF] = useState({ title: "", description: "" });
  const [busy, setBusy] = useState(false);
  const [addingId, setAddingId] = useState(null);

  const isSuperAdmin = profile.role === "superadmin";
  const isClient = profile.role === "client";

  useEffect(() => {
    const base = collection(db, "projects", project.id, "bugReports");
    const q = isSuperAdmin
      ? query(base, orderBy("createdAt", "desc"))
      : query(base, where("reportedByUid", "==", profile.uid), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, snap => setReports(snap.docs.map(d => ({ id: d.id, ...d.data() }))), e => {
      console.error("Bug reports listener error:", e.message);
      setReports([]);
    });
    return unsub;
  }, [project.id, isSuperAdmin, profile.uid]);

  async function submit(e) {
    e.preventDefault();
    const title = f.title.trim(); if (!title) return;
    setBusy(true);
    try {
      await submitBugReport({ project, title, description: f.description.trim(), profile });
      setF({ title: "", description: "" });
    } finally { setBusy(false); }
  }

  async function addToTracker(report, weekId, member) {
    const taskId = "t" + Date.now();
    update(d => ({
      ...d,
      tasks: [...d.tasks, {
        id: taskId, week: weekId, cat: "Bug", priority: "High",
        whoUid: member ? member.uid : "", who: member ? member.name : "", whoEmail: member ? member.email : "",
        name: report.title, desc: report.description, status: "Not Started",
      }],
    }));
    await updateDoc(doc(db, "projects", project.id, "bugReports", report.id), { status: "added", taskId });
    logActivity(project.id, profile, "task added", `${report.title} (from bug report)`);
    if (member) {
      const week = data.weeks.find(w => w.id === weekId);
      notifyAssignment({ toUid: member.uid, projectId: project.id, projectName: project.name, taskName: report.title, weekLabel: week ? week.label : "" });
    }
    setAddingId(null);
  }

  const statusBadge = { new: { tone: "high", label: "New" }, added: { tone: "prog", label: "Added to tracker" }, completed: { tone: "done", label: "Completed" } };

  return (
    <div>
      {!isSuperAdmin && (
        <div className="bg-[var(--panel)] border border-[var(--line)] border-l-4 border-l-[var(--red)] rounded-2xl shadow-[var(--shadow-sm)] p-4 mb-4.5">
          <h2 className="text-sm font-bold text-[var(--red)] mb-1.5">🐞 Report a bug</h2>
          <Hint>Describe what went wrong — this notifies the Super Admin right away.</Hint>
          <form onSubmit={submit} className="space-y-2.5">
            <div><FieldLabel>Title</FieldLabel><Input required value={f.title} onChange={e => setF(v => ({ ...v, title: e.target.value }))} placeholder="e.g. Checkout button does nothing on mobile" /></div>
            <div><FieldLabel>Description (optional)</FieldLabel><Textarea rows={3} value={f.description} onChange={e => setF(v => ({ ...v, description: e.target.value }))} placeholder="Steps to reproduce, what you expected, what happened…" /></div>
            <Btn type="submit" variant="danger" disabled={busy}>{busy ? "Submitting…" : "Submit bug report"}</Btn>
          </form>
        </div>
      )}

      {!isSuperAdmin && !isClient ? (
        <Card><EmptyState>Only the Super Admin reviews bug reports.</EmptyState></Card>
      ) : (
        <Card>
          <h2 className="font-bold text-[15px] mb-1">{isSuperAdmin ? "Reported bugs" : "Your submitted bugs"}</h2>
          <Hint>{isSuperAdmin ? "Add a report straight to the Weekly Tracker, with a week and developer assigned. It'll show Completed here once that task is done." : "Only the Super Admin can see and triage the full list."}</Hint>
          {reports === null ? (
            <EmptyState>Loading…</EmptyState>
          ) : reports.length === 0 ? (
            <EmptyState>No bugs reported yet.</EmptyState>
          ) : (
            <div className="divide-y divide-dashed divide-[var(--line)]">
              {reports.map(r => {
                const st = reportStatus(r, data.tasks);
                const badge = statusBadge[st];
                return (
                  <div key={r.id} className="py-3 first:pt-0">
                    <div className="flex flex-wrap gap-2.5 items-start">
                      <div className="flex-1 min-w-[180px]">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-semibold">{r.title}</h3>
                          <Badge tone={badge.tone}>{badge.label}</Badge>
                        </div>
                        {r.description && <p className="text-xs text-[var(--muted)] mt-1">{r.description}</p>}
                        <p className="text-[11px] text-[var(--muted)] mt-1">Reported by {r.reportedBy} · {timeAgo(r.createdAt)}</p>
                      </div>
                      {isSuperAdmin && st === "new" && (
                        <Btn variant="secondary" onClick={() => setAddingId(addingId === r.id ? null : r.id)}>Add to Tracker</Btn>
                      )}
                    </div>
                    {isSuperAdmin && addingId === r.id && (
                      <AddToTrackerForm project={project} weeks={data.weeks} onDone={(weekId, member) => addToTracker(r, weekId, member)} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
