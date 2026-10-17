import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { curriculum, findLesson } from "@/features/curriculum/loader";
import { LessonGate } from "@/features/lessons/components/lesson-gate";

export function generateStaticParams() {
  return curriculum.lessons.map((lesson) => ({ lessonId: lesson.id }));
}

export async function generateMetadata({ params }: PageProps<"/lesson/[lessonId]">): Promise<Metadata> {
  const { lessonId } = await params;
  const lesson = findLesson(lessonId);
  return { title: lesson ? `${lesson.titleEn} / ${lesson.titleTh}` : "Lesson" };
}

export default function LessonPage({ params }: PageProps<"/lesson/[lessonId]">) {
  return (
    <Suspense fallback={<p className="p-10 text-center text-ink-soft">…</p>}>
      <LessonForParams params={params} />
    </Suspense>
  );
}

async function LessonForParams({ params }: { params: PageProps<"/lesson/[lessonId]">["params"] }) {
  const { lessonId } = await params;
  if (!findLesson(lessonId)) notFound();
  return <LessonGate lessonId={lessonId} />;
}
