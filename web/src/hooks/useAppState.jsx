import { useEffect, useState, useCallback, createContext, useContext } from "react";
import {
  collection, doc, getDoc, getDocs, setDoc, query, limit,
} from "firebase/firestore";
import { db, auth, onAuthStateChanged, signOut as fbSignOut } from "../firebase.js";
import { defaultPermMatrix, mergePermMatrix } from "../lib/permissions.js";
import { seedPayload } from "../lib/seed.js";

const AppStateContext = createContext(null);

export function AppStateProvider({ children }) {
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null); // {uid,email,name,role,projects}
  const [profileChecked, setProfileChecked] = useState(false);
  const [projects, setProjects] = useState([]); // non-archived project docs
  const [permDefault, setPermDefault] = useState(defaultPermMatrix());

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setProfileChecked(false);
      if (!u) {
        setProfile(null);
        setAuthLoading(false);
        setProfileChecked(true);
        return;
      }
      try {
        const snap = await getDoc(doc(db, "users", u.uid));
        if (snap.exists()) {
          const d = snap.data();
          setProfile({ uid: u.uid, email: d.email || "", name: d.name || "", role: d.role || "client", projects: d.projects || [] });
        } else {
          setProfile(null);
        }
      } catch (e) {
        console.error("Could not load user profile:", e.message);
        setProfile(null);
      }
      setProfileChecked(true);
      setAuthLoading(false);
    });
  }, []);

  const isUnrestricted = profile && (profile.role === "superadmin" || profile.role === "admin");

  const refreshProjects = useCallback(async () => {
    const snap = await getDocs(collection(db, "projects"));
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => !p.archived);
    setProjects(list);
    return list;
  }, []);

  const refreshPermDefault = useCallback(async () => {
    try {
      const snap = await getDoc(doc(db, "permissions", "matrix"));
      if (snap.exists()) {
        setPermDefault(mergePermMatrix(snap.data()));
      } else {
        const base = defaultPermMatrix();
        setPermDefault(base);
        await setDoc(doc(db, "permissions", "matrix"), base).catch(() => {});
      }
    } catch (e) {
      console.error("Could not load permissions/matrix:", e.message);
    }
  }, []);

  const migrateLegacyIfNeeded = useCallback(async () => {
    try {
      const projSnap = await getDocs(query(collection(db, "projects"), limit(1)));
      if (!projSnap.empty) return;
      let payload = seedPayload();
      try {
        const legacy = await getDoc(doc(db, "aleken-hub", "v3"));
        if (legacy.exists()) payload = legacy.data();
      } catch (e) { /* no legacy doc / no access — fall back to seed */ }
      await setDoc(doc(db, "projects", "aleken-legacy"), { name: "Aleken", createdAt: Date.now(), archived: false, members: [] });
      await setDoc(doc(db, "projects", "aleken-legacy", "data", "main"), payload);
    } catch (e) {
      console.error("Legacy migration skipped:", e.message);
    }
  }, []);

  // Once we know who's signed in, load the picker's supporting data.
  useEffect(() => {
    if (!profile) return;
    (async () => {
      await refreshPermDefault();
      await migrateLegacyIfNeeded();
      await refreshProjects();
    })();
  }, [profile, refreshPermDefault, migrateLegacyIfNeeded, refreshProjects]);

  const visibleProjects = isUnrestricted ? projects : projects.filter(p => (profile?.projects || []).includes(p.id));

  const signOut = useCallback(() => fbSignOut(auth), []);

  const value = {
    authLoading, user, profile, profileChecked, isUnrestricted,
    projects, visibleProjects, refreshProjects,
    permDefault, setPermDefault, refreshPermDefault,
    signOut,
  };
  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
