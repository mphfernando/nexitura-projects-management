import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase.js";
import { currentWeekId } from "../lib/dates.js";

// Fetches a lightweight summary (task/milestone counts, last-updated, recent
// activity) for each given project id, for card displays in the picker and
// admin panel. Not live-subscribed — good enough for a summary list.
export function useProjectSummaries(projectIds) {
  const [summaries, setSummaries] = useState({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(projectIds.map(async (id) => {
        try {
          const snap = await getDoc(doc(db, "projects", id, "data", "main"));
          if (!snap.exists()) return [id, null];
          const d = snap.data();
          const tasks = d.tasks || [];
          const nowWeek = d.weeks ? currentWeekId(d.weeks) : null;
          const hasRecentActivity = nowWeek ? tasks.some(t => t.week === nowWeek) : false;
          return [id, {
            taskCount: tasks.length,
            openTaskCount: tasks.filter(t => t.status !== "Completed").length,
            milestoneCount: (d.miles || []).length,
            updatedAt: d.updatedAt || null,
            hasRecentActivity,
          }];
        } catch (e) {
          console.error("Could not load summary for project " + id, e.message);
          return [id, null];
        }
      }));
      if (cancelled) return;
      setSummaries(Object.fromEntries(entries));
    })();
    return () => { cancelled = true; };
  }, [projectIds.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  return summaries;
}
