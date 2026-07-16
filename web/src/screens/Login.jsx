import { useState } from "react";
import { auth, signInWithEmailAndPassword, sendPasswordResetEmail } from "../firebase.js";
import { Btn, Input, FieldLabel } from "../components/ui.jsx";

export default function Login() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr(""); setNotice(""); setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pass);
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  }

  async function onForgotPassword() {
    setErr(""); setNotice("");
    if (!email.trim()) { setErr("Enter your email above first, then tap \"Forgot password\"."); return; }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setNotice("Password reset email sent — check your inbox.");
    } catch (e2) {
      setErr(e2.message);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-0 sm:p-6">
      <div className="w-full h-screen sm:h-auto max-w-none sm:max-w-sm bg-[var(--panel)] border-0 sm:border border-[var(--line)] rounded-none sm:rounded-2xl shadow-none sm:shadow-[var(--shadow-md)] overflow-hidden flex flex-col justify-center sm:block">
        <div className="h-1.5 bg-gradient-to-r from-[var(--accent)] to-[var(--purple)]" />
        <div className="p-8">
          <img src="/logo.jpeg" alt="Nexitura" className="h-12 w-auto mb-4 -ml-1" />
          <p className="text-sm text-[var(--muted)] mb-6">Sign in to view your projects.</p>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <FieldLabel htmlFor="loginEmail">Email</FieldLabel>
              <Input id="loginEmail" type="text" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="loginPass">Password</FieldLabel>
                <button type="button" onClick={onForgotPassword} className="text-[11px] font-semibold text-[var(--accent)] mb-1.5">Forgot password?</button>
              </div>
              <Input id="loginPass" type="password" autoComplete="current-password" required value={pass} onChange={e => setPass(e.target.value)} />
            </div>
            <Btn type="submit" className="w-full" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</Btn>
            {err && <div className="rounded-xl bg-[var(--red-soft)] text-[var(--red)] text-xs px-3 py-2.5">{err}</div>}
            {notice && <div className="rounded-xl bg-[var(--green-soft)] text-[var(--green)] text-xs px-3 py-2.5">{notice}</div>}
          </form>
        </div>
      </div>
    </div>
  );
}
