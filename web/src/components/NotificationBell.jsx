import { useState, useRef, useEffect } from "react";
import { useAppState } from "../hooks/useAppState.jsx";
import { useNotifications } from "../hooks/useNotifications.js";

function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return Math.floor(s / 60) + "m ago";
  if (s < 86400) return Math.floor(s / 3600) + "h ago";
  return Math.floor(s / 86400) + "d ago";
}

export default function NotificationBell({ onSelectProject, dark = true }) {
  const { profile } = useAppState();
  const { items, unreadCount, markRead, markAllRead } = useNotifications(profile?.uid);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onDoc(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const iconColor = dark ? "text-white/90 hover:bg-white/10" : "text-[var(--muted)] hover:bg-[var(--grey-soft)] hover:text-[var(--ink)]";

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)} className={`relative rounded-lg p-2 transition-colors ${iconColor}`} aria-label="Notifications">
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-[var(--red)] text-white text-[9.5px] font-bold min-w-[16px] h-[16px] rounded-full flex items-center justify-center px-1">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-[var(--panel)] border border-[var(--line)] rounded-2xl shadow-[var(--shadow-md)] overflow-hidden z-50 text-[var(--ink)]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--line)]">
            <h3 className="font-semibold text-sm">Notifications</h3>
            {unreadCount > 0 && <button onClick={markAllRead} className="text-xs font-semibold text-[var(--accent)]">Mark all read</button>}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <div className="text-sm text-[var(--muted)] text-center py-6">No notifications yet.</div>
            ) : items.map(n => (
              <button
                key={n.id}
                onClick={() => {
                  markRead(n.id);
                  if (onSelectProject) {
                    onSelectProject(n.projectId, n.type, n.type === "bug" ? { reportId: n.reportId } : { taskId: n.taskId, weekId: n.weekId });
                  }
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-3 border-b border-[var(--line)] last:border-none hover:bg-[var(--panel-2)] transition-colors ${!n.read ? "bg-[var(--accent-soft)]" : ""}`}
              >
                <div className="text-sm">
                  {n.type === "bug" ? (
                    <>New bug reported: <strong>{n.taskName}</strong>{n.reportedBy && <span className="text-[var(--muted)]"> by {n.reportedBy}</span>}</>
                  ) : (
                    <>You were assigned to <strong>{n.taskName}</strong> {n.weekLabel && <span className="text-[var(--muted)]">({n.weekLabel})</span>}</>
                  )}
                </div>
                <div className="text-xs text-[var(--muted)] mt-0.5">{n.projectName} · {timeAgo(n.createdAt)}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
