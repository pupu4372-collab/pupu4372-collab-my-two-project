import { LoginButtons } from "@/components/auth/LoginButtons";
import { getSafeInternalReturnPath } from "@/lib/auth/safe-internal-return-path";
import { getTranslations } from "next-intl/server";

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { locale } = await params;
  const queryParams = await searchParams;
  const error = queryParams.error;
  const returnTo = getSafeInternalReturnPath(queryParams.next);
  const t = await getTranslations("auth");
  const homeHref = `/${locale}`;

  return (
    <div className="auth-dream-sky night-sky-page flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {error && (
          <p
            className="mb-4 rounded-2xl bg-petal/50 px-4 py-2 text-center text-sm text-plum"
            role="alert"
          >
            {decodeURIComponent(error)}
          </p>
        )}

        <LoginButtons homeHref={homeHref} returnTo={returnTo !== "/" ? returnTo : undefined} />

        <div className="mt-6 text-center">
          <a
            href={homeHref}
            className="inline-flex rounded-full border border-plum/15 bg-white/70 px-5 py-2.5 text-sm font-semibold text-plum shadow-sm transition hover:bg-white"
          >
            {t("backHome")}
          </a>
        </div>
      </div>
    </div>
  );
}
