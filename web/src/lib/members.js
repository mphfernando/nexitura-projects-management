// A project's assignable members (Tracker "Assigned to" dropdown) are
// strictly Developer accounts explicitly given access to that project —
// Admins/Super Admins manage the system, Clients report work, neither is
// an assignee.
export function computeMembers(allUsers, projectId) {
  return allUsers
    .filter(u => u.role === "developer" && (u.projects || []).includes(projectId))
    .map(u => ({ uid: u.uid, name: u.name || u.email, email: u.email, role: u.role }));
}

// Separately, every project keeps a denormalized list of Admin/Super Admin
// accounts — used only to route notifications (e.g. a client's bug report)
// to the people who manage the system, without needing to list /users.
export function computeAdmins(allUsers) {
  return allUsers
    .filter(u => u.role === "admin" || u.role === "superadmin")
    .map(u => ({ uid: u.uid, name: u.name || u.email, email: u.email, role: u.role }));
}
