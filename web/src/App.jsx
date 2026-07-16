import { useState } from "react";
import { AppStateProvider, useAppState } from "./hooks/useAppState.jsx";
import Login from "./screens/Login.jsx";
import NoAccess from "./screens/NoAccess.jsx";
import ProjectPicker from "./screens/ProjectPicker.jsx";
import ProjectShell from "./screens/ProjectShell.jsx";
import AdminShell from "./screens/AdminShell.jsx";

function Router() {
  const { authLoading, profileChecked, user, profile } = useAppState();
  const [openProject, setOpenProject] = useState(null);
  const [adminOpen, setAdminOpen] = useState(false);

  if (authLoading || !profileChecked) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-[var(--muted)]">Loading…</div>;
  }
  if (!user) return <Login />;
  if (!profile) return <NoAccess />;

  function backToPicker() { setOpenProject(null); setAdminOpen(false); }

  if (adminOpen) return <AdminShell onBack={backToPicker} />;
  if (openProject) return <ProjectShell project={openProject} onBackToProjects={backToPicker} onOpenAdmin={() => setAdminOpen(true)} />;
  return <ProjectPicker onOpenProject={setOpenProject} onOpenAdmin={() => setAdminOpen(true)} />;
}

export default function App() {
  return (
    <AppStateProvider>
      <Router />
    </AppStateProvider>
  );
}
