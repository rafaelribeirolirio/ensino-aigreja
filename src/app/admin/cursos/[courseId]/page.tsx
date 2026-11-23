import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  createModule,
  deleteCourse,
  deleteModule,
  updateCourse,
} from "@/app/admin/actions";
import { ConfirmSubmit } from "@/components/confirm-submit";
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

type Params = Promise<{ courseId: string }>;
type SearchParams = Promise<{ erro?: string }>;

const lessonTypeLabels: Record<string, string> = {
  VIDEO: "Vídeo",
  PDF: "PDF",
  EBOOK: "Ebook",
  TEXT: "Texto",
};

export default function AdminCoursePage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  return (
    <Suspense
      fallback={
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Carregando curso...
        </p>
      }
    >
      <Content params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function Content({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  await requireCapability("manageContent");
  const { courseId } = await params;
  const { erro } = await searchParams;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: { orderBy: { order: "asc" } },
          _count: { select: { lessons: true } },
        },
      },
    },
  });

  if (!course) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link
          href="/admin/cursos"
          className="text-sm text-neutral-500 hover:underline dark:text-neutral-400"
        >
          ← Cursos
        </Link>
      </div>

      {erro ? <ErrorBox message={erro} /> : null}

      <Card>
        <CardHeader>
          <CardTitle>Editar curso</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateCourse} className="flex flex-col gap-4">
            <input type="hidden" name="courseId" value={course.id} />

            <div className="flex flex-col gap-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                name="title"
                defaultValue={course.title}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={course.description}
                required
              />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="published"
                defaultChecked={course.published}
                className="h-4 w-4"
              />
              Publicado (visível no catálogo)
            </label>

            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit">Salvar alterações</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Novo módulo</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createModule} className="flex flex-col gap-4">
            <input type="hidden" name="courseId" value={course.id} />
            <div className="flex flex-col gap-2">
              <Label htmlFor="moduleTitle">Título do módulo</Label>
              <Input
                id="moduleTitle"
                name="title"
                placeholder="Ex.: Introdução"
                required
              />
            </div>
            <Button type="submit" className="self-start">
              Adicionar módulo
            </Button>
          </form>
        </CardContent>
      </Card>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Módulos</h2>
        {course.modules.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Nenhum módulo ainda. Adicione o primeiro acima.
          </p>
        ) : (
          course.modules.map((module, moduleIndex) => (
            <Card key={module.id}>
              <CardContent className="flex flex-col gap-3 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">
                      {moduleIndex + 1}. {module.title}
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {module._count.lessons} aula(s)
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/cursos/${course.id}/modulos/${module.id}`}
                      className={buttonVariants({
                        variant: "outline",
                        size: "sm",
                      })}
                    >
                      Gerenciar aulas
                    </Link>
                    <form action={deleteModule}>
                      <input
                        type="hidden"
                        name="moduleId"
                        value={module.id}
                      />
                      <ConfirmSubmit
                        message={`Excluir o módulo "${module.title}" e todas as suas aulas?`}
                      >
                        Excluir
                      </ConfirmSubmit>
                    </form>
                  </div>
                </div>

                {module.lessons.length > 0 ? (
                  <ul className="flex flex-col gap-1 border-t border-neutral-200 pt-3 text-sm dark:border-neutral-800">
                    {module.lessons.map((lesson, lessonIndex) => (
                      <li
                        key={lesson.id}
                        className="flex items-center justify-between gap-3"
                      >
                        <span>
                          {lessonIndex + 1}. {lesson.title}
                        </span>
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                          {lessonTypeLabels[lesson.type]}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Sem aulas neste módulo.
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </section>

      <Card className="border-red-200 dark:border-red-900">
        <CardHeader>
          <CardTitle>Excluir curso</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={deleteCourse}>
            <input type="hidden" name="courseId" value={course.id} />
            <ConfirmSubmit
              message={`Excluir o curso "${course.title}"? Módulos, aulas e progresso serão removidos.`}
            >
              Excluir curso
            </ConfirmSubmit>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
