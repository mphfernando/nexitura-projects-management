import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase.js";

// In-app notification, shown to the assignee via the bell icon / picker banner.
// Carries taskId/weekId so clicking it can scroll straight to that task,
// not just open the Tracker tab in general.
export async function notifyAssignment({ toUid, projectId, projectName, taskName, taskId, weekId, weekLabel }) {
  if (!toUid) return;
  try {
    await addDoc(collection(db, "notifications"), {
      type: "assignment",
      toUid,
      projectId,
      projectName,
      taskName,
      taskId: taskId || "",
      weekId: weekId || "",
      weekLabel: weekLabel || "",
      createdAt: Date.now(),
      read: false,
    });
  } catch (e) {
    console.error("Could not create notification:", e.message);
  }
}

// In-app notification sent to Admin/Super Admin when a client reports a bug.
// Carries reportId so clicking it can scroll straight to that report.
export async function notifyBugReport({ toUid, projectId, projectName, title, reportId, reportedBy }) {
  if (!toUid) return;
  try {
    await addDoc(collection(db, "notifications"), {
      type: "bug",
      toUid,
      projectId,
      projectName,
      taskName: title,
      reportId: reportId || "",
      reportedBy,
      createdAt: Date.now(),
      read: false,
    });
  } catch (e) {
    console.error("Could not create bug notification:", e.message);
  }
}
