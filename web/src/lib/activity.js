import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase.js";

export async function logActivity(projectId, profile, action, detail) {
  if (!projectId) return;
  try {
    await addDoc(collection(db, "activityLog", projectId, "entries"), {
      action,
      detail: detail || "",
      who: (profile && (profile.name || profile.email)) || "Someone",
      whoUid: profile ? profile.uid : "",
      timestamp: Date.now(),
    });
  } catch (e) {
    console.error("Could not log activity:", e.message);
  }
}
