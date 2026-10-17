import type { Lesson, PlannedTopic } from "@/features/curriculum/schema";

// No Islamic lessons ship until a qualified reviewer has checked the sources and
// wording. Lessons added here need sourceNote, reviewerNote and reviewedAt.
export const islamLessons: Lesson[] = [];

export const islamPlannedTopics: PlannedTopic[] = [
  {
    id: "islam.topic.vocabulary",
    titleTh: "คำศัพท์พื้นฐานเกี่ยวกับอิสลาม",
    titleEn: "Basic Islamic vocabulary",
    status: "awaiting-review",
  },
  {
    id: "islam.topic.pillars",
    titleTh: "หลักการอิสลาม 5 ประการ",
    titleEn: "The five pillars of Islam",
    status: "awaiting-review",
  },
  {
    id: "islam.topic.manners",
    titleTh: "มารยาท ความเมตตา ความซื่อสัตย์ และการขอบคุณ",
    titleEn: "Manners, kindness, honesty and gratitude",
    status: "awaiting-review",
  },
  {
    id: "islam.topic.sources",
    titleTh: "อัลกุรอาน หะดีษ และคำอธิบาย ต่างกันอย่างไร",
    titleEn: "How the Qur'an, hadith and explanations differ",
    status: "awaiting-review",
  },
];
