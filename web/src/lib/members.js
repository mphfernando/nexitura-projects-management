// A project's assignable members are: Developer accounts explicitly given
// access to that project, plus every Admin/Super Admin (they already have
// access to everything, so they're always assignable everywhere).
export function computeMembers(allUsers, projectId) {
  return allUsers
    .filter(u => u.role === "admin" || u.role === "superadmin" || (u.role === "developer" && (u.projects || []).includes(projectId)))
    .map(u => ({ uid: u.uid, name: u.name || u.email, email: u.email, role: u.role }));
}
