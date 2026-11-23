import "server-only";

import { Resend } from "resend";

type VerificationEmailInput = {
  to: string;
  name: string;
  url: string;
};

export async function sendVerificationEmail({
  to,
  name,
  url,
}: VerificationEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;

  // Em desenvolvimento, sem chave de e-mail, o link é impresso no console.
  if (!apiKey) {
    console.log(`\n[auth] Link de verificação para ${to}:\n${url}\n`);
    return;
  }

  const resend = new Resend(apiKey);
  const from =
    process.env.EMAIL_FROM ?? "Plataforma da Igreja <nao-responda@exemplo.com>";

  await resend.emails.send({
    from,
    to,
    subject: "Confirme seu e-mail",
    html: `
      <div style="font-family: system-ui, sans-serif; line-height: 1.6">
        <h1 style="font-size: 20px">Olá, ${name}!</h1>
        <p>Falta pouco para começar a usar a plataforma de ensino.</p>
        <p>Confirme seu e-mail clicando no botão abaixo:</p>
        <p>
          <a href="${url}"
             style="display: inline-block; padding: 12px 20px; border-radius: 8px; background: #4f46e5; color: #fff; text-decoration: none;">
            Confirmar e-mail
          </a>
        </p>
        <p style="color: #6b7280; font-size: 14px">
          Se você não criou esta conta, ignore esta mensagem.
        </p>
      </div>
    `,
  });
}
