import { useEffect, useState, useCallback } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase.js";
import { defaultPermBucket } from "../lib/permissions.js";

export function usePermOverride(projectId) {
  const [enabled, setEnabled] = useState(false);
  const [override, setOverride] = useState(null);

  const refresh = useCallback(async () => {
    if (!projectId) { setEnabled(false); setOverride(null); return; }
    try {
      const snap = await getDoc(doc(db, "projectPermOverrides", projectId));
      if (snap.exists() && snap.data().enabled) {
        const d = snap.data();
        setEnabled(true);
        setOverride({ developer: d.developer || defaultPermBucket("developer"), client: d.client || defaultPermBucket("client") });
      } else {
        setEnabled(false);
        setOverride(null);
      }
    } catch (e) {
      console.error("Could not load project permission override:", e.message);
    }
  }, [projectId]);

  useEffect(() => { refresh(); }, [refresh]);

  const save = useCallback(async (nextEnabled, nextOverride) => {
    if (!projectId) return;
    await setDoc(doc(db, "projectPermOverrides", projectId), Object.assign({ enabled: nextEnabled }, nextOverride));
    await refresh();
  }, [projectId, refresh]);

  return { enabled, override, refresh, save };
}
