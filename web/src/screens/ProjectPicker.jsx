import { Btn, EmptyState } from "../components/ui.jsx";
import { useAppState } from "../hooks/useAppState.jsx";
import { useNotifications } from "../hooks/useNotifications.js";
import NotificationBell from "../components/NotificationBell.jsx";

export default function ProjectPicker({ onOpenProject, onOpenAdmin }) {
  const { profile, isUnrestricted, projects, visibleProjects, signOut } = useAppState();
  const { items, unreadCount, markRead } = useNotifications(profile.uid);
  const unread = items.filter(n => !n.read);

  function openFromNotification(n) {
    markRead(n.id);
    const p = projects.find(x => x.id === n.projectId);
    if (p) onOpenProject(p);
  }

  return (
    <div className="max-w-4xl mx-auto px-5 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center font-display font-bold">N</div>
          <div>
            <h1 className="text-xl font-bold leading-tight">Projects</h1>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">{profile.role}</span>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <NotificationBell dark={false} onSelectProject={pid => { const p = projects.find(x => x.id === pid); if (p) onOpenProject(p); }} />
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
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
          {visibleProjects.map((p, i) => (
            <button
              key={p.id}
              onClick={() => onOpenProject(p)}
              className="group text-left bg-[var(--panel)] border border-[var(--line)] rounded-2xl p-5 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:border-[var(--accent)] hover:-translate-y-0.5 transition-all"
            >
              <div className="w-9 h-9 rounded-lg mb-3 flex items-center justify-center font-display font-bold text-white"
                style={{ background: ["var(--accent)", "var(--purple)", "var(--blue)", "var(--green)"][i % 4] }}>
                {p.name.slice(0, 1).toUpperCase()}
              </div>
              <h3 className="font-semibold text-[15.5px] mb-1">{p.name}</h3>
              <span className="text-xs text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors">Open project →</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
