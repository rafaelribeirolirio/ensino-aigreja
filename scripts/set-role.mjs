import { Client } from "pg";

const ALLOWED = new Set(["MEMBER", "TEACHER", "LEADER", "ADMIN"]);

const [emailArg, roleArg = "ADMIN"] = process.argv.slice(2);
const email = emailArg?.trim().toLowerCase();
const role = roleArg.toUpperCase();

if (!email) {
  console.error(
    "Uso: npm run db:set-role -- email@exemplo.com [ADMIN|TEACHER|LEADER|MEMBER]",
  );
  process.exit(1);
}

if (!ALLOWED.has(role)) {
  console.error(
    `Cargo inválido: ${role}. Use MEMBER, TEACHER, LEADER ou ADMIN.`,
  );
  process.exit(1);
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL não definido. Verifique o arquivo .env.");
  process.exit(1);
}

const client = new Client({ connectionString });

try {
  await client.connect();

  const result = await client.query(
    'update "user" set "churchRole" = $2::"ChurchRole", "updatedAt" = now() where lower(email) = $1 returning email, "churchRole"',
    [email, role],
  );

  if (result.rowCount === 0) {
    console.log(`Nenhum usuário encontrado com o e-mail ${email}.`);
  } else {
    console.log(
      `OK: ${result.rows[0].email} agora é ${result.rows[0].churchRole}.`,
    );
    console.log("Saia e entre de novo no site para atualizar a sessão.");
  }
} catch (error) {
  console.error("Erro ao atualizar o cargo:", error.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
