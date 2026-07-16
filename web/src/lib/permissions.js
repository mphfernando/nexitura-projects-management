export const TAB_KEYS = ["tracker", "reqs", "plan", "milestones", "overview"];
export const TAB_LABELS = { tracker: "Weekly Tracker", reqs: "Requirements", plan: "Project Plan", milestones: "Milestones", overview: "Overview" };
export const FIELD_KEYS = ["developerNames", "progress"];
export const FIELD_LABELS = { developerNames: "Developer / assignee names", progress: "Progress indicators (% complete, done counts, overview metrics)" };
export const GOVERNED_ROLES = ["developer", "client"];

export function defaultPermBucket(role) {
  return {
    tabs: { tracker: true, reqs: true, plan: true, milestones: role !== "client", overview: true },
    fields: { developerNames: role !== "client", progress: true },
  };
}
export function defaultPermMatrix() {
  return { developer: defaultPermBucket("developer"), client: defaultPermBucket("client") };
}
export function mergePermMatrix(saved) {
  const base = defaultPermMatrix();
  if (!saved) return base;
  for (const role of GOVERNED_ROLES) {
    base[role] = {
      tabs: Object.assign({}, base[role].tabs, (saved[role] || {}).tabs || {}),
      fields: Object.assign({}, base[role].fields, (saved[role] || {}).fields || {}),
    };
  }
  return base;
}

export function isUnrestricted(role) {
  return role === "superadmin" || role === "admin";
}
export function canSeeTab(role, effectivePerms, v) {
  if (!role) return false;
  if (v === "admin") return isUnrestricted(role);
  if (isUnrestricted(role)) return true;
  const bucket = effectivePerms[role];
  return !bucket || bucket.tabs[v] !== false;
}
export function canSeeField(role, effectivePerms, key) {
  if (!role) return false;
  if (isUnrestricted(role)) return true;
  const bucket = effectivePerms[role];
  return !bucket || bucket.fields[key] !== false;
}
