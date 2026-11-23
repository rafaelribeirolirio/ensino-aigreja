import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-neutral-500 sm:flex-row sm:items-center sm:justify-between dark:text-neutral-400">
        <p>Plataforma de ensino da igreja.</p>
        <nav className="flex items-center gap-4">
          <Link href="/cursos" className="hover:text-neutral-900 dark:hover:text-white">
            Cursos
          </Link>
          <Link href="/forum" className="hover:text-neutral-900 dark:hover:text-white">
            Fórum
          </Link>
          <Link href="/login" className="hover:text-neutral-900 dark:hover:text-white">
            Entrar
          </Link>
        </nav>
      </div>
    </footer>
  );
}
