import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase.js";

// In-app notification, shown to the assignee via the bell icon / picker banner.
export async function notifyAssignment({ toUid, projectId, projectName, taskName, weekLabel }) {
  if (!toUid) return;
  try {
    await addDoc(collection(db, "notifications"), {
      toUid,
      projectId,
      projectName,
      taskName,
      weekLabel: weekLabel || "",
      createdAt: Date.now(),
      read: false,
    });
  } catch (e) {
    console.error("Could not create notification:", e.message);
  }
}
