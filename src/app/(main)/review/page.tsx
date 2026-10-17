import type { Metadata } from "next";
import { ReviewScreen } from "@/components/review/review-screen";

export const metadata: Metadata = { title: "Review / ทบทวน" };

export default function ReviewPage() {
  return <ReviewScreen />;
}
