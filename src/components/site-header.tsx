"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, LogOut, Settings, User } from "lucide-react";

import { can } from "@/lib/authz";
import { signOut, useSession } from "@/lib/auth-client";
import { Button, buttonVariants } from "@/components/ui/button";

export function SiteHeader() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const role = (session?.user as { churchRole?: string | null } | undefined)
    ?.churchRole;

  async function handleSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/80 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <span>Ensino</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-neutral-600 sm:flex dark:text-neutral-300">
          <Link href="/cursos" className="transition-colors hover:text-neutral-900 dark:hover:text-white">
            Cursos
          </Link>
          <Link href="/materiais" className="transition-colors hover:text-neutral-900 dark:hover:text-white">
            Materiais
          </Link>
          <Link href="/forum" className="transition-colors hover:text-neutral-900 dark:hover:text-white">
            Fórum
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {isPending ? (
            <div className="h-9 w-24 animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-800" />
          ) : session ? (
            <>
              {can(role, "manageContent") ? (
                <Link
                  href="/admin"
                  className={buttonVariants({ variant: "ghost", size: "sm" })}
                >
                  <Settings className="h-4 w-4" />
                  Admin
                </Link>
              ) : null}
              <Link
                href="/perfil"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                <User className="h-4 w-4" />
                Perfil
              </Link>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Entrar
              </Link>
              <Link
                href="/cadastro"
                className={buttonVariants({ variant: "default", size: "sm" })}
              >
                Criar conta
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
