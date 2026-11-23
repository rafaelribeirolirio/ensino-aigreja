"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { signUp } from "@/lib/auth-client";
import { signupSchema } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const parsed = signupSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Dados inválidos.");
      return;
    }

    setPending(true);

    const { error: authError } = await signUp.email({
      name: parsed.data.name,
      email: parsed.data.email,
      password: parsed.data.password,
      callbackURL: "/perfil",
    });

    if (authError) {
      setPending(false);
      if (authError.code === "USER_ALREADY_EXISTS") {
        setError("Este e-mail já está cadastrado. Tente entrar.");
      } else {
        setError("Não foi possível criar a conta. Tente novamente.");
      }
      return;
    }

    router.push("/verificar-email");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Criar conta</CardTitle>
        <CardDescription>
          Preencha seus dados para começar a usar a plataforma.
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
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              name="name"
              autoComplete="name"
              placeholder="Seu nome"
              required
            />
          </div>

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
              autoComplete="new-password"
              required
            />
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Mínimo de 8 caracteres, com letras e números.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="confirmPassword">Confirmar senha</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
            />
          </div>

          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Criando conta..." : "Criar conta"}
          </Button>

          <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">
            Já tem uma conta?{" "}
            <Link
              href="/login"
              className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Entrar
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
