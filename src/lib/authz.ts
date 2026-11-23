import type { ChurchRole } from "@/generated/prisma/enums";

export type Capability =
  | "manageContent"
  | "manageMaterials"
  | "manageForumCategories"
  | "moderateForum"
  | "manageBadges";

export const ROLE_LABELS: Record<ChurchRole, string> = {
  MEMBER: "Membro",
  TEACHER: "Professor",
  LEADER: "Líder",
  ADMIN: "Administrador",
};

/**
 * Matriz de autorização da plataforma.
 * A checagem no servidor é a fonte da verdade; a UI apenas esconde o que o
 * usuário não pode fazer.
 */
const CAPABILITY_ROLES: Record<Capability, readonly ChurchRole[]> = {
  manageContent: ["TEACHER", "ADMIN"],
  manageMaterials: ["TEACHER", "ADMIN"],
  manageForumCategories: ["LEADER", "ADMIN"],
  moderateForum: ["LEADER", "ADMIN"],
  manageBadges: ["ADMIN"],
};

export function can(
  role: ChurchRole | string | null | undefined,
  capability: Capability,
): boolean {
  if (!role) {
    return false;
  }

  return CAPABILITY_ROLES[capability].includes(role as ChurchRole);
}

export function canAny(
  role: ChurchRole | string | null | undefined,
  capabilities: readonly Capability[],
): boolean {
  return capabilities.some((capability) => can(role, capability));
}
