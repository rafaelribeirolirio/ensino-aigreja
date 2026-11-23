import { Suspense } from "react";
import { Award, BookOpen, Star } from "lucide-react";

import { ROLE_LABELS } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Meu perfil",
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export default function ProfilePage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12">
      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileContent />
      </Suspense>
    </div>
  );
}

async function ProfileContent() {
  const user = await getCurrentUser();

  const [points, badges, enrollments] = await Promise.all([
    prisma.pointTransaction.aggregate({
      where: { userId: user.id },
      _sum: { amount: true },
    }),
    prisma.userBadge.count({ where: { userId: user.id } }),
    prisma.enrollment.count({ where: { userId: user.id } }),
  ]);

  const totalPoints = points._sum.amount ?? 0;
  const memberSince = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(user.createdAt);

  const stats = [
    { icon: Star, label: "Pontos", value: totalPoints },
    { icon: Award, label: "Emblemas", value: badges },
    { icon: BookOpen, label: "Cursos", value: enrollments },
  ];

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-2xl font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            {initials(user.name)}
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight">{user.name}</h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {user.email}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="rounded-full bg-indigo-50 px-2.5 py-1 font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                {ROLE_LABELS[user.churchRole]}
              </span>
              <span className="text-neutral-500 dark:text-neutral-400">
                Na plataforma desde {memberSince}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-semibold leading-none">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                    {stat.label}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sobre mim</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {user.bio?.trim()
              ? user.bio
              : "Você ainda não escreveu uma bio. Em breve será possível editar seu perfil por aqui."}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Próximos passos</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-neutral-600 dark:text-neutral-400">
          Cursos, emblemas e ranking chegam nas próximas fases. Por enquanto,
          sua conta já está pronta para receber o conteúdo.
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-6">
      <div className="h-36 rounded-xl bg-neutral-200 dark:bg-neutral-800" />
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="h-24 rounded-xl bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-24 rounded-xl bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-24 rounded-xl bg-neutral-200 dark:bg-neutral-800" />
      </div>
      <div className="h-32 rounded-xl bg-neutral-200 dark:bg-neutral-800" />
    </div>
  );
}
