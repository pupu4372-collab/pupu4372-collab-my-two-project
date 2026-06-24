import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export async function AppFooter() {
  const nav = await getTranslations("nav");
  const auth = await getTranslations("auth");

  return (
    <footer className="relative z-10 w-full border-t border-white/10 bg-[#0a1038] py-14">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center justify-between gap-8 px-5 md:flex-row md:px-10">
        <div className="flex flex-col items-center md:items-start">
          <div className="mb-2 text-sm font-bold text-white">K-Saju Pet</div>
          <p className="text-sm text-white/60">© {new Date().getFullYear()} K-Saju Pet</p>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          <Link
            href="/privacy"
            className="text-sm text-white/75 transition-all hover:text-[#ffd7ff] hover:underline"
          >
            {auth("privacy")}
          </Link>
          <Link
            href="/terms"
            className="text-sm text-white/75 transition-all hover:text-[#ffd7ff] hover:underline"
          >
            {auth("terms")}
          </Link>
          <Link
            href="/support"
            className="text-sm text-white/75 transition-all hover:text-[#ffd7ff] hover:underline"
          >
            {nav("support")}
          </Link>
          <Link
            href="/saju"
            className="text-sm text-white/75 transition-all hover:text-[#ffd7ff] hover:underline"
          >
            {nav("saju")}
          </Link>
        </div>
      </div>
      <p className="mx-auto mt-8 max-w-[1200px] px-5 text-center text-xs leading-relaxed text-white/45 md:px-10">
        펫스토롤로지(petstrology) | 대표 이경미 |
        <br className="sm:hidden" />
        <span className="hidden sm:inline"> </span>
        사업자등록번호 536-17-02581 | 대전광역시 동구 동서대로 1688, 8층 806-32호 | 042-300-5388
      </p>
    </footer>
  );
}
