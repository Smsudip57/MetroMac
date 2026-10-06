/**
 * Normalize role from JWT/user payload (string or { name }).
 */
export function getRoleName(role) {
  if (!role) return null;
  if (typeof role === "string") return role.trim().toLowerCase();
  if (typeof role === "object" && role.name) {
    return String(role.name).trim().toLowerCase();
  }
  return null;
}

export function isAdminRole(role) {
  return getRoleName(role) === "admin";
}

export function isRestrictedTaskRole(role) {
  const name = getRoleName(role);
  return name === "manager" || name === "employee";
}

/**
 * Super users and Admin role can see all tasks (list, stats, import/export).
 */
export function canViewAllTasks(role, isSuperUser = false) {
  return Boolean(isSuperUser) || isAdminRole(role);
}

/**
 * Only super users and Admin role users may assign the Admin role to others.
 */
export function canAssignAdminRole(user) {
  if (!user) return false;
  return Boolean(user.is_super_user) || isAdminRole(user.role);
}
