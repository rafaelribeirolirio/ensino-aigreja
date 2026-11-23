import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, PlayCircle } from "lucide-react";

import { enroll } from "@/app/cursos/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

type Params = Promise<{ courseId: string }>;

const lessonTypeLabels: Record<string, string> = {
  VIDEO: "Vídeo",
  PDF: "PDF",
  EBOOK: "Ebook",
  TEXT: "Texto",
};

export default function CoursePage({ params }: { params: Params }) {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12">
      <Suspense
        fallback={
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Carregando curso...
          </p>
        }
      >
        <Content params={params} />
      </Suspense>
    </div>
  );
}

async function Content({ params }: { params: Params }) {
  const { courseId } = await params;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" } } },
      },
      _count: { select: { enrollments: true } },
    },
  });

  if (!course || !course.published) {
    notFound();
  }

  const session = await getSession();
  const userId = session?.user?.id;

  const [enrollment, progress] = userId
    ? await Promise.all([
        prisma.enrollment.findUnique({
          where: { userId_courseId: { userId, courseId } },
        }),
        prisma.lessonProgress.findMany({
          where: {
            userId,
            completed: true,
            lesson: { module: { courseId } },
          },
          select: { lessonId: true },
        }),
      ])
    : [null, []];

  const completed = new Set(progress.map((item) => item.lessonId));
  const lessons = course.modules.flatMap((module) => module.lessons);
  const lessonCount = lessons.length;
  const completedCount = lessons.filter((lesson) =>
    completed.has(lesson.id),
  ).length;
  const nextLesson =
    lessons.find((lesson) => !completed.has(lesson.id)) ?? lessons[0];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link
          href="/cursos"
          className="text-sm text-neutral-500 hover:underline dark:text-neutral-400"
        >
          ← Cursos
        </Link>
      </div>

      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          {course.description}
        </p>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {course.modules.length} módulo(s) · {lessonCount} aula(s) ·{" "}
          {course._count.enrollments} inscrito(s)
        </p>
      </header>

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
          {!userId ? (
            <>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Entre para se inscrever e acompanhar seu progresso.
              </p>
              <Link
                href="/login"
                className={buttonVariants({ size: "sm" })}
              >
                Entrar
              </Link>
            </>
          ) : enrollment ? (
            <>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {enrollment.completedAt
                  ? "Você concluiu este curso!"
                  : `Seu progresso: ${completedCount} de ${lessonCount} aulas.`}
              </p>
              {nextLesson ? (
                <Link
                  href={`/cursos/${course.id}/aulas/${nextLesson.id}`}
                  className={buttonVariants({ size: "sm" })}
                >
                  <PlayCircle className="h-4 w-4" />
                  {completedCount > 0 ? "Continuar" : "Começar"}
                </Link>
              ) : null}
            </>
          ) : (
            <>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Inscreva-se para acessar as aulas e registrar seu progresso.
              </p>
              <form action={enroll}>
                <input type="hidden" name="courseId" value={course.id} />
                <Button type="submit" size="sm">
                  Inscrever-se
                </Button>
              </form>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        {course.modules.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Conteúdo em breve</CardTitle>
              <CardDescription>
                Este curso ainda não tem módulos publicados.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          course.modules.map((module, moduleIndex) => (
            <Card key={module.id}>
              <CardHeader>
                <CardTitle className="text-base">
                  {moduleIndex + 1}. {module.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {module.lessons.length === 0 ? (
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Sem aulas neste módulo.
                  </p>
                ) : (
                  <ul className="flex flex-col divide-y divide-neutral-200 dark:divide-neutral-800">
                    {module.lessons.map((lesson, lessonIndex) => {
                      const isDone = completed.has(lesson.id);
                      return (
                        <li
                          key={lesson.id}
                          className="flex items-center justify-between gap-3 py-3"
                        >
                          <Link
                            href={`/cursos/${course.id}/aulas/${lesson.id}`}
                            className="flex items-center gap-2 text-sm hover:underline"
                          >
                            {isDone ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                            ) : (
                              <span className="flex h-4 w-4 items-center justify-center rounded-full border border-neutral-400 text-[10px] text-neutral-500 dark:border-neutral-600">
                                {lessonIndex + 1}
                              </span>
                            )}
                            <span>{lesson.title}</span>
                          </Link>
                          <span className="text-xs text-neutral-500 dark:text-neutral-400">
                            {lessonTypeLabels[lesson.type]}
                            {lesson.durationMin
                              ? ` · ${lesson.durationMin} min`
                              : ""}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
