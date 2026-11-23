import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-neutral-200 pb-4 dark:border-neutral-800">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
            Administração
          </p>
          <h1 className="text-2xl font-bold tracking-tight">
            Gestão de conteúdo
          </h1>
        </div>
        <nav className="flex items-center gap-4 text-sm">
          <Link
            href="/admin/cursos"
            className="hover:text-neutral-900 dark:hover:text-white"
          >
            Cursos
          </Link>
          <Link
            href="/admin/materiais"
            className="hover:text-neutral-900 dark:hover:text-white"
          >
            Materiais
          </Link>
          <Link
            href="/cursos"
            className="hover:text-neutral-900 dark:hover:text-white"
          >
            Ver site
          </Link>
        </nav>
      </div>
      {children}
    </div>
  );
}
