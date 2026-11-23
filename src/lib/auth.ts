import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { sendVerificationEmail } from "./email";
import { prisma } from "./prisma";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    // Padrão seguro: exige verificação. Em dev, defina
    // REQUIRE_EMAIL_VERIFICATION="false" para entrar sem clicar no link.
    requireEmailVerification:
      process.env.REQUIRE_EMAIL_VERIFICATION !== "false",
    minPasswordLength: 8,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      const verificationUrl = new URL(url);
      verificationUrl.searchParams.set("callbackURL", "/perfil");

      await sendVerificationEmail({
        to: user.email,
        name: user.name,
        url: verificationUrl.toString(),
      });
    },
  },
  user: {
    additionalFields: {
      churchRole: {
        type: "string",
        required: false,
        input: false,
      },
      bio: {
        type: "string",
        required: false,
      },
    },
  },
});
