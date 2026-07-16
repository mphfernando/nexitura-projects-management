import { useState } from "react";
import { AppStateProvider, useAppState } from "./hooks/useAppState.jsx";
import Login from "./screens/Login.jsx";
import NoAccess from "./screens/NoAccess.jsx";
import ProjectPicker from "./screens/ProjectPicker.jsx";
import ProjectShell from "./screens/ProjectShell.jsx";
import AdminShell from "./screens/AdminShell.jsx";

function Router() {
  const { authLoading, profileChecked, user, profile, projects } = useAppState();
  const [openProject, setOpenProject] = useState(null);
  const [initialTab, setInitialTab] = useState(null);
  const [adminOpen, setAdminOpen] = useState(false);

  if (authLoading || !profileChecked) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-[var(--muted)]">Loading…</div>;
  }
  if (!user) return <Login />;
  if (!profile) return <NoAccess />;

  function backToPicker() { setOpenProject(null); setInitialTab(null); setAdminOpen(false); }
  // Used by notification clicks: jump straight to a project and a specific tab
  // (e.g. a bug report notification opens that project's Bugs tab directly).
  function openProjectTab(projectId, tab) {
    const p = projects.find(x => x.id === projectId);
    if (!p) return;
    setAdminOpen(false);
    setOpenProject(p);
    setInitialTab(tab || null);
  }

  if (adminOpen) return <AdminShell onBack={backToPicker} />;
  if (openProject) return <ProjectShell project={openProject} initialTab={initialTab} onBackToProjects={backToPicker} onOpenAdmin={() => setAdminOpen(true)} onNavigate={openProjectTab} />;
  return <ProjectPicker onOpenProject={p => { setOpenProject(p); setInitialTab(null); }} onOpenAdmin={() => setAdminOpen(true)} onNavigate={openProjectTab} />;
}

export default function App() {
  return (
    <AppStateProvider>
      <Router />
    </AppStateProvider>
  );
}
