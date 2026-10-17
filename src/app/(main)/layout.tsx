import Link from "next/link";
import { DoelMascot } from "@/components/app-shell/doel-mascot";
import { LanguageToggle } from "@/components/navigation/language-toggle";
import { MainNav } from "@/components/navigation/main-nav";

export default function MainLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 pt-4 md:px-6">
        <Link href="/" className="flex min-h-11 items-center gap-2 rounded-md pr-2">
          <DoelMascot size={44} />
          <span className="flex flex-col leading-none">
            <span lang="bn-BD" className="font-bengali text-xl font-semibold text-teal">
              বাংলা বন্ধু
            </span>
            <span className="text-sm text-ink-soft">Bangla Bondhu</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <MainNav />
          </div>
          <LanguageToggle />
        </div>
      </header>
      <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 pb-28 pt-6 md:px-6 md:pb-16">
        {children}
      </main>
      <div className="md:hidden">
        <MainNav />
      </div>
    </div>
  );
}
