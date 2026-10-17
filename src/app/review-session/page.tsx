import type { Metadata } from "next";
import { ReviewSessionGate } from "@/components/review/review-session-gate";

export const metadata: Metadata = { title: "Review / ทบทวน" };

export default function ReviewSessionPage() {
  return <ReviewSessionGate />;
}
