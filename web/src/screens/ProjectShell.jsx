import { useEffect, useMemo, useState } from "react";
import { useAppState } from "../hooks/useAppState.jsx";
import { useProjectData } from "../hooks/useProjectData.js";
import { usePermOverride } from "../hooks/usePermOverride.js";
import { TAB_KEYS, TAB_LABELS, canSeeTab, canSeeField } from "../lib/permissions.js";
import Tracker from "../views/Tracker.jsx";
import Requirements from "../views/Requirements.jsx";
import Plan from "../views/Plan.jsx";
import Milestones from "../views/Milestones.jsx";
import Overview from "../views/Overview.jsx";
import Activity from "../views/Activity.jsx";
import Bugs from "../views/Bugs.jsx";
import NotificationBell from "../components/NotificationBell.jsx";

const NAV_ICONS = {
  tracker: <path d="M3 4h18v18H3zM8 2v4M16 2v4M3 10h18" />,
  reqs: <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h8" />,
  plan: <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />,
  milestones: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01z" />,
  overview: <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />,
  activity: <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />,
  bugs: <path d="M8 2l1.88 1.88M14.12 3.88L16 2M9 7.13v-1a3.003 3.003 0 1 1 6 0v1M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6ZM12 20v-9M6.53 9c-1 0-1.5-.5-2-1M17.47 9c1 0 1.5-.5 2-1M4.5 14h1.5M18 14h1.5" />,
};

// Renders one open project: its own header, its 5 working tabs, nothing else.
// Admin Panel lives entirely outside this component (see AdminShell.jsx) —
// it is a separate top-level area, not one more tab bolted onto a project.
export default function ProjectShell({ project, onBackToProjects, onOpenAdmin }) {
  const { profile, isUnrestricted, permDefault, signOut } = useAppState();
  const projectId = project.id;
  const { data, update, status } = useProjectData(projectId);
  const permOverride = usePermOverride(projectId);

  const effectivePerms = useMemo(() => {
    return permOverride.enabled && permOverride.override ? permOverride.override : null;
  }, [permOverride.enabled, permOverride.override]);
  const activePerms = effectivePerms || permDefault;

  const visibleTabs = useMemo(() => TAB_KEYS.filter(t => canSeeTab(profile.role, activePerms, t)), [profile.role, activePerms]);

  const [activeTab, setActiveTab] = useState(visibleTabs[0] || "overview");
  useEffect(() => {
    if (!visibleTabs.includes(activeTab)) setActiveTab(visibleTabs[0] || "overview");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const fieldOK = key => canSeeField(profile.role, activePerms, key);
  const statusLabel = { connecting: "🔄 Connecting…", synced: "🟢 Synced", saving: "Saving…", error: "⚠ Sync error" }[status];

  return (
    <div className="min-h-screen pb-16 md:pb-0">
      <header className="relative bg-[var(--ink)] text-white px-5 py-3.5 flex flex-wrap items-center gap-x-4 gap-y-1 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-[var(--accent)] via-[var(--purple)] to-[var(--blue)]" />
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center font-display font-bold text-sm">N</div>
          <div className="font-display text-lg font-bold tracking-wide">Nexitura<span className="opacity-40">·</span>Hub</div>
        </div>
        <small className="text-white/50 text-xs">{project.name}</small>
        <span className="ml-auto text-[11px] text-white/50">{statusLabel}</span>
        <span className="hidden sm:inline-flex items-center gap-1.5 text-xs bg-white/10 px-2.5 py-1 rounded-full">
          {profile.name || profile.email}
          <span className="opacity-60 uppercase text-[10px] font-bold">{profile.role}</span>
        </span>
        <NotificationBell />
        {isUnrestricted && <button onClick={onOpenAdmin} className="text-xs font-semibold text-white/90 hover:bg-white/10 px-2.5 py-1.5 rounded-lg transition-colors">Admin Panel</button>}
        <button onClick={onBackToProjects} className="text-xs font-semibold text-white/90 hover:bg-white/10 px-2.5 py-1.5 rounded-lg transition-colors">← Projects</button>
        <button onClick={signOut} className="text-xs font-semibold text-white/90 hover:bg-white/10 px-2.5 py-1.5 rounded-lg transition-colors">Sign out</button>
      </header>

      <nav className="hidden md:flex gap-1 px-5 py-2.5 bg-[var(--panel)] border-b border-[var(--line)] sticky top-0 z-20 overflow-x-auto">
        {visibleTabs.map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`rounded-lg px-3.5 py-2 text-[13.5px] font-semibold whitespace-nowrap transition-colors ${activeTab === t ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--grey-soft)]"}`}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </nav>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--panel)] border-t border-[var(--line)] z-30 flex h-16 shadow-[var(--shadow-md)]">
        {visibleTabs.map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`flex-1 flex flex-col items-center justify-center gap-1 text-[9.5px] font-semibold uppercase tracking-wide transition-colors ${activeTab === t ? "text-[var(--accent)]" : "text-[var(--muted)]"}`}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{NAV_ICONS[t]}</svg>
            {TAB_LABELS[t].split(" ")[0]}
          </button>
        ))}
      </div>

      <main className="max-w-[1180px] mx-auto p-4 md:p-5">
        {data && (
          <>
            {activeTab === "tracker" && <Tracker project={project} data={data} update={update} showDev={fieldOK("developerNames")} showProg={fieldOK("progress")} />}
            {activeTab === "reqs" && <Requirements project={project} data={data} update={update} />}
            {activeTab === "plan" && <Plan project={project} data={data} update={update} showDev={fieldOK("developerNames")} showProg={fieldOK("progress")} />}
            {activeTab === "milestones" && <Milestones project={project} data={data} update={update} />}
            {activeTab === "overview" && <Overview data={data} showProg={fieldOK("progress")} showDev={fieldOK("developerNames")} />}
            {activeTab === "activity" && <Activity projectId={project.id} />}
            {activeTab === "bugs" && <Bugs project={project} data={data} update={update} />}
          </>
        )}
      </main>
    </div>
  );
}
