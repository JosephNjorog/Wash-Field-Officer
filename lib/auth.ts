export type Role = "supervisor" | "officer";

export const ROLE_COOKIE = "fw_role";
export const OFFICER_COOKIE = "fw_officer_id";
export const NAME_COOKIE = "fw_name";

export const MANAGEMENT_PATHS = [
  "/dashboard",
  "/officers",
  "/assets",
  "/complaints",
  "/reports",
  "/settings",
];

export interface Session {
  role: Role;
  officerId: string | null;
  name: string;
}
