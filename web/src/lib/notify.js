import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase.js";

// In-app notification, shown to the assignee via the bell icon / picker banner.
export async function notifyAssignment({ toUid, projectId, projectName, taskName, weekLabel }) {
  if (!toUid) return;
  try {
    await addDoc(collection(db, "notifications"), {
      type: "assignment",
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

// In-app notification sent to Admin/Super Admin when a client reports a bug.
export async function notifyBugReport({ toUid, projectId, projectName, title, reportedBy }) {
  if (!toUid) return;
  try {
    await addDoc(collection(db, "notifications"), {
      type: "bug",
      toUid,
      projectId,
      projectName,
      taskName: title,
      reportedBy,
      createdAt: Date.now(),
      read: false,
    });
  } catch (e) {
    console.error("Could not create bug notification:", e.message);
  }
}
