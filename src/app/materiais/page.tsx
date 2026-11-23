import { Suspense } from "react";
import { FileText } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { resolveFileUrl } from "@/lib/files";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Materiais",
};

export default function MaterialsPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12">
      <header className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Materiais</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Ebooks, PDFs e recursos de estudo para aprofundar cada tema.
        </p>
      </header>

      <Suspense
        fallback={
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Carregando materiais...
          </p>
        }
      >
        <MaterialList />
      </Suspense>
    </div>
  );
}

async function MaterialList() {
  const materials = await prisma.material.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });

  const urls = await Promise.all(
    materials.map((material) => resolveFileUrl(material.filePath)),
  );

  if (materials.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nenhum material publicado ainda</CardTitle>
          <CardDescription>
            Assim que um material for publicado, ele aparecerá aqui.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {materials.map((material, index) => (
        <Card key={material.id} className="flex flex-col">
          <CardHeader>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <FileText className="h-5 w-5" />
            </div>
            <CardTitle>{material.title}</CardTitle>
            {material.description ? (
              <CardDescription className="line-clamp-3">
                {material.description}
              </CardDescription>
            ) : null}
            {material.category ? (
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {material.category}
              </p>
            ) : null}
          </CardHeader>
          <CardContent className="mt-auto">
            {urls[index] ? (
              <a
                href={urls[index] ?? "#"}
                target="_blank"
                rel="noreferrer"
                className={buttonVariants({ size: "sm" })}
              >
                Abrir material
              </a>
            ) : (
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                Arquivo indisponível no momento.
              </span>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
