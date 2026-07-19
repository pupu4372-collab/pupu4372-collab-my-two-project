import { AppTopNav } from "@/components/layout/AppTopNav";
import { Link } from "@/i18n/navigation";
import { fetchPublishedNoticeById, formatNoticeDate } from "@/lib/notices/queries";
import { notFound } from "next/navigation";

interface NoticeDetailPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function SupportNoticeDetailPage({ params }: NoticeDetailPageProps) {
  const { locale, id } = await params;
  const isKo = locale !== "en";
  const notice = await fetchPublishedNoticeById(id, locale);

  if (!notice) notFound();

  return (
    <div className="min-h-screen text-white">
      <AppTopNav active="support" />
      <main className="mx-auto max-w-3xl px-6 py-16 md:px-10">
        <Link
          href="/support"
          className="inline-flex text-sm font-extrabold text-white/75 transition hover:text-white"
        >
          {isKo ? "← 고객센터" : "← Support"}
        </Link>

        <article className="mt-8 rounded-[2rem] border border-[#d9c7e6] bg-[#f3edf8] p-6 text-primary shadow-[0_12px_28px_rgba(61,42,74,0.14)] md:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-channel-community px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white">
              {isKo ? "공지" : "Notice"}
            </span>
            <span className="text-xs font-extrabold text-[#5a3a6f]">
              {formatNoticeDate(notice.published_at, isKo ? "ko" : "en")}
            </span>
          </div>
          <h1 className="mt-4 text-2xl font-extrabold md:text-3xl">{notice.title}</h1>
          <div className="mt-6 whitespace-pre-wrap text-sm font-semibold leading-7 text-plum md:text-base">
            {notice.body}
          </div>
        </article>
      </main>
    </div>
  );
}
