import type { UserRole } from "@/types/api";

export type PermissionAction =
  | "manageOrganization"
  | "manageMembers"
  | "manageProjects"
  | "manageNotion"
  | "triggerManualSync"
  | "manageFeatures"
  | "assignTickets"
  | "viewClientAccess";

const permissionMatrix: Record<PermissionAction, UserRole[]> = {
  manageOrganization: ["TEAM_LEADER"],
  manageMembers: ["TEAM_LEADER"],
  manageProjects: ["TEAM_LEADER"],
  manageNotion: ["TEAM_LEADER"],
  triggerManualSync: ["TEAM_LEADER", "BUSINESS_ANALYST"],
  manageFeatures: ["TEAM_LEADER", "BUSINESS_ANALYST"],
  assignTickets: ["TEAM_LEADER", "BUSINESS_ANALYST"],
  viewClientAccess: ["TEAM_LEADER", "BUSINESS_ANALYST"],
};

export function canPerformAction(role: UserRole | null | undefined, action: PermissionAction) {
  if (!role) {
    return false;
  }

  return permissionMatrix[action].includes(role);
}

export function formatRoleLabel(role: UserRole) {
  return role
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
