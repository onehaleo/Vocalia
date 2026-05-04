import { notFound, redirect } from "next/navigation";
import { resolveLessonPathById } from "@/lib/learning";

export default async function LegacyLessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const path = await resolveLessonPathById(lessonId);
  if (!path) notFound();
  redirect(`/learn/${path.levelCode}/${path.moduleSlug}/${path.lessonSlug}`);
}
