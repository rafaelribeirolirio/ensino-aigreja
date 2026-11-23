import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  FileText,
  MessagesSquare,
  Sparkles,
  Trophy,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: BookOpen,
    title: "Cursos em vídeo",
    description:
      "Trilhas de aprendizado organizadas em módulos e aulas, no seu ritmo.",
  },
  {
    icon: FileText,
    title: "Ebooks e PDFs",
    description:
      "Materiais de estudo para aprofundar cada tema e revisar quando quiser.",
  },
  {
    icon: Trophy,
    title: "Emblemas e pontos",
    description:
      "Ganhe pontos ao concluir aulas e participe do ranking de membros ativos.",
  },
  {
    icon: MessagesSquare,
    title: "Fórum da comunidade",
    description:
      "Tire dúvidas, compartilhe indicações e ajude outras pessoas a crescer.",
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4">
      <section className="flex flex-col items-start gap-6 py-20 sm:py-28">
        <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300">
          <Sparkles className="h-3.5 w-3.5" />
          Plataforma de ensino da igreja
        </span>

        <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
          Cresça no conhecimento,{" "}
          <span className="text-indigo-600 dark:text-indigo-400">juntos</span>.
        </h1>

        <p className="max-w-2xl text-lg text-neutral-600 dark:text-neutral-400">
          Um só lugar para assistir aulas, estudar materiais, conquistar
          emblemas e conversar com a comunidade. Aprender fica mais leve quando
          caminhamos em comunhão.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/cadastro"
            className={buttonVariants({ size: "lg" })}
          >
            Criar conta
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            Já tenho conta
          </Link>
        </div>
      </section>

      <section className="grid gap-4 pb-24 sm:grid-cols-2">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.title}>
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
