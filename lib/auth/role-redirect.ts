import type { Session } from "next-auth";

export function getRoleHomePath(session: Session): string {
  const roleSession = session as Session & {
    isAdmin?: boolean;
    isStaff?: boolean;
  };

  if (roleSession.isAdmin) {
    return "/admin";
  }

  if (roleSession.isStaff) {
    return "/staff-portal";
  }

  return "/dashboard";
}
