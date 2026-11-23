# Plataforma de Ensino da Igreja — Documento de Instrução

> Especificação de produto, arquitetura e stack para a construção da plataforma
> de ensino (cursos, ebooks, PDFs, gamificação e fórum) da igreja.

## 1. Contexto e decisões de base

| Decisão | Valor |
| --- | --- |
| Público-alvo | Membros da igreja |
| Porte esperado | 200 a 1.000 usuários ativos |
| Orçamento de infra | Até ~US$ 50/mês |
| Construção/manutenção | Autor do projeto + comunidade (documentado para contribuição) |
| Escopo do MVP | Cursos, perfil, emblemas, ranking, pontos acumulados e fórum |
| Fora do MVP | Resgate de pontos por recompensas (lanchonete/loja/eventos) |
| Banco + arquivos | **Supabase** como Postgres gerenciado e Storage (sem Supabase Auth) |
| Vídeo no MVP | **YouTube não listado** (migrar para Bunny/Stream depois) |

### Princípio central
Construir um **MVP enxuto e evolutivo**. Primeiro entregar o núcleo de
aprendizado + engajamento; recompensas e integrações entram depois, sem
retrabalho de schema (o ledger de pontos já nasce preparado para resgate).

### Estado atual (Fase 0 concluída)
- Next.js 16 + React 19 + TypeScript + Tailwind 4 no ar.
- Prisma 7 com driver adapter `@prisma/adapter-pg`; schema completo do domínio
  (cursos, progresso, gamificação, fórum) + tabelas do Better Auth.
- Cadastro, login, verificação de e-mail, logout e perfil básico funcionando.
- Proteção de rota em `src/proxy.ts` + checagem segura no DAL.
- UI com primitivas próprias no estilo shadcn (Button, Input, Label, Card).
- Banco local de dev via `npm run db:dev` (Prisma dev). Em produção, Supabase.

---

## 2. Escopo funcional

### 2.1 Autenticação e perfil
- Cadastro com **e-mail e senha** (verificação de e-mail) + login.
- Login social opcional (Google) — avaliar depois.
- Perfil com: nome, foto, bio, cargo(s) na igreja, data de entrada.
- Título exibido no fórum = cargo (se houver) ou nível de participação.

### 2.2 Conteúdo / cursos
- Cursos com módulos e aulas.
- Aulas podem ser: **vídeo**, **PDF**, **ebook (arquivo)** ou texto.
- Acompanhamento de progresso por aula e conclusão de curso.
- Catálogo com filtros e busca.

### 2.3 Gamificação
- **Pontos** por ações (aulas, cursos, participação no fórum, sequência diária).
- **Emblemas** por conquistas (regras configuráveis).
- **Ranking** de usuários ativos (semanal e geral).

### 2.4 Fórum
- Organizado por **categorias/tópicos**.
- Threads com perguntas, respostas, reações e indicações.
- No post aparece: username, foto, emblemas, tempo de plataforma e título.
- Moderação (denúncias, ocultar post, banir).

### 2.5 Administração
- CRUD de cursos, aulas, arquivos.
- CRUD de emblemas e regras de pontos.
- Gestão de usuários, cargos e moderação do fórum.

### 2.6 Permissões, autoria e criação de conteúdo

A autorização é baseada em **capacidades** derivadas do cargo (`ChurchRole`),
centralizadas em `src/lib/authz.ts` e verificadas no servidor por
`requireCapability()` (`src/lib/guards.ts`). A UI apenas esconde o que o
usuário não pode fazer; a decisão real é sempre do servidor.

| Capacidade | MEMBER | TEACHER | LEADER | ADMIN |
| --- | :-: | :-: | :-: | :-: |
| Participar do fórum (threads, respostas, reações) | ✅ | ✅ | ✅ | ✅ |
| Assistir aulas e registrar progresso | ✅ | ✅ | ✅ | ✅ |
| Criar cursos, módulos, aulas e materiais | — | ✅ | — | ✅ |
| Criar categorias ("tópicos") do fórum | — | — | ✅ | ✅ |
| Moderar fórum (ocultar, fixar, trancar) | — | — | ✅ | ✅ |
| Criar/editar emblemas | — | — | — | ✅ |

- **Conteúdo:** `manageContent` (TEACHER/ADMIN) cria cursos, módulos e aulas;
  `manageMaterials` (TEACHER/ADMIN) gerencia anexos e a biblioteca.
- **Autoria:** `createdById` em `Course`, `Lesson`, `Material`,
  `ForumCategory` e `Badge` (o módulo herda a autoria do curso).
