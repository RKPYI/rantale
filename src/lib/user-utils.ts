import { User } from "@/types/api";

export type UserRole = "user" | "author" | "moderator" | "admin";

export interface RoleInfo {
  name: string;
  color: string;
  bgColor: string;
  icon?: string;
}

export const ROLE_CONFIG: Record<UserRole, RoleInfo> = {
  user: {
    name: "Reader",
    color: "text-gray-600",
    bgColor: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  },
  author: {
    name: "Author",
    color: "text-blue-600",
    bgColor: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    icon: "✍️",
  },
  moderator: {
    name: "Moderator",
    color: "text-purple-600",
    bgColor:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    icon: "🛡️",
  },
  admin: {
    name: "Admin",
    color: "text-red-600",
    bgColor: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    icon: "👑",
  },
};

export function getUserRole(user: User): UserRole {
  if (user.is_admin || user.role === 3) return "admin";
  if (user.role === 2) return "moderator";
  if (user.role === 1) return "author";
  return "user";
}

export function getRoleInfo(user: User): RoleInfo {
  const role = getUserRole(user);
  return ROLE_CONFIG[role];
}

export function shouldShowRoleBadge(user: User): boolean {
  const role = getUserRole(user);
  return role !== "user"; // Show badge for all roles except regular users
}

export function getProfileImageFallback(user: User): string {
  return user.name?.charAt(0)?.toUpperCase() || "?";
}
