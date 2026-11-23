import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, FileText } from "lucide-react";

import { completeLesson } from "@/app/cursos/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { resolveFileUrl } from "@/lib/files";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

type Params = Promise<{ courseId: string; lessonId: string }>;

const lessonTypeLabels: Record<string, string> = {
  VIDEO: "Vídeo",
  PDF: "PDF",
  EBOOK: "Ebook",
  TEXT: "Texto",
};

export default function LessonPage({ params }: { params: Params }) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      <Suspense
        fallback={
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Carregando aula...
          </p>
        }
      >
        <Content params={params} />
      </Suspense>
    </div>
  );
}

async function Content({ params }: { params: Params }) {
  const { courseId, lessonId } = await params;
  const user = await getCurrentUser();

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      attachments: { orderBy: { order: "asc" } },
      module: {
        select: {
          id: true,
          title: true,
          courseId: true,
          course: {
            select: { id: true, title: true, published: true },
          },
        },
      },
      progress: {
        where: { userId: user.id },
        select: { completed: true },
      },
    },
  });

  if (
    !lesson ||
    lesson.module.courseId !== courseId ||
    !lesson.module.course.published
  ) {
    notFound();
  }

  const isCompleted = lesson.progress[0]?.completed ?? false;
  const hasVideo = lesson.type === "VIDEO" && lesson.videoId;

  const materialUrl = await resolveFileUrl(lesson.filePath);
  const attachmentUrls = await Promise.all(
    lesson.attachments.map((attachment) =>
      resolveFileUrl(attachment.filePath),
    ),
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link
          href={`/cursos/${lesson.module.course.id}`}
          className="text-sm text-neutral-500 hover:underline dark:text-neutral-400"
        >
          ← {lesson.module.course.title}
        </Link>
        <p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          {lesson.module.title}
        </p>
      </div>

      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">{lesson.title}</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {lessonTypeLabels[lesson.type]}
          {lesson.durationMin ? ` · ${lesson.durationMin} min` : ""}
        </p>
      </header>

      {hasVideo ? (
        <div className="aspect-video w-full overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${lesson.videoId}`}
            title={lesson.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      ) : null}

      {lesson.filePath ? (
        <Card>
          <CardContent className="flex items-center justify-between gap-4 p-4">
            <span className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4" />
              Material da aula
            </span>
            {materialUrl ? (
              <a
                href={materialUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Abrir
              </a>
            ) : (
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                Indisponível
              </span>
            )}
          </CardContent>
        </Card>
      ) : null}

      {lesson.textContent ? (
        <div className="whitespace-pre-line text-neutral-700 dark:text-neutral-300">
          {lesson.textContent}
        </div>
      ) : null}

      {lesson.attachments.length > 0 ? (
        <Card>
          <CardContent className="flex flex-col gap-2 p-4">
            <p className="text-sm font-medium">Anexos</p>
            <ul className="flex flex-col gap-1 text-sm">
              {lesson.attachments.map((attachment, index) =>
                attachmentUrls[index] ? (
                  <li key={attachment.id}>
                    <a
                      href={attachmentUrls[index] ?? "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      {attachment.title}
                    </a>
                  </li>
                ) : (
                  <li
                    key={attachment.id}
                    className="text-neutral-500 dark:text-neutral-400"
                  >
                    {attachment.title} (indisponível)
                  </li>
                ),
              )}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      {!hasVideo &&
      !lesson.textContent &&
      !lesson.filePath &&
      lesson.attachments.length === 0 ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          O conteúdo desta aula ainda não foi anexado.
        </p>
      ) : null}

      <div className="flex items-center gap-4 border-t border-neutral-200 pt-6 dark:border-neutral-800">
        {isCompleted ? (
          <p className="inline-flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4" />
            Aula concluída
          </p>
        ) : (
          <form action={completeLesson}>
            <input type="hidden" name="lessonId" value={lesson.id} />
            <Button type="submit">Marcar como concluída</Button>
          </form>
        )}
      </div>
    </div>
  );
}