- **Materiais:** `LessonAttachment` (vários anexos por aula) e `Material`
  (biblioteca independente, não presa a uma aula).
- **Fórum:** qualquer membro autenticado cria threads e responde/reage;
  LEADER/ADMIN criam as categorias e moderam.
- **Emblemas:** somente ADMIN (`manageBadges`).
- Toda Server Action/Route Handler que grava conteúdo deve chamar
  `requireCapability(...)` antes da mutação.

---

## 3. Stack recomendada

| Camada | Escolha | Motivo |
| --- | --- | --- |
| Framework | **Next.js (App Router) + TypeScript** | Front + API juntos, deploy fácil |
| UI | **Tailwind CSS + primitivas próprias (estilo shadcn)** | Rápido, acessível, customizável |
| Autenticação | **Better Auth** | Email/senha, sessões, extensível |
| ORM/DB | **Prisma 7 (adapter-pg) + PostgreSQL (Supabase)** | Tipagem, migrações, gerenciado |
| Arquivos (PDF/imagem) | **Supabase Storage** | URL assinada, mesmo provedor do banco |
| Vídeo (MVP) | **YouTube não listado** (embed via `youtube-nocookie`) | Custo zero; migrar para CDN própria depois |
| Vídeo (futuro) | **Bunny Stream** | URLs assinadas, sem anúncios, player próprio |
| E-mail transacional | **Resend** (free tier) | Verificação e notificações |
| Deploy | **Vercel** | Integração nativa com Next.js |
| Cron/Jobs | Vercel Cron | Atualizar ranking, e-mails |
| Testes | Vitest + Playwright | Unitário e E2E |

### Custos estimados (mensal)
- Vercel Pro: ~US$ 20 (Hobby só para uso não comercial).
- Supabase Pro: ~US$ 25 **ou** Free no início (free pausa após inatividade).
- Vídeo (YouTube não listado): **US$ 0** no MVP.
- Domínio + e-mail (Resend free): ~US$ 2.
- **Total inicial: US$ 0–10** (free tiers) e **~US$ 47** com Supabase/Vercel Pro.

> Migração futura de vídeo: Bunny Stream ~US$ 5–10/mês no porte esperado.
> O schema já prevê `provider` + `videoId`, então a troca não exige migração de dados.

---

## 4. Arquitetura

```
┌─────────────────────────────┐
│        Navegador            │
└──────────────┬──────────────┘
               │ HTTPS
┌──────────────▼──────────────┐
│  Next.js (Vercel)           │
│  ├─ App Router / Server     │
│  │   Components / Actions   │
│  ├─ API Routes              │
│  └─ Auth (Better Auth)      │
└───┬───────────┬─────────────┘
    │           │
    │           ├──────────────► Resend (e-mail)
    │           │
    │           ├──────────────► YouTube (vídeo não listado, embed)
    │           │
    │           └──────────────► Supabase Storage (PDFs, imagens)
    │
┌───▼─────────────────────────┐
│ Supabase — PostgreSQL       │
│  Prisma ORM                 │
└─────────────────────────────┘
```

### Diretrizes
- **Vídeo nunca trafega pelo servidor da aplicação.** No MVP, o app guarda o
  `videoId` do YouTube e renderiza o embed `youtube-nocookie`. Na migração para
  Bunny/Stream, passa a emitir URLs assinadas com expiração curta.
- **Pontos via ledger** (tabela de transações), nunca um campo `points`
  mutável. O total é agregado/exibido a partir do ledger.
- **Ranking por materialized view** recalculada por cron (ex.: a cada 15 min),
  evitando agregação pesada em tempo real.
- Validação de dados com **Zod** nas Server Actions/API.
- Acesso a conteúdo pago/restrito sempre checado no servidor (nunca só no client).

---

## 5. Modelo de dados (Prisma — núcleo)

