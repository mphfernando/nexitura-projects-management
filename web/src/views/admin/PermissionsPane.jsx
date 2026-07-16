import { useEffect, useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase.js";
import { useAppState } from "../../hooks/useAppState.jsx";
import { TAB_KEYS, TAB_LABELS, FIELD_KEYS, FIELD_LABELS, defaultPermMatrix } from "../../lib/permissions.js";
import { Btn, Card } from "../../components/ui.jsx";

function cloneMatrix(m) {
  return { developer: { tabs: { ...m.developer.tabs }, fields: { ...m.developer.fields } }, client: { tabs: { ...m.client.tabs }, fields: { ...m.client.fields } } };
}

function MatrixTable({ matrix, onToggle }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[12.5px] mb-2">
        <thead>
          <tr className="bg-[var(--panel-2)] text-[10.5px] uppercase tracking-wide text-[var(--muted)]">
            <th className="text-left px-2.5 py-2">Item</th>
            <th className="px-2.5 py-2 text-center">Developer</th>
            <th className="px-2.5 py-2 text-center">Client</th>
          </tr>
        </thead>
        <tbody>
          <tr><td colSpan={3} className="font-semibold bg-[var(--panel-2)] px-2.5 py-1.5">Screens (tabs)</td></tr>
          {TAB_KEYS.map(k => (
            <tr key={k}>
              <td className="px-2.5 py-2 border-t border-[var(--line)]">{TAB_LABELS[k]}</td>
              <td className="px-2.5 py-2 border-t border-[var(--line)] text-center"><input type="checkbox" className="w-[17px] h-[17px]" checked={matrix.developer.tabs[k]} onChange={e => onToggle("developer", "tabs", k, e.target.checked)} /></td>
              <td className="px-2.5 py-2 border-t border-[var(--line)] text-center"><input type="checkbox" className="w-[17px] h-[17px]" checked={matrix.client.tabs[k]} onChange={e => onToggle("client", "tabs", k, e.target.checked)} /></td>
            </tr>
          ))}
          <tr><td colSpan={3} className="font-semibold bg-[var(--panel-2)] px-2.5 py-1.5">Fields</td></tr>
          {FIELD_KEYS.map(k => (
            <tr key={k}>
              <td className="px-2.5 py-2 border-t border-[var(--line)]">{FIELD_LABELS[k]}</td>
              <td className="px-2.5 py-2 border-t border-[var(--line)] text-center"><input type="checkbox" className="w-[17px] h-[17px]" checked={matrix.developer.fields[k]} onChange={e => onToggle("developer", "fields", k, e.target.checked)} /></td>
              <td className="px-2.5 py-2 border-t border-[var(--line)] text-center"><input type="checkbox" className="w-[17px] h-[17px]" checked={matrix.client.fields[k]} onChange={e => onToggle("client", "fields", k, e.target.checked)} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PermissionsPane({ project, permDefault, permOverride }) {
  const { refreshPermDefault } = useAppState();
  const [local, setLocal] = useState(() => cloneMatrix(permDefault));
  useEffect(() => { setLocal(cloneMatrix(permDefault)); }, [permDefault]);

  const [ovEnabled, setOvEnabled] = useState(permOverride.enabled);
  const [ovLocal, setOvLocal] = useState(() => cloneMatrix(permOverride.override || defaultPermMatrix()));
  useEffect(() => {
    setOvEnabled(permOverride.enabled);
    setOvLocal(cloneMatrix(permOverride.override || defaultPermMatrix()));
  }, [permOverride.enabled, permOverride.override]);

  function toggleLocal(role, group, key, val) {
    setLocal(prev => ({ ...prev, [role]: { ...prev[role], [group]: { ...prev[role][group], [key]: val } } }));
  }
  function toggleOv(role, group, key, val) {
    setOvLocal(prev => ({ ...prev, [role]: { ...prev[role], [group]: { ...prev[role][group], [key]: val } } }));
  }

  async function saveDefault() {
    await setDoc(doc(db, "permissions", "matrix"), local);
    await refreshPermDefault();
  }
  async function saveOverride() {
    await permOverride.save(ovEnabled, ovLocal);
  }

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="font-bold text-[15px] mb-1.5">Default permissions — Developer &amp; Client</h2>
        <p className="text-xs text-[var(--muted)] mb-3">Super Admins and Admins always have full access. These toggles control what Developers and Clients can see across every project (unless a project has a custom override).</p>
        <MatrixTable matrix={local} onToggle={toggleLocal} />
        <Btn onClick={saveDefault}>Save permissions</Btn>
      </Card>

      {project && (
        <Card>
          <h2 className="font-bold text-[15px] mb-2">Custom permissions for "{project.name}"</h2>
          <label className="inline-flex items-center gap-1.5 text-xs bg-[var(--grey-soft)] px-2.5 py-1.5 rounded-full mb-3">
            <input type="checkbox" checked={ovEnabled} onChange={e => setOvEnabled(e.target.checked)} />
            Use custom permissions for this project
          </label>
          <MatrixTable matrix={ovLocal} onToggle={toggleOv} />
          <Btn onClick={saveOverride}>Save project override</Btn>
        </Card>
      )}
    </div>
  );
}
