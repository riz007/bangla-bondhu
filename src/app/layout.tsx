import type { Metadata, Viewport } from "next";
import { Anuphan, Mitr, Noto_Naskh_Arabic, Noto_Sans_Bengali } from "next/font/google";
import { AppEffects, SkipLink } from "@/components/app-shell/app-effects";
import "./globals.css";

const anuphan = Anuphan({
  variable: "--font-anuphan",
  subsets: ["thai", "latin"],
  display: "swap",
});

const mitr = Mitr({
  variable: "--font-mitr",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const notoBengali = Noto_Sans_Bengali({
  variable: "--font-noto-bengali",
  subsets: ["bengali"],
  display: "swap",
});

const notoNaskh = Noto_Naskh_Arabic({
  variable: "--font-noto-naskh",
  subsets: ["arabic"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: {
    default: "Bangla Bondhu",
    template: "%s | Bangla Bondhu",
  },
  description:
    "Short Bangladeshi Bengali lessons for Thai children. บทเรียนภาษาเบงกาลีสั้น ๆ สำหรับเด็กไทย ไม่ต้องสมัครสมาชิก",
  applicationName: "Bangla Bondhu",
  appleWebApp: { capable: true, title: "Bangla Bondhu", statusBarStyle: "default" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0e5e58",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="th"
      className={`${anuphan.variable} ${mitr.variable} ${notoBengali.variable} ${notoNaskh.variable} antialiased`}
      data-motion="system"
    >
      <body className="min-h-dvh">
        <SkipLink />
        <AppEffects />
        {children}
      </body>
    </html>
  );
}