```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String
  name          String
  avatarUrl     String?
  bio           String?
  churchRole    ChurchRole?      // cargo na igreja (opcional)
  emailVerified DateTime?
  createdAt     DateTime @default(now())

  profile       Profile?
  enrollments   Enrollment[]
  progress      LessonProgress[]
  posts         ForumPost[]
  points        PointTransaction[]
  badges        UserBadge[]
}

enum ChurchRole {
  MEMBER
  TEACHER
  LEADER
  ADMIN
}

model Course {
  id          String   @id @default(cuid())
  title       String
  description String
  coverUrl    String?
  published   Boolean  @default(false)
  modules     Module[]
  enrollments Enrollment[]
}

model Module {
  id       String   @id @default(cuid())
  courseId String
  title    String
  order    Int
  course   Course   @relation(fields: [courseId], references: [id])
  lessons  Lesson[]
}

enum LessonType { VIDEO PDF EBOOK TEXT }

model Lesson {
  id           String     @id @default(cuid())
  moduleId     String
  title        String
  type         LessonType
  videoProvider String?   // "youtube" (MVP) | "bunny" (futuro)
  videoId      String?    // id do vídeo no provider
  filePath     String?    // caminho/chave no Supabase Storage (PDF/ebook)
  textContent  String?
  durationMin  Int?
  order        Int
  module       Module     @relation(fields: [moduleId], references: [id])
  progress     LessonProgress[]
}

model Enrollment {
  id        String   @id @default(cuid())
  userId    String
  courseId  String
  createdAt DateTime @default(now())
  completedAt DateTime?
  user      User     @relation(fields: [userId], references: [id])
  course    Course   @relation(fields: [courseId], references: [id])
  @@unique([userId, courseId])
}

model LessonProgress {
  id          String   @id @default(cuid())
  userId      String
  lessonId    String
  completed   Boolean  @default(false)
  completedAt DateTime?
  user        User     @relation(fields: [userId], references: [id])
  lesson      Lesson   @relation(fields: [lessonId], references: [id])
  @@unique([userId, lessonId])
}

model Badge {
  id          String   @id @default(cuid())
  key         String   @unique          // ex.: "first_course"
  name        String
  description String
  iconUrl     String?
  rule        Json                       // {"type":"courses_completed","value":1}
  rewards     UserBadge[]
}

model UserBadge {
  id       String   @id @default(cuid())
  userId   String
  badgeId  String
  earnedAt DateTime @default(now())
  user     User   @relation(fields: [userId], references: [id])
  badge    Badge  @relation(fields: [badgeId], references: [id])
  @@unique([userId, badgeId])
}

model PointTransaction {
  id          String   @id @default(cuid())
  userId      String
  amount      Int                        // positivo = ganho, negativo = resgate
  reason      String                     // LESSON_DONE, COURSE_DONE, POST...
  refId       String?                    // id do recurso de origem
  createdAt   DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id])
  @@index([userId, createdAt])
}

model ForumCategory {
  id       String  @id @default(cuid())
  name     String
  slug     String  @unique
  threads  ForumThread[]
}

model ForumThread {
  id         String   @id @default(cuid())
  categoryId String
  authorId   String
  title      String
  createdAt  DateTime @default(now())
  pinned     Boolean  @default(false)
  locked     Boolean  @default(false)
  category   ForumCategory @relation(fields: [categoryId], references: [id])
  posts      ForumPost[]
}

model ForumPost {
  id        String   @id @default(cuid())
  threadId  String
  authorId  String
  body      String
  createdAt DateTime @default(now())
  hidden    Boolean  @default(false)
  thread    ForumThread @relation(fields: [threadId], references: [id])
  author    User        @relation(fields: [authorId], references: [id])
  reactions Reaction[]
}

model Reaction {
  id       String @id @default(cuid())
  postId   String
  userId   String
  type     String @default("like")   // like, helpful, amen...
  post     ForumPost @relation(fields: [postId], references: [id])
  @@unique([postId, userId, type])
}
```

Além do núcleo acima, o schema real (`prisma/schema.prisma`) inclui as
**capacidades de autoria**: `createdById` em `Course`, `Lesson`, `Material`,
`ForumCategory` e `Badge`, o modelo `LessonAttachment` (vários anexos por
aula) e o modelo `Material` (biblioteca independente de materiais).

Opcional: `Profile` separado se o `User` ficar grande (dados pessoais e
preferências), mantendo `User` só com autenticação.

---

## 6. Regras de gamificação

### 6.1 Pontos (exemplo inicial — ajustável)
| Ação | Pontos | Regra anti-abuso |
| --- | --- | --- |
| Concluir aula | +10 | 1x por aula |
| Concluir curso | +50 | bônus único |
| Criar tópico no fórum | +2 | limite diário |
| Resposta marcada "útil" | +5 | requer reação de outro usuário |
| Sequência diária | +5 | 1x/dia |

Implementação: ao completar ação, inserir em `PointTransaction`
(idempotente por `userId + reason + refId`). Total = `SUM(amount)`.

