import Link from "next/link";
import { MailCheck } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Verifique seu e-mail",
};

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
            <MailCheck className="h-5 w-5" />
          </div>
          <CardTitle>Confirme seu e-mail</CardTitle>
          <CardDescription>
            Enviamos um link de confirmação para o seu e-mail. Abra a mensagem e
            clique no botão para ativar sua conta.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm text-neutral-500 dark:text-neutral-400">
          <p>
            Não encontrou? Verifique a pasta de spam ou lixo eletrônico.
          </p>
          <Link
            href="/login"
            className={buttonVariants({ variant: "outline", className: "mt-2" })}
          >
            Ir para o login
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
