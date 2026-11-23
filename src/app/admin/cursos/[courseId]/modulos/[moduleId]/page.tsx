import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { createLesson, deleteLesson } from "@/app/admin/actions";
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
      lessons: { orderBy: { order: "asc" } },
    },
  });

  if (!mod || mod.courseId !== courseId) {
    notFound();
  }

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
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
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
              </CardContent>
            </Card>
          ))
        )}
      </section>
    </div>
  );
}
