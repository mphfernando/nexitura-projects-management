import { useEffect, useState, useCallback } from "react";
import { collection, getDocs, doc, setDoc, updateDoc } from "firebase/firestore";
import { db, getSecondaryAuth, createUserWithEmailAndPassword, signOut } from "../../firebase.js";
import { useAppState } from "../../hooks/useAppState.jsx";
import { Btn, Input, Select, Card, EmptyState } from "../../components/ui.jsx";

const ROLE_LABELS = { developer: "Developer", client: "Client", admin: "Admin", superadmin: "Super Admin" };
// Only these roles can be assigned tasks by name — admins/superadmins manage
// the system, they aren't "assignees" of project work.
const ASSIGNABLE_ROLES = ["developer", "client"];

export default function UsersPane() {
  const { projects } = useAppState();
  const [users, setUsers] = useState(null);
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [pass, setPass] = useState(""); const [role, setRole] = useState("developer");
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const snap = await getDocs(collection(db, "users"));
      setUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
      setUsers([]);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  // Keeps projects/{id}.members in sync so project screens can list assignable
  // people (with real names/emails, for notifications) without needing to
  // list /users. Only Developer/Client accounts are assignable.
  async function syncProjectMembers(projectId, allUsers) {
    const members = allUsers
      .filter(u => (u.projects || []).includes(projectId) && ASSIGNABLE_ROLES.includes(u.role))
      .map(u => ({ uid: u.uid, name: u.name || u.email, email: u.email }));
    await updateDoc(doc(db, "projects", projectId), { members });
  }
  async function syncAllProjectsFor(u, updatedUsers) {
    await Promise.all((u.projects || []).map(pid => syncProjectMembers(pid, updatedUsers)));
  }

  async function createUser() {
    setErr("");
    if (!name.trim()) { setErr("Enter their name."); return; }
    if (!email.trim() || pass.length < 6) { setErr("Enter an email and a password of at least 6 characters."); return; }
    setBusy(true);
    try {
      const sAuth = getSecondaryAuth();
      const cred = await createUserWithEmailAndPassword(sAuth, email.trim(), pass);
      const uid = cred.user.uid;
      await signOut(sAuth);
      await setDoc(doc(db, "users", uid), { email: email.trim(), name: name.trim(), role, projects: [] });
      setName(""); setEmail(""); setPass("");
      await load();
    } catch (e) {
      setErr(e.message);
    } finally { setBusy(false); }
  }
  async function changeRole(u, newRole) {
    await updateDoc(doc(db, "users", u.uid), { role: newRole });
    const updated = users.map(x => x.uid === u.uid ? { ...x, role: newRole } : x);
    setUsers(updated);
    // role change affects assignability everywhere they're a member
    await syncAllProjectsFor({ ...u, role: newRole }, updated);
  }
  async function changeName(u, newName) {
    if (newName === (u.name || "")) return;
    await updateDoc(doc(db, "users", u.uid), { name: newName });
    const updated = users.map(x => x.uid === u.uid ? { ...x, name: newName } : x);
    setUsers(updated);
    await syncAllProjectsFor(u, updated);
  }
  async function toggleProject(u, pid, checked) {
    const projectsList = new Set(u.projects || []);
    checked ? projectsList.add(pid) : projectsList.delete(pid);
    const nextProjects = [...projectsList];
    await updateDoc(doc(db, "users", u.uid), { projects: nextProjects });
    const updated = users.map(x => x.uid === u.uid ? { ...x, projects: nextProjects } : x);
    setUsers(updated);
    await syncProjectMembers(pid, updated);
  }

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="font-bold text-[15px] mb-1.5">＋ Add user</h2>
        <p className="text-xs text-[var(--muted)] mb-3">Creates a real sign-in account. The person can sign in immediately with this email/password.</p>
        <div className="flex flex-wrap gap-2 items-center">
          <Input className="min-w-[140px]" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} />
          <Input className="min-w-[180px]" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <Input className="min-w-[160px]" type="password" placeholder="Temporary password" value={pass} onChange={e => setPass(e.target.value)} />
          <Select className="!w-auto" value={role} onChange={e => setRole(e.target.value)}>
            {Object.entries(ROLE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </Select>
          <Btn onClick={createUser} disabled={busy}>Create user</Btn>
        </div>
        {err && <div className="rounded-lg bg-[var(--red-soft)] text-[var(--red)] text-xs px-3 py-2 mt-2.5">{err}</div>}
      </Card>

      <Card>
        <h2 className="font-bold text-[15px] mb-1.5">All users</h2>
        <p className="text-xs text-[var(--muted)] mb-3">Only Developer and Client accounts can be assigned tasks by name in a project's Weekly Tracker.</p>
        {users === null ? (
          <EmptyState>Loading…</EmptyState>
        ) : users.length === 0 ? (
          <EmptyState>No users yet.</EmptyState>
        ) : (
          <div className="space-y-3">
            {users.map(u => (
              <div key={u.uid} className="border border-[var(--line)] rounded-xl p-3.5">
                <div className="flex flex-wrap gap-2.5 items-center mb-2.5">
                  <Input className="w-40" placeholder="Name" defaultValue={u.name} onBlur={e => changeName(u, e.target.value.trim())} />
                  <div className="flex flex-col min-w-[160px]">
                    <span className="text-sm">{u.email}</span>
                  </div>
                  <Select className="!w-auto min-w-[130px] ml-auto" value={u.role} onChange={e => changeRole(u, e.target.value)}>
                    {Object.entries(ROLE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </Select>
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)] block mb-1.5">Project access</span>
                  {projects.length === 0 ? (
                    <span className="text-xs text-[var(--muted)]">No projects exist yet.</span>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {projects.map(p => {
                        const checked = (u.projects || []).includes(p.id);
                        return (
                          <label key={p.id} className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full cursor-pointer transition-colors ${checked ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "bg-[var(--grey-soft)] text-[var(--muted)]"}`}>
                            <input type="checkbox" className="w-3.5 h-3.5" checked={checked} onChange={e => toggleProject(u, p.id, e.target.checked)} />
                            {p.name}
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
