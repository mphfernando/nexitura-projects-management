import { Btn } from "../components/ui.jsx";
import { useAppState } from "../hooks/useAppState.jsx";

export default function NoAccess() {
  const { signOut, user } = useAppState();
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-[var(--panel)] border border-[var(--line)] rounded-2xl shadow-[var(--shadow-md)] overflow-hidden text-center">
        <div className="h-1.5 bg-gradient-to-r from-[var(--amber)] to-[var(--red)]" />
        <div className="p-8">
          <img src="/logo.jpeg" alt="Nexitura" className="h-10 w-auto mb-4 mx-auto" />
          <h1 className="text-xl font-bold mb-1">No access yet</h1>
          {user?.email && <p className="text-xs text-[var(--muted)] mb-3">Signed in as <strong>{user.email}</strong></p>}
          <p className="text-sm text-[var(--muted)] mb-6">This account isn't set up in Nexitura Hub yet. Contact your Super Admin and ask them to add {user?.email || "your email"} with the right role.</p>
          <Btn variant="secondary" className="w-full" onClick={signOut}>Sign out</Btn>
        </div>
      </div>
    </div>
  );
}