### 6.2 Emblemas (regras no campo `rule`)
- `first_lesson` — concluiu 1 aula.
- `first_course` — concluiu 1 curso.
- `five_courses` — concluiu 5 cursos.
- `helpful` — 10 respostas marcadas úteis.
- `streak_7` — 7 dias seguidos.
Avaliação via job após eventos relevantes; grava `UserBadge` (único).

### 6.3 Ranking
- Janelas: **semanal** e **geral**.
- Fonte: `PointTransaction` agregado por período.
- **Materialized view** `leaderboard_weekly`/`leaderboard_alltime`,
  refresh por cron. Nunca calcular no request do usuário.
- Critérios extras (aulas/cursos/comentários) expostos como estatísticas no perfil.

### 6.4 Títulos exibidos no fórum
- Se `churchRole` definido → exibir cargo (Professor, Líder, Admin).
- Senão → nível por participação (ex.: Novato → Constante → Veterano),
  derivado de pontos/tempo. Documentar os limiares.

---

## 7. Segurança, privacidade e LGPD
- Senhas com hash forte (Argon2/bcrypt via Better Auth).
- Sessões seguras (httpOnly, Secure, SameSite).
- **Menores de idade**: exigir consentimento de responsável e coletar o
  mínimo de dados; prever fluxo de exclusão de conta/dados.
- Política de privacidade e termos de uso acessíveis.
- Rate limiting em login, cadastro e postagens.
- Moderação do fórum com log de ações administrativas.
- Arquivos do Supabase Storage servidos por **URL assinada e expirável**; nunca
  caminhos públicos permanentes.
- **Limitação assumida do MVP:** vídeo no YouTube não listado é acessível a quem
  tiver o link/embed — não há controle real de acesso. Migrar para Bunny quando
  isso importar.
- Backup periódico do banco (Supabase já oferece).

---

## 8. Roadmap sugerido

### Fase 0 — Fundação (1–2 semanas)
- Setup Next.js + TS + Tailwind + shadcn/ui.
- Prisma + Postgres + migrações iniciais.
- Better Auth: cadastro, login, verificação de e-mail, sessão.
- Layout base, navegação, perfil básico.

### Fase 1 — Conteúdo
- CRUD admin de cursos/módulos/aulas.
- Upload de PDF/ebook/imagem no Supabase Storage (URL assinada).
- Vídeo via **embed do YouTube não listado** (`youtube-nocookie`); guardar
  `videoProvider` + `videoId` para permitir migração futura sem migrar dados.
- Catálogo, player, marcação de progresso e conclusão.

### Fase 2 — Gamificação
- Ledger de pontos + eventos.
- Emblemas e regras.
- Estatísticas no perfil e ranking (materialized view + cron).

### Fase 3 — Fórum
- Categorias, threads, posts, reações.
- Perfil no post (foto, emblemas, tempo, título).
- Denúncias e ferramentas de moderação.

### Fase 4 — Pós-MVP
- Resgate de pontos (recompensas, aprovação de admin, extrato).
- Notificações (e-mail/in-app).
- Busca avançada, certificados, login social.
- Painel de métricas de engajamento.

---

## 9. Checklist de qualidade (por entrega)
- [ ] Tipos e validação (Zod) nas entradas.
- [ ] Autorização checada no servidor para todo conteúdo restrito.
- [ ] Testes unitários das regras de pontos/emblemas.
- [ ] Teste E2E do fluxo: cadastro → curso → conclusão → pontos.
- [ ] Lint + typecheck no CI.
- [ ] Sem segredos no repositório (usar variáveis de ambiente).
- [ ] Revisão de acessibilidade (contraste, teclado, labels).

---

## 10. Variáveis de ambiente (referência)
```
DATABASE_URL=                 # Supabase (connection pooling)
AUTH_SECRET=
RESEND_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=    # server-side apenas
SUPABASE_STORAGE_BUCKET=
APP_URL=
# Vídeo no MVP: apenas videoId do YouTube (sem chave de API).
# Futuro (Bunny Stream): BUNNY_API_KEY, BUNNY_LIBRARY_ID
```

---

## 11. Próximos passos
1. Criar projeto no Supabase e configurar bucket de Storage.
2. Criar repositório e scaffold do Next.js + Prisma.
3. Modelar migrações iniciais e autenticação (Better Auth).
4. Definir tabela de pontos e regras de emblemas em um arquivo de configuração.
5. Iniciar Fase 0.

### Decisões já fechadas
- Supabase = **somente Postgres + Storage** (auth fica com Better Auth).
- Vídeo no MVP = **YouTube não listado**; schema preparado para Bunny no futuro.
