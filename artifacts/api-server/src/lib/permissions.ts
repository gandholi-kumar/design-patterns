import { createAccessControl } from "better-auth/plugins/access";

export const statement = {
  pattern: ["read"],
  notes: ["create", "read", "update", "delete"],
  code: ["execute_local", "execute_sandbox"],
  media: ["upload", "delete"],
  admin: ["manage_users", "view_metrics"],
} as const;

export const ac = createAccessControl(statement);

export const roles = {
  guest: ac.newRole({
    pattern: ["read"],
    code: ["execute_local"],
  }),
  member: ac.newRole({
    pattern: ["read"],
    code: ["execute_local", "execute_sandbox"],
    notes: ["create", "read", "update", "delete"],
    media: ["upload", "delete"],
  }),
  admin: ac.newRole({
    pattern: ["read"],
    code: ["execute_local", "execute_sandbox"],
    notes: ["create", "read", "update", "delete"],
    media: ["upload", "delete"],
    admin: ["manage_users", "view_metrics"],
  }),
};
