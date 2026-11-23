import { MessagesSquare } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Fórum",
};

export default function ForumPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-16">
      <Card>
        <CardHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
            <MessagesSquare className="h-5 w-5" />
          </div>
          <CardTitle>Fórum</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-neutral-600 dark:text-neutral-400">
          A área de fórum, organizada por tópicos, chega na Fase 3. Lá você
          poderá fazer perguntas, ajudar outras pessoas e compartilhar
          indicações.
        </CardContent>
      </Card>
    </div>
  );
}
