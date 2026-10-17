import type { Metadata } from "next";
import { MessagePage } from "@/components/app-shell/message-page";

export const metadata: Metadata = { title: "Offline" };

export default function OfflinePage() {
  return <MessagePage page="offline" />;
}
