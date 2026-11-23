import { Suspense } from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Cursos",
};

export default function CoursesPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12">
      <header className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Cursos</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Trilhas de aprendizado para crescer no conhecimento, no seu ritmo.
        </p>
      </header>

      <Suspense
        fallback={
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Carregando cursos...
          </p>
        }
      >
        <CourseList />
      </Suspense>
    </div>
  );
}

async function CourseList() {
  const courses = await prisma.course.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { modules: true, enrollments: true } } },
  });

  if (courses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nenhum curso publicado ainda</CardTitle>
          <CardDescription>
            Assim que um curso for publicado, ele aparecerá aqui.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {courses.map((course) => (
        <Card key={course.id} className="flex flex-col">
          <CardHeader>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <CardTitle>{course.title}</CardTitle>
            <CardDescription className="line-clamp-3">
              {course.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto flex items-center justify-between gap-3">
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {course._count.modules} módulo(s) ·{" "}
              {course._count.enrollments} inscrito(s)
            </span>
            <Link
              href={`/cursos/${course.id}`}
              className={buttonVariants({ size: "sm" })}
            >
              Ver curso
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
