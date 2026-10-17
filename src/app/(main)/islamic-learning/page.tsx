import type { Metadata } from "next";
import { IslamicLearningScreen } from "@/components/islamic/islamic-learning-screen";

export const metadata: Metadata = { title: "Arabic and Islamic basics / อักษรอาหรับ และความรู้อิสลาม" };

export default function IslamicLearningPage() {
  return <IslamicLearningScreen />;
}
