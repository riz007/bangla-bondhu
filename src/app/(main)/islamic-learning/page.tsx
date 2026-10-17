import type { Metadata } from "next";
import { IslamicLearningScreen } from "@/components/islamic/islamic-learning-screen";

export const metadata: Metadata = { title: "Islamic basics / ความรู้อิสลามเบื้องต้น" };

export default function IslamicLearningPage() {
  return <IslamicLearningScreen />;
}
