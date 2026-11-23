# Plataforma de Ensino da Igreja

Plataforma de cursos, materiais de estudo, gamificação e fórum para a igreja.
A visão completa de produto e arquitetura está em
[`PLANO-PLATAFORMA.md`](./PLANO-PLATAFORMA.md).

## Stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript**
- **Tailwind CSS 4** + primitivas de UI próprias (estilo shadcn)
- **Better Auth** (e-mail/senha + verificação de e-mail)
- **Prisma 7** (driver adapter `@prisma/adapter-pg`) + **PostgreSQL**
- **Supabase** como Postgres gerenciado e storage de arquivos (produção)
- **Resend** para e-mail transacional (opcional no desenvolvimento)

## Requisitos

- Node.js 20+
- npm

## Configuração

```bash
npm install
cp .env.example .env
```

Gere um segredo para o Better Auth e preencha `BETTER_AUTH_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

### Banco de dados

**Opção A — Postgres local (Prisma dev), para desenvolvimento:**

```bash
npm run db:dev
```

Copie a `DATABASE_URL` impressa no terminal para o `.env` (o valor padrão do
`.env.example` já aponta para `localhost:51218`). Em outro terminal:

```bash
npm run db:push
```

> O servidor local do Prisma não suporta shadow database do jeito que o
> `prisma migrate dev` espera, então no dia a dia usamos `db:push`. Os arquivos
> em `prisma/migrations/` são a história de migrações para produção.

**Opção B — Supabase (produção):** crie um projeto, copie a Connection String
do pooler e use como `DATABASE_URL`. Depois rode `npm run db:deploy`.

### Rodando

```bash
npm run dev
```

Abra <http://localhost:3000>.

## Autenticação

- Cadastro em `/cadastro`, login em `/login`, perfil em `/perfil`.
- A verificação de e-mail é **obrigatória** antes do primeiro login.
- Sem `RESEND_API_KEY`, o link de verificação é impresso no console do
  servidor (útil no desenvolvimento).
- `/perfil` é protegido no `src/proxy.ts` (checagem otimista do cookie) e no
  DAL do servidor (`src/lib/session.ts`), que é a checagem segura.

## Scripts

| Script | Descrição |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Servidor de produção |
| `npm run lint` | ESLint |
| `npm run typecheck` | Checagem de tipos |
| `npm run db:dev` | Postgres local (Prisma dev) |
| `npm run db:push` | Sincroniza o schema no banco local (dev) |
| `npm run db:migrate` | Cria/aplica migrações (requer shadow database) |
| `npm run db:deploy` | Aplica migrações (produção) |
| `npm run db:generate` | Gera o Prisma Client |
| `npm run db:studio` | Prisma Studio |

## Estrutura

```
prisma/
  schema.prisma        # models do domínio + Better Auth
  migrations/
src/
  app/
    (auth)/            # login e cadastro
    api/auth/[...all]/ # handler do Better Auth
    cursos/ forum/     # placeholders (fases futuras)
    perfil/            # perfil do usuário
    verificar-email/
  components/          # header, footer e primitivas de UI
  lib/                 # auth, prisma, sessão, e-mail e validações
  proxy.ts             # proteção otimista de rotas
```

## Próximas fases

1. **Conteúdo** — CRUD de cursos/módulos/aulas, upload no Supabase Storage,
   embed de vídeo do YouTube.
2. **Gamificação** — ledger de pontos, emblemas e ranking.
3. **Fórum** — categorias, tópicos, respostas e moderação.
