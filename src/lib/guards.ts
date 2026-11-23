import "server-only";

import { redirect } from "next/navigation";

import { can, type Capability } from "./authz";
import { getCurrentUser, type CurrentUser } from "./session";

/**
 * Garante que o usuário logado possui a capacidade exigida.
 * Use no início de toda Server Action / Route Handler que altera conteúdo.
 */
export async function requireCapability(
  capability: Capability,
): Promise<CurrentUser> {
  const user = await getCurrentUser();

  if (!can(user.churchRole, capability)) {
    redirect("/perfil");
  }

  return user;
}
