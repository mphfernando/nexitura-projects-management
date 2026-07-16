import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase.js";
import { notifyBugReport } from "./notify.js";

export async function submitBugReport({ project, title, description, profile }) {
  const ref = await addDoc(collection(db, "projects", project.id, "bugReports"), {
    title,
    description: description || "",
    status: "new", // new | added
    reportedBy: profile.name || profile.email,
    reportedByUid: profile.uid,
    createdAt: Date.now(),
  });
  const admins = project.admins || [];
  await Promise.all(admins.map(a => notifyBugReport({ toUid: a.uid, projectId: project.id, projectName: project.name, title, reportId: ref.id, reportedBy: profile.name || profile.email })));
  return ref.id;
}
