import { useState } from "react";
import { collection, addDoc, doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase.js";
import { emptyProjectPayload } from "../../lib/seed.js";
import { useAppState } from "../../hooks/useAppState.jsx";
import { Btn, Input, Card, EmptyState } from "../../components/ui.jsx";

export default function ProjectsPane() {
  const { projects, refreshProjects } = useAppState();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [names, setNames] = useState({});

  async function create() {
    const n = name.trim(); if (!n) return;
    setBusy(true);
    try {
      const ref = await addDoc(collection(db, "projects"), { name: n, createdAt: Date.now(), archived: false, members: [] });
      await setDoc(doc(db, "projects", ref.id, "data", "main"), emptyProjectPayload());
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
    if (!confirm("Archive this project? It will be hidden from the picker.")) return;
    await updateDoc(doc(db, "projects", id), { archived: true });
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
            {projects.map(p => (
              <div key={p.id} className="flex flex-wrap gap-2 items-center py-2.5 first:pt-0">
                <Input className="flex-1 min-w-[140px]" defaultValue={p.name} onChange={e => setNames(v => ({ ...v, [p.id]: e.target.value }))} />
                <Btn variant="secondary" onClick={() => rename(p.id)}>Rename</Btn>
                <Btn variant="danger" onClick={() => archive(p.id)}>Archive</Btn>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
