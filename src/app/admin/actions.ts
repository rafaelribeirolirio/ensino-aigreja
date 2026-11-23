"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireCapability } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import {
  courseSchema,
  lessonSchema,
  moduleSchema,
} from "@/lib/validations/content";
import { parseYouTubeId } from "@/lib/youtube";

function withError(path: string, message: string) {
  return `${path}?erro=${encodeURIComponent(message)}`;
}

export async function createCourse(formData: FormData) {
  const user = await requireCapability("manageContent");

  const parsed = courseSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    redirect(
      withError(
        "/admin/cursos",
        parsed.error.issues[0]?.message ?? "Dados inválidos.",
      ),
    );
  }

  const course = await prisma.course.create({
    data: { ...parsed.data, createdById: user.id },
    select: { id: true },
  });

  revalidatePath("/admin/cursos");
  revalidatePath("/cursos");
  redirect(`/admin/cursos/${course.id}`);
}

export async function updateCourse(formData: FormData) {
  await requireCapability("manageContent");

  const courseId = String(formData.get("courseId") ?? "");
  if (!courseId) {
    redirect("/admin/cursos");
  }

  const parsed = courseSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    redirect(
      withError(
        `/admin/cursos/${courseId}`,
        parsed.error.issues[0]?.message ?? "Dados inválidos.",
      ),
    );
  }

  await prisma.course.update({
    where: { id: courseId },
    data: {
      ...parsed.data,
      published: formData.get("published") === "on",
    },
  });

  revalidatePath(`/admin/cursos/${courseId}`);
  revalidatePath(`/cursos/${courseId}`);
  revalidatePath("/cursos");
  redirect(`/admin/cursos/${courseId}`);
}

export async function deleteCourse(formData: FormData) {
  await requireCapability("manageContent");

  const courseId = String(formData.get("courseId") ?? "");
  if (courseId) {
    await prisma.course.delete({ where: { id: courseId } }).catch(() => null);
  }

  revalidatePath("/admin/cursos");
  revalidatePath("/cursos");
  redirect("/admin/cursos");
}

export async function createModule(formData: FormData) {
  await requireCapability("manageContent");

  const parsed = moduleSchema.safeParse({
    courseId: formData.get("courseId"),
    title: formData.get("title"),
  });

  const courseId = String(formData.get("courseId") ?? "");
  const target = courseId ? `/admin/cursos/${courseId}` : "/admin/cursos";

  if (!parsed.success) {
    redirect(
      withError(
        target,
        parsed.error.issues[0]?.message ?? "Dados inválidos.",
      ),
    );
  }

  const order = await prisma.module.count({
    where: { courseId: parsed.data.courseId },
  });

  await prisma.module.create({
    data: {
      courseId: parsed.data.courseId,
      title: parsed.data.title,
      order,
    },
  });

  revalidatePath(target);
  revalidatePath(`/cursos/${parsed.data.courseId}`);
  redirect(target);
}

export async function deleteModule(formData: FormData) {
  await requireCapability("manageContent");

  const moduleId = String(formData.get("moduleId") ?? "");
  if (!moduleId) {
    redirect("/admin/cursos");
  }

  const mod = await prisma.module.findUnique({
    where: { id: moduleId },
    select: { courseId: true },
  });

  if (!mod) {
    redirect("/admin/cursos");
  }

  await prisma.module.delete({ where: { id: moduleId } });
  revalidatePath(`/admin/cursos/${mod.courseId}`);
  revalidatePath(`/cursos/${mod.courseId}`);
  redirect(`/admin/cursos/${mod.courseId}`);
}

export async function createLesson(formData: FormData) {
  const user = await requireCapability("manageContent");

  const moduleId = String(formData.get("moduleId") ?? "");
  const mod = moduleId
    ? await prisma.module.findUnique({
        where: { id: moduleId },
        select: { courseId: true },
      })
    : null;

  if (!mod) {
    redirect("/admin/cursos");
  }

  const target = `/admin/cursos/${mod.courseId}/modulos/${moduleId}`;

  const parsed = lessonSchema.safeParse({
    moduleId,
    title: formData.get("title"),
    type: formData.get("type"),
    videoInput: formData.get("videoInput"),
    textContent: formData.get("textContent"),
    durationMin: formData.get("durationMin"),
  });

  if (!parsed.success) {
    redirect(
      withError(
        target,
        parsed.error.issues[0]?.message ?? "Dados inválidos.",
      ),
    );
  }

  const videoId =
    parsed.data.type === "VIDEO"
      ? parseYouTubeId(parsed.data.videoInput)
      : null;

  if (parsed.data.type === "VIDEO" && !videoId) {
    redirect(
      withError(target, "Informe um link ou ID válido do YouTube para o vídeo."),
    );
  }

  const order = await prisma.lesson.count({ where: { moduleId } });

  await prisma.lesson.create({
    data: {
      moduleId,
      title: parsed.data.title,
      type: parsed.data.type,
      videoProvider: videoId ? "youtube" : null,
      videoId,
      textContent: parsed.data.textContent || null,
      durationMin: parsed.data.durationMin ?? null,
      order,
      createdById: user.id,
    },
  });

  revalidatePath(target);
  revalidatePath(`/cursos/${mod.courseId}`);
  redirect(target);
}

export async function deleteLesson(formData: FormData) {
  await requireCapability("manageContent");

  const lessonId = String(formData.get("lessonId") ?? "");
  if (!lessonId) {
    redirect("/admin/cursos");
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { moduleId: true, module: { select: { courseId: true } } },
  });

  if (!lesson) {
    redirect("/admin/cursos");
  }

  await prisma.lesson.delete({ where: { id: lessonId } });
  revalidatePath(
    `/admin/cursos/${lesson.module.courseId}/modulos/${lesson.moduleId}`,
  );
  revalidatePath(`/cursos/${lesson.module.courseId}`);
  redirect(
    `/admin/cursos/${lesson.module.courseId}/modulos/${lesson.moduleId}`,
  );
}
