import { useState } from "react";
import { auth, signInWithEmailAndPassword } from "../firebase.js";
import { Btn, Input, FieldLabel } from "../components/ui.jsx";

export default function Login() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pass);
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-[var(--panel)] border border-[var(--line)] rounded-2xl shadow-[var(--shadow-md)] overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-[var(--accent)] to-[var(--purple)]" />
        <div className="p-8">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center font-display font-bold mb-4">N</div>
          <h1 className="text-xl font-bold mb-1">Nexitura Hub</h1>
          <p className="text-sm text-[var(--muted)] mb-6">Sign in to view your projects.</p>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <FieldLabel htmlFor="loginEmail">Email</FieldLabel>
              <Input id="loginEmail" type="text" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <FieldLabel htmlFor="loginPass">Password</FieldLabel>
              <Input id="loginPass" type="password" autoComplete="current-password" required value={pass} onChange={e => setPass(e.target.value)} />
            </div>
            <Btn type="submit" className="w-full" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</Btn>
            {err && <div className="rounded-xl bg-[var(--red-soft)] text-[var(--red)] text-xs px-3 py-2.5">{err}</div>}
          </form>
        </div>
      </div>
    </div>
  );
}
