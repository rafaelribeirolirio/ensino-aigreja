"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { signIn } from "@/lib/auth-client";
import { loginSchema } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const parsed = loginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Dados inválidos.");
      return;
    }

    setPending(true);

    const { error: authError } = await signIn.email({
      email: parsed.data.email,
      password: parsed.data.password,
      callbackURL: "/perfil",
    });

    if (authError) {
      setPending(false);
      if (authError.code === "EMAIL_NOT_VERIFIED") {
        setError(
          "Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada.",
        );
      } else if (authError.status === 401) {
        setError("E-mail ou senha inválidos.");
      } else {
        setError("Não foi possível entrar. Tente novamente.");
      }
      return;
    }

    router.push("/perfil");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Entrar</CardTitle>
        <CardDescription>
          Acesse com seu e-mail e senha para continuar aprendendo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error ? (
            <p
              role="alert"
              className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
            >
              {error}
            </p>
          ) : null}

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="voce@exemplo.com"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>

          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Entrando..." : "Entrar"}
          </Button>

          <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">
            Ainda não tem conta?{" "}
            <Link
              href="/cadastro"
              className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Criar conta
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
