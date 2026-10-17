import type { Metadata } from "next";
import { ProgressScreen } from "@/components/progress/progress-screen";

export const metadata: Metadata = { title: "My journal / สมุดของฉัน" };

export default function ProgressPage() {
  return <ProgressScreen />;
}
