import "server-only";

import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import type { ChurchRole } from "@/generated/prisma/enums";

import { auth } from "./auth";
import { prisma } from "./prisma";

export const getSession = cache(async () => {
  return auth.api.getSession({
    headers: await headers(),
  });
});

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  bio: string | null;
  churchRole: ChurchRole;
  createdAt: Date;
};

export const getCurrentUser = cache(async (): Promise<CurrentUser> => {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      bio: true,
      churchRole: true,
      createdAt: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return user;
});
