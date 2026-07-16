import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase.js";
import { Btn, EmptyState } from "../components/ui.jsx";
import { useAppState } from "../hooks/useAppState.jsx";
import { useNotifications } from "../hooks/useNotifications.js";
import { useProjectSummaries } from "../hooks/useProjectSummaries.js";
import NotificationBell from "../components/NotificationBell.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";

function timeAgo(ts) {
  if (!ts) return "no activity yet";
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "updated just now";
  if (s < 3600) return `updated ${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `updated ${Math.floor(s / 3600)}h ago`;
  return `updated ${Math.floor(s / 86400)}d ago`;
}

export default function ProjectPicker({ onOpenProject, onOpenAdmin, onNavigate }) {
  const { profile, isUnrestricted, visibleProjects, signOut, refreshProjects } = useAppState();
  const { items, unreadCount, markRead } = useNotifications(profile.uid);
  const summaries = useProjectSummaries(visibleProjects.map(p => p.id));
  const [confirming, setConfirming] = useState(null);
  const unread = items.filter(n => !n.read);

  function openFromNotification(n) {
    markRead(n.id);
    onNavigate(n.projectId, n.type === "bug" ? "bugs" : "tracker", n.type === "bug" ? { reportId: n.reportId } : { taskId: n.taskId, weekId: n.weekId });
  }
  async function archive(id) {
    await updateDoc(doc(db, "projects", id), { archived: true });
    setConfirming(null);
    await refreshProjects();
  }

  return (
    <div className="max-w-4xl mx-auto px-5 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <img src="/logo.jpeg" alt="Nexitura" className="h-9 w-auto" />
          <div>
            <h1 className="text-xl font-bold leading-tight">Projects</h1>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">{profile.role}</span>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <NotificationBell dark={false} onSelectProject={(pid, type, meta) => onNavigate(pid, type === "bug" ? "bugs" : "tracker", meta)} />
          {isUnrestricted && <Btn variant="secondary" onClick={onOpenAdmin}>Admin Panel</Btn>}
          <Btn variant="secondary" onClick={signOut}>Sign out</Btn>
        </div>
      </div>

      {unreadCount > 0 && (
        <div className="bg-[var(--accent-soft)] border border-[var(--accent-ring)] rounded-2xl p-4 mb-6 space-y-2">
          <h2 className="text-sm font-semibold text-[var(--accent)]">You have {unreadCount} new assignment{unreadCount === 1 ? "" : "s"}</h2>
          {unread.slice(0, 5).map(n => (
            <button key={n.id} onClick={() => openFromNotification(n)} className="block w-full text-left text-sm hover:underline">
              <strong>{n.taskName}</strong> {n.weekLabel && <span className="text-[var(--muted)]">({n.weekLabel})</span>} — {n.projectName}
            </button>
          ))}
        </div>
      )}

      {visibleProjects.length === 0 ? (
        <EmptyState>No projects assigned to you yet — ask your admin.</EmptyState>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleProjects.map((p, i) => {
            const s = summaries[p.id];
            return (
              <div
                key={p.id}
                className="group relative text-left bg-[var(--panel)] border border-[var(--line)] rounded-2xl p-5 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:border-[var(--accent)] hover:-translate-y-0.5 transition-all cursor-pointer"
                onClick={() => onOpenProject(p)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center font-display font-bold text-white"
                    style={{ background: ["var(--accent)", "var(--purple)", "var(--blue)", "var(--green)"][i % 4] }}>
                    {p.name.slice(0, 1).toUpperCase()}
                  </div>
                  <span className={`w-2.5 h-2.5 rounded-full mt-1 ${s?.hasRecentActivity ? "bg-[var(--green)]" : "bg-[var(--grey-soft)]"}`} title={s?.hasRecentActivity ? "Active this week" : "No recent activity"} />
                </div>
                <h3 className="font-semibold text-[15.5px] mb-1">{p.name}</h3>
                <div className="text-xs text-[var(--muted)] mb-1">
                  {s ? `${s.openTaskCount} open task${s.openTaskCount === 1 ? "" : "s"} · ${s.milestoneCount} milestone${s.milestoneCount === 1 ? "" : "s"}` : "Loading…"}
                </div>
                <div className="text-[11px] text-[var(--muted)] mb-2">{s ? timeAgo(s.updatedAt) : ""}</div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors">Open project →</span>
                  {isUnrestricted && (
                    <button
                      onClick={e => { e.stopPropagation(); setConfirming(p.id); }}
                      className="text-[11px] font-semibold text-[var(--muted)] hover:text-[var(--red)] hover:bg-[var(--red-soft)] px-2 py-1 rounded-md"
                    >
                      Archive
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {confirming && (
        <ConfirmModal
          title="Archive this project?"
          body="It will be hidden from the picker for everyone."
          confirmLabel="Archive"
          onConfirm={() => archive(confirming)}
          onCancel={() => setConfirming(null)}
        />
      )}
    </div>
  );
}
