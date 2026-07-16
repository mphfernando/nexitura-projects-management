import { useState } from "react";
import { collection, addDoc, doc, setDoc, updateDoc, getDocs } from "firebase/firestore";
import { db } from "../../firebase.js";
import { emptyProjectPayload } from "../../lib/seed.js";
import { computeMembers } from "../../lib/members.js";
import { useAppState } from "../../hooks/useAppState.jsx";
import { useProjectSummaries } from "../../hooks/useProjectSummaries.js";
import { Btn, Input, Card, EmptyState } from "../../components/ui.jsx";
import ConfirmModal from "../../components/ConfirmModal.jsx";

export default function ProjectsPane() {
  const { projects, refreshProjects } = useAppState();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [names, setNames] = useState({});
  const [confirming, setConfirming] = useState(null); // project id pending archive confirm
  const summaries = useProjectSummaries(projects.map(p => p.id));

  async function create() {
    const n = name.trim(); if (!n) return;
    setBusy(true);
    try {
      const usersSnap = await getDocs(collection(db, "users"));
      const allUsers = usersSnap.docs.map(d => ({ uid: d.id, ...d.data() }));
      const ref = await addDoc(collection(db, "projects"), { name: n, createdAt: Date.now(), archived: false, members: [] });
      await updateDoc(doc(db, "projects", ref.id), { members: computeMembers(allUsers, ref.id) });
      await setDoc(doc(db, "projects", ref.id, "data", "main"), { ...emptyProjectPayload(), updatedAt: Date.now() });
      setName("");
      await refreshProjects();
    } finally { setBusy(false); }
  }
  async function rename(id) {
    const n = (names[id] ?? "").trim(); if (!n) return;
    await updateDoc(doc(db, "projects", id), { name: n });
    await refreshProjects();
  }
  async function archive(id) {
    await updateDoc(doc(db, "projects", id), { archived: true });
    setConfirming(null);
    await refreshProjects();
  }

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="font-bold text-[15px] mb-3">＋ New project</h2>
        <div className="flex flex-wrap gap-2 items-center">
          <Input className="flex-1 min-w-[160px]" placeholder="Project name" value={name} onChange={e => setName(e.target.value)} />
          <Btn onClick={create} disabled={busy}>Create</Btn>
        </div>
      </Card>
      <Card>
        <h2 className="font-bold text-[15px] mb-3">All projects</h2>
        {projects.length === 0 ? <EmptyState>No projects yet.</EmptyState> : (
          <div className="divide-y divide-dashed divide-[var(--line)]">
            {projects.map(p => {
              const s = summaries[p.id];
              return (
                <div key={p.id} className="flex flex-wrap gap-2 items-center py-2.5 first:pt-0">
                  <Input className="flex-1 min-w-[140px]" defaultValue={p.name} onChange={e => setNames(v => ({ ...v, [p.id]: e.target.value }))} />
                  <span className="text-xs text-[var(--muted)] whitespace-nowrap">
                    {s ? `${s.taskCount} task${s.taskCount === 1 ? "" : "s"} · ${s.milestoneCount} milestone${s.milestoneCount === 1 ? "" : "s"}` : "…"}
                  </span>
                  <Btn variant="secondary" onClick={() => rename(p.id)}>Rename</Btn>
                  <Btn variant="danger" onClick={() => setConfirming(p.id)}>Archive</Btn>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {confirming && (
        <ConfirmModal
          title="Archive this project?"
          body="It will be hidden from the picker for everyone. This can be undone later directly in Firestore, but not from this screen yet."
          confirmLabel="Archive"
          onConfirm={() => archive(confirming)}
          onCancel={() => setConfirming(null)}
        />
      )}
    </div>
  );
}
