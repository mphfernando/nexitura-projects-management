import { useEffect, useState, useCallback } from "react";
import { collection, getDocs, doc, setDoc, updateDoc } from "firebase/firestore";
import { db, getSecondaryAuth, createUserWithEmailAndPassword, signOut } from "../../firebase.js";
import { useAppState } from "../../hooks/useAppState.jsx";
import { Btn, Input, Select, Card, EmptyState } from "../../components/ui.jsx";

export default function UsersPane() {
  const { projects } = useAppState();
  const [users, setUsers] = useState(null);
  const [email, setEmail] = useState(""); const [pass, setPass] = useState(""); const [role, setRole] = useState("developer");
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
  // people (with real emails, for notifications) without needing to list /users.
  async function syncProjectMembers(projectId, allUsers) {
    const members = allUsers
      .filter(u => (u.projects || []).includes(projectId))
      .map(u => ({ uid: u.uid, name: u.name || u.email, email: u.email }));
    await updateDoc(doc(db, "projects", projectId), { members });
  }

  async function createUser() {
    setErr("");
    if (!email.trim() || pass.length < 6) { setErr("Enter an email and a password of at least 6 characters."); return; }
    setBusy(true);
    try {
      const sAuth = getSecondaryAuth();
      const cred = await createUserWithEmailAndPassword(sAuth, email.trim(), pass);
      const uid = cred.user.uid;
      await signOut(sAuth);
      await setDoc(doc(db, "users", uid), { email: email.trim(), name: "", role, projects: [] });
      setEmail(""); setPass("");
      await load();
    } catch (e) {
      setErr(e.message);
    } finally { setBusy(false); }
  }
  async function changeRole(uid, newRole) {
    await updateDoc(doc(db, "users", uid), { role: newRole });
    await load();
  }
  async function changeName(uid, newName) {
    await updateDoc(doc(db, "users", uid), { name: newName });
    const updated = users.map(x => x.uid === uid ? { ...x, name: newName } : x);
    setUsers(updated);
    const u = updated.find(x => x.uid === uid);
    await Promise.all((u.projects || []).map(pid => syncProjectMembers(pid, updated)));
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
          <Input className="min-w-[180px]" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <Input className="min-w-[160px]" type="password" placeholder="Temporary password" value={pass} onChange={e => setPass(e.target.value)} />
          <Select className="!w-auto" value={role} onChange={e => setRole(e.target.value)}>
            <option value="developer">Developer</option>
            <option value="client">Client</option>
            <option value="admin">Admin</option>
            <option value="superadmin">Super Admin</option>
          </Select>
          <Btn onClick={createUser} disabled={busy}>Create user</Btn>
        </div>
        {err && <div className="rounded-lg bg-[var(--red-soft)] text-[var(--red)] text-xs px-3 py-2 mt-2.5">{err}</div>}
      </Card>

      <Card>
        <h2 className="font-bold text-[15px] mb-3">All users</h2>
        {users === null ? (
          <EmptyState>Loading…</EmptyState>
        ) : users.length === 0 ? (
          <EmptyState>No users yet.</EmptyState>
        ) : (
          <div className="divide-y divide-dashed divide-[var(--line)]">
            {users.map(u => (
              <div key={u.uid} className="flex flex-wrap gap-2.5 items-center py-2.5 first:pt-0">
                <Input className="w-36" placeholder="Name" defaultValue={u.name} onBlur={e => e.target.value.trim() !== (u.name || "") && changeName(u.uid, e.target.value.trim())} />
                <span className="flex-1 min-w-[150px] text-sm text-[var(--muted)]">{u.email}</span>
                <Select className="!w-auto min-w-[120px]" value={u.role} onChange={e => changeRole(u.uid, e.target.value)}>
                  <option value="developer">Developer</option>
                  <option value="client">Client</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                </Select>
                <div className="flex flex-wrap gap-1.5">
                  {projects.map(p => (
                    <label key={p.id} className="inline-flex items-center gap-1 text-xs bg-[var(--grey-soft)] px-2 py-1 rounded-full">
                      <input type="checkbox" checked={(u.projects || []).includes(p.id)} onChange={e => toggleProject(u, p.id, e.target.checked)} />
                      {p.name}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
