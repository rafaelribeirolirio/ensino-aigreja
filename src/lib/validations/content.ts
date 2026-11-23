import * as z from "zod";

export const courseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "O título deve ter ao menos 3 caracteres.")
    .max(120, "Título muito longo."),
  description: z
    .string()
    .trim()
    .min(1, "Informe uma descrição.")
    .max(2000, "Descrição muito longa."),
});

export const moduleSchema = z.object({
  courseId: z.string().min(1),
  title: z
    .string()
    .trim()
    .min(2, "O título deve ter ao menos 2 caracteres.")
    .max(120, "Título muito longo."),
});

export const lessonSchema = z.object({
  moduleId: z.string().min(1),
  title: z
    .string()
    .trim()
    .min(2, "O título deve ter ao menos 2 caracteres.")
    .max(160, "Título muito longo."),
  type: z.enum(["VIDEO", "PDF", "EBOOK", "TEXT"]),
  videoInput: z.string().trim().optional(),
  textContent: z.string().trim().optional(),
  durationMin: z.preprocess(
    (value) => (value === "" || value == null ? undefined : value),
    z.coerce.number().int().min(0).max(2000).optional(),
  ),
});

export type CourseInput = z.infer<typeof courseSchema>;
export type ModuleInput = z.infer<typeof moduleSchema>;
export type LessonInput = z.infer<typeof lessonSchema>;
