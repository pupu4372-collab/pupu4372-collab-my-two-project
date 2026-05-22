import { LoginButtons } from "@/components/auth/LoginButtons";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { locale } = await params;
  const queryParams = await searchParams;
  const error = queryParams.error;
  const t = await getTranslations("auth");
  const homeHref = `/${locale}`;

  return (
    <div className="min-h-screen bg-dream-sky px-4 py-10">
      <div className="mx-auto mb-8 max-w-sm text-center">
        <a href={homeHref} className="inline-flex items-center gap-2 text-lg font-bold text-plum">
          <span aria-hidden>☀️</span>
          K-Saju Pet
        </a>
      </div>

      {error && (
        <p
          className="mx-auto mb-4 max-w-sm rounded-2xl bg-petal/50 px-4 py-2 text-center text-sm text-plum"
          role="alert"
        >
          {decodeURIComponent(error)}
        </p>
      )}

      <LoginButtons />

      <div className="mx-auto mt-4 max-w-sm text-center">
        <a
          href={homeHref}
          className="inline-flex rounded-full border border-plum/15 bg-white/70 px-5 py-2.5 text-sm font-semibold text-plum shadow-sm transition hover:bg-white"
        >
          {t("backHome")}
        </a>
      </div>

      <p className="mx-auto mt-8 max-w-sm text-center text-xs text-plum/45">
        <Link href="/terms" className="underline hover:text-plum">
          {t("terms")}
        </Link>
        {" · "}
        <Link href="/privacy" className="underline hover:text-plum">
          {t("privacy")}
        </Link>
      </p>
    </div>
  );
}
