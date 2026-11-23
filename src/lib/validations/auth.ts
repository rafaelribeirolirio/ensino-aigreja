import * as z from "zod";

export const loginSchema = z.object({
  email: z.email("Informe um e-mail válido.").trim(),
  password: z.string().min(1, "Informe sua senha."),
});

export const signupSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Informe seu nome (mínimo 2 caracteres).")
      .max(80, "Nome muito longo."),
    email: z.email("Informe um e-mail válido.").trim(),
    password: z
      .string()
      .min(8, "A senha deve ter ao menos 8 caracteres.")
      .max(128, "Senha muito longa.")
      .regex(/[A-Za-z]/, "A senha deve conter ao menos uma letra.")
      .regex(/[0-9]/, "A senha deve conter ao menos um número."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas não conferem.",
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
