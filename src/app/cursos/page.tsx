import { BookOpen } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Cursos",
};

export default function CoursesPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-16">
      <Card>
        <CardHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
            <BookOpen className="h-5 w-5" />
          </div>
          <CardTitle>Cursos</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-neutral-600 dark:text-neutral-400">
          O catálogo de cursos em vídeo, ebooks e PDFs está em construção. Em
          breve você poderá se inscrever e acompanhar seu progresso por aqui.
        </CardContent>
      </Card>
    </div>
  );
}
