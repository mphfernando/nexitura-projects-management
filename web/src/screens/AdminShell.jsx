import { useState } from "react";
import { useAppState } from "../hooks/useAppState.jsx";
import ProjectsPane from "../views/admin/ProjectsPane.jsx";
import UsersPane from "../views/admin/UsersPane.jsx";
import PermissionsPane from "../views/admin/PermissionsPane.jsx";
import { usePermOverride } from "../hooks/usePermOverride.js";

const SUBTABS = [
  { key: "projects", label: "Projects" },
  { key: "users", label: "Users" },
  { key: "perms", label: "Permissions" },
];

// A fully separate top-level area from any project — its own header, own
// nav, own back-target (the picker). Nothing here is a project tab.
export default function AdminShell({ onBack }) {
  const { profile, permDefault, signOut } = useAppState();
  const [tab, setTab] = useState("projects");
  const showPerms = profile.role === "superadmin";
  const globalPermOverride = usePermOverride(null); // no project context here

  return (
    <div className="min-h-screen">
      <header className="relative bg-[var(--purple)] text-white px-5 py-3.5 flex flex-wrap items-center gap-x-4 gap-y-1">
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-white/40 via-white/10 to-transparent" />
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center font-display font-bold text-sm">A</div>
          <div className="font-display text-lg font-bold tracking-wide">Admin Panel</div>
        </div>
        <small className="text-white/60 text-xs">System-wide — not scoped to one project</small>
        <div className="ml-auto flex gap-2">
          <button onClick={onBack} className="text-xs font-semibold text-white/90 hover:bg-white/15 px-2.5 py-1.5 rounded-lg transition-colors">← Projects</button>
          <button onClick={signOut} className="text-xs font-semibold text-white/90 hover:bg-white/15 px-2.5 py-1.5 rounded-lg transition-colors">Sign out</button>
        </div>
      </header>

      <nav className="flex gap-1 px-5 py-2.5 bg-[var(--panel)] border-b border-[var(--line)] sticky top-0 z-20 overflow-x-auto">
        {SUBTABS.filter(t => t.key !== "perms" || showPerms).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-lg px-3.5 py-2 text-[13.5px] font-semibold whitespace-nowrap transition-colors ${tab === t.key ? "bg-[var(--purple-soft)] text-[var(--purple)]" : "text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--grey-soft)]"}`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="max-w-[1180px] mx-auto p-4 md:p-5">
        {tab === "projects" && <ProjectsPane />}
        {tab === "users" && <UsersPane />}
        {tab === "perms" && showPerms && <PermissionsPane project={null} permDefault={permDefault} permOverride={globalPermOverride} />}
      </main>
    </div>
  );
}
