"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function enroll(formData: FormData) {
  const user = await getCurrentUser();
  const courseId = String(formData.get("courseId") ?? "");

  if (!courseId) {
    return;
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, published: true },
  });

  if (!course || !course.published) {
    return;
  }

  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: user.id, courseId } },
    create: { userId: user.id, courseId },
    update: {},
  });

  revalidatePath(`/cursos/${courseId}`);
  revalidatePath("/cursos");
}

export async function completeLesson(formData: FormData) {
  const user = await getCurrentUser();
  const lessonId = String(formData.get("lessonId") ?? "");

  if (!lessonId) {
    return;
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { module: { select: { courseId: true } } },
  });

  if (!lesson) {
    return;
  }

  const courseId = lesson.module.courseId;

  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: user.id, courseId } },
    create: { userId: user.id, courseId },
    update: {},
  });

  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId } },
    create: {
      userId: user.id,
      lessonId,
      completed: true,
      completedAt: new Date(),
    },
    update: {
      completed: true,
      completedAt: new Date(),
    },
  });

  const [totalLessons, completedLessons] = await Promise.all([
    prisma.lesson.count({ where: { module: { courseId } } }),
    prisma.lessonProgress.count({
      where: {
        userId: user.id,
        completed: true,
        lesson: { module: { courseId } },
      },
    }),
  ]);

  if (totalLessons > 0 && completedLessons >= totalLessons) {
    await prisma.enrollment.update({
      where: { userId_courseId: { userId: user.id, courseId } },
      data: { completedAt: new Date() },
    });
  }

  revalidatePath(`/cursos/${courseId}/aulas/${lessonId}`);
  revalidatePath(`/cursos/${courseId}`);
  revalidatePath("/cursos");
}
