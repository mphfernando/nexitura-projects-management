import { Btn } from "../components/ui.jsx";
import { useAppState } from "../hooks/useAppState.jsx";

export default function NoAccess() {
  const { signOut } = useAppState();
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-[var(--panel)] border border-[var(--line)] rounded-2xl shadow-[var(--shadow-md)] overflow-hidden text-center">
        <div className="h-1.5 bg-gradient-to-r from-[var(--amber)] to-[var(--red)]" />
        <div className="p-8">
          <h1 className="text-xl font-bold mb-1">No access yet</h1>
          <p className="text-sm text-[var(--muted)] mb-6">Your account isn't set up in Nexitura Hub yet. Ask your Super Admin to add you.</p>
          <Btn variant="secondary" className="w-full" onClick={signOut}>Sign out</Btn>
        </div>
      </div>
    </div>
  );
}
