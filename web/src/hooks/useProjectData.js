import { useEffect, useRef, useState, useCallback } from "react";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase.js";
import { emptyProjectPayload } from "../lib/seed.js";
import { currentWeekId } from "../lib/dates.js";

// Loads projects/{id}/data/main, keeps it live-synced, and exposes a debounced
// save so rapid edits (typing, toggling) don't spam Firestore writes.
export function useProjectData(projectId) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("connecting"); // connecting | synced | saving | error
  const isSavingRef = useRef(false);
  const saveTimerRef = useRef(null);

  useEffect(() => {
    if (!projectId) { setData(null); return; }
    let cancelled = false;
    setStatus("connecting");
    const ref = doc(db, "projects", projectId, "data", "main");

    (async () => {
      const snap = await getDoc(ref);
      if (cancelled) return;
      if (snap.exists()) {
        setData(snap.data());
      } else {
        const fresh = emptyProjectPayload();
        await setDoc(ref, fresh);
        setData(fresh);
      }
      setStatus("synced");
    })().catch(e => {
      console.error("Project load error:", e.message);
      setStatus("error");
    });

    const unsub = onSnapshot(ref, snap => {
      if (!snap.exists() || isSavingRef.current) return;
      setData(snap.data());
      setStatus("synced");
    }, err => {
      console.error("Snapshot error:", err.message);
      setStatus("error");
    });

    return () => { cancelled = true; unsub(); clearTimeout(saveTimerRef.current); };
  }, [projectId]);

  // `updater` is either a full payload or a function (prev) => next
  const update = useCallback((updater) => {
    setData(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (!next.openWeeks) next.openWeeks = [currentWeekId(next.weeks)];
      setStatus("saving");
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(async () => {
        if (!projectId) return;
        try {
          isSavingRef.current = true;
          await setDoc(doc(db, "projects", projectId, "data", "main"), next);
          setStatus("synced");
        } catch (e) {
          console.error("Save error:", e.message);
          setStatus("error");
        } finally {
          setTimeout(() => { isSavingRef.current = false; }, 1200);
        }
      }, 450);
      return next;
    });
  }, [projectId]);

  return { data, update, status };
}
