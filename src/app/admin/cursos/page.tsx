import { Suspense } from "react";
import Link from "next/link";

import { createCourse } from "@/app/admin/actions";
import { ErrorBox } from "@/components/error-box";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { requireCapability } from "@/lib/guards";
import { prisma } from "@/lib/prisma";

type SearchParams = Promise<{ erro?: string }>;

export default function AdminCoursesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <Suspense
      fallback={
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Carregando cursos...
        </p>
      }
    >
      <Content searchParams={searchParams} />
    </Suspense>
  );
}

async function Content({ searchParams }: { searchParams: SearchParams }) {
  await requireCapability("manageContent");
  const { erro } = await searchParams;

  const courses = await prisma.course.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { modules: true, enrollments: true } },
    },
  });

  return (
    <div className="flex flex-col gap-8">
      {erro ? <ErrorBox message={erro} /> : null}

      <Card>
        <CardHeader>
          <CardTitle>Novo curso</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createCourse} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                name="title"
                placeholder="Ex.: Fundamentos da fé"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Do que se trata este curso?"
                required
              />
            </div>
            <Button type="submit" className="self-start">
              Criar curso
            </Button>
          </form>
        </CardContent>
      </Card>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Cursos cadastrados</h2>
        {courses.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Nenhum curso ainda. Crie o primeiro acima.
          </p>
        ) : (
          courses.map((course) => (
            <Card key={course.id}>
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-1">
                  <p className="font-medium">{course.title}</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {course._count.modules} módulo(s) ·{" "}
                    {course._count.enrollments} inscrito(s) ·{" "}
                    {course.published ? "Publicado" : "Rascunho"}
                  </p>
                </div>
                <Link
                  href={`/admin/cursos/${course.id}`}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  Gerenciar
                </Link>
              </CardContent>
            </Card>
          ))
        )}
      </section>
    </div>
  );
}
