import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  createAttachment,
  createLesson,
  deleteAttachment,
  deleteLesson,
} from "@/app/admin/actions";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { ErrorBox } from "@/components/error-box";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { resolveFileUrl } from "@/lib/files";
import { requireCapability } from "@/lib/guards";
import { prisma } from "@/lib/prisma";

type Params = Promise<{ courseId: string; moduleId: string }>;
type SearchParams = Promise<{ erro?: string }>;

const lessonTypeLabels: Record<string, string> = {
  VIDEO: "Vídeo",
  PDF: "PDF",
  EBOOK: "Ebook",
  TEXT: "Texto",
};

export default function AdminModulePage({
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
          Carregando módulo...
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
  const { courseId, moduleId } = await params;
  const { erro } = await searchParams;

  const mod = await prisma.module.findUnique({
    where: { id: moduleId },
    include: {
      course: { select: { id: true, title: true } },
      lessons: {
        orderBy: { order: "asc" },
        include: { attachments: { orderBy: { order: "asc" } } },
      },
    },
  });

  if (!mod || mod.courseId !== courseId) {
    notFound();
  }

  const allAttachments = mod.lessons.flatMap((lesson) => lesson.attachments);
  const resolvedAttachmentUrls = await Promise.all(
    allAttachments.map((attachment) => resolveFileUrl(attachment.filePath)),
  );
  const attachmentUrlById = new Map(
    allAttachments.map((attachment, index) => [
      attachment.id,
      resolvedAttachmentUrls[index],
    ]),
  );

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link
          href={`/admin/cursos/${mod.course.id}`}
          className="text-sm text-neutral-500 hover:underline dark:text-neutral-400"
        >
          ← {mod.course.title}
        </Link>
      </div>

      <div>
        <h2 className="text-xl font-semibold">{mod.title}</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Gerencie as aulas deste módulo.
        </p>
      </div>

      {erro ? <ErrorBox message={erro} /> : null}

      <Card>
        <CardHeader>
          <CardTitle>Nova aula</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createLesson} className="flex flex-col gap-4">
            <input type="hidden" name="moduleId" value={mod.id} />

            <div className="flex flex-col gap-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                name="title"
                placeholder="Ex.: O que é a fé?"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="type">Tipo</Label>
              <Select id="type" name="type" defaultValue="VIDEO">
                <option value="VIDEO">Vídeo</option>
                <option value="PDF">PDF</option>
                <option value="EBOOK">Ebook</option>
                <option value="TEXT">Texto</option>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="videoInput">
                Link ou ID do YouTube (para aulas em vídeo)
              </Label>
              <Input
                id="videoInput"
                name="videoInput"
                placeholder="https://youtu.be/... ou o ID do vídeo"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="textContent">Conteúdo em texto (opcional)</Label>
              <Textarea
                id="textContent"
                name="textContent"
                placeholder="Material de apoio, resumo ou anotações..."
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="durationMin">Duração em minutos (opcional)</Label>
              <Input
                id="durationMin"
                name="durationMin"
                type="number"
                min={0}
                max={2000}
                className="max-w-40"
              />
            </div>

            <Button type="submit" className="self-start">
              Adicionar aula
            </Button>
          </form>
        </CardContent>
      </Card>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Aulas</h3>
        {mod.lessons.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Nenhuma aula ainda. Adicione a primeira acima.
          </p>
        ) : (
          mod.lessons.map((lesson, index) => (
            <Card key={lesson.id}>
              <CardContent className="flex flex-col gap-4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <p className="font-medium">
                      {index + 1}. {lesson.title}
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {lessonTypeLabels[lesson.type]}
                      {lesson.durationMin
                        ? ` · ${lesson.durationMin} min`
                        : ""}
                    </p>
                  </div>
                  <form action={deleteLesson}>
                    <input type="hidden" name="lessonId" value={lesson.id} />
                    <ConfirmSubmit
                      message={`Excluir a aula "${lesson.title}"?`}
                    >
                      Excluir
                    </ConfirmSubmit>
                  </form>
                </div>

                <div className="flex flex-col gap-2 border-t border-neutral-200 pt-3 text-sm dark:border-neutral-800">
                  <p className="font-medium">Anexos</p>

                  {lesson.attachments.length === 0 ? (
                    <p className="text-neutral-500 dark:text-neutral-400">
                      Nenhum anexo.
                    </p>
                  ) : (
                    <ul className="flex flex-col gap-1">
                      {lesson.attachments.map((attachment) => (
                        <li
                          key={attachment.id}
                          className="flex items-center justify-between gap-3"
                        >
                          {attachmentUrlById.get(attachment.id) ? (
                            <a
                              href={
                                attachmentUrlById.get(attachment.id) ?? "#"
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="text-indigo-600 hover:underline dark:text-indigo-400"
                            >
                              {attachment.title}
                            </a>
                          ) : (
                            <span className="text-neutral-500 dark:text-neutral-400">
                              {attachment.title} (indisponível)
                            </span>
                          )}
                          <form action={deleteAttachment}>
                            <input
                              type="hidden"
                              name="attachmentId"
                              value={attachment.id}
                            />
                            <ConfirmSubmit
                              message={`Excluir o anexo "${attachment.title}"?`}
                              variant="ghost"
                            >
                              Remover
                            </ConfirmSubmit>
                          </form>
                        </li>
                      ))}
                    </ul>
                  )}

                  <details className="mt-1">
                    <summary className="cursor-pointer text-indigo-600 dark:text-indigo-400">
                      Adicionar anexo
                    </summary>
                    <form
                      action={createAttachment}
                      className="mt-3 flex flex-col gap-3"
                    >
                      <input type="hidden" name="lessonId" value={lesson.id} />
                      <Input
                        name="title"
                        placeholder="Título do anexo"
                        required
                      />
                      <Input
                        name="fileUrl"
                        placeholder="URL do arquivo (ou envie um arquivo)"
                      />
                      <Input type="file" name="file" />
                      <Button type="submit" size="sm" className="self-start">
                        Adicionar
                      </Button>
                    </form>
                  </details>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </section>
    </div>
  );
}
