import { Suspense } from "react";

import {
  createMaterial,
  deleteMaterial,
  toggleMaterialPublished,
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
import { resolveFileUrl } from "@/lib/files";
import { requireCapability } from "@/lib/guards";
import { prisma } from "@/lib/prisma";

type SearchParams = Promise<{ erro?: string }>;

export default function AdminMaterialsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <Suspense
      fallback={
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Carregando materiais...
        </p>
      }
    >
      <Content searchParams={searchParams} />
    </Suspense>
  );
}

async function Content({ searchParams }: { searchParams: SearchParams }) {
  await requireCapability("manageMaterials");
  const { erro } = await searchParams;

  const materials = await prisma.material.findMany({
    orderBy: { createdAt: "desc" },
  });
  const urls = await Promise.all(
    materials.map((material) => resolveFileUrl(material.filePath)),
  );

  return (
    <div className="flex flex-col gap-8">
      {erro ? <ErrorBox message={erro} /> : null}

      <Card>
        <CardHeader>
          <CardTitle>Novo material</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createMaterial} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                name="title"
                placeholder="Ex.: Apostila de estudo"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea id="description" name="description" />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="category">Categoria (opcional)</Label>
              <Input
                id="category"
                name="category"
                placeholder="Ex.: Discipulado, Família..."
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="fileUrl">URL do arquivo</Label>
              <Input
                id="fileUrl"
                name="fileUrl"
                placeholder="https://... (ou envie um arquivo abaixo)"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="file">Ou envie um arquivo</Label>
              <Input id="file" name="file" type="file" />
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                O envio de arquivos exige o Supabase Storage configurado.
              </p>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="published" className="h-4 w-4" />
              Publicar na biblioteca
            </label>

            <Button type="submit" className="self-start">
              Adicionar material
            </Button>
          </form>
        </CardContent>
      </Card>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Biblioteca</h2>
        {materials.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Nenhum material ainda.
          </p>
        ) : (
          materials.map((material, index) => (
            <Card key={material.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="flex flex-col gap-1">
                  <p className="font-medium">{material.title}</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {material.category ? `${material.category} · ` : ""}
                    {material.published ? "Publicado" : "Rascunho"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {urls[index] ? (
                    <a
                      href={urls[index] ?? "#"}
                      target="_blank"
                      rel="noreferrer"
                      className={buttonVariants({
                        variant: "ghost",
                        size: "sm",
                      })}
                    >
                      Abrir
                    </a>
                  ) : null}
                  <form action={toggleMaterialPublished}>
                    <input
                      type="hidden"
                      name="materialId"
                      value={material.id}
                    />
                    <Button type="submit" variant="outline" size="sm">
                      {material.published ? "Despublicar" : "Publicar"}
                    </Button>
                  </form>
                  <form action={deleteMaterial}>
                    <input
                      type="hidden"
                      name="materialId"
                      value={material.id}
                    />
                    <ConfirmSubmit
                      message={`Excluir o material "${material.title}"?`}
                    >
                      Excluir
                    </ConfirmSubmit>
                  </form>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </section>
    </div>
  );
}
