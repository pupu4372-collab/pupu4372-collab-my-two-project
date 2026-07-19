import { formatNoticeDate } from "@/lib/notices/queries";
import type { Notice } from "@/lib/supabase/types";
import { Link } from "@/i18n/navigation";

const CARD_TONES = [
  {
    card: "border-[#d9c7e6] bg-[#f3edf8] hover:bg-[#fbf7ff]",
    date: "text-[#5a3a6f]",
    text: "text-primary",
    body: "text-plum",
  },
  {
    card: "border-[#c5c8d6] bg-[#eef0f7] hover:bg-[#f8f9fc]",
    date: "text-[#4c5268]",
    text: "text-primary",
    body: "text-plum",
  },
  {
    card: "border-[#e9bbc9] bg-[#fff0f4] hover:bg-[#fff8fa]",
    date: "text-[#7a4058]",
    text: "text-primary",
    body: "text-plum",
  },
] as const;

interface SupportNoticeListProps {
  notices: Notice[];
  isKo: boolean;
}

export function SupportNoticeList({ notices, isKo }: SupportNoticeListProps) {
  if (notices.length === 0) {
    return (
      <p className="rounded-2xl border border-white/20 bg-white/10 px-5 py-8 text-sm font-semibold text-white/80">
        {isKo ? "등록된 공지가 아직 없어요." : "No notices yet."}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {notices.map((notice, index) => {
        const tone = CARD_TONES[index % CARD_TONES.length];
        return (
          <Link
            key={notice.id}
            href={`/support/notices/${notice.id}`}
            className={`block rounded-2xl border p-5 shadow-[0_12px_28px_rgba(61,42,74,0.14)] transition hover:-translate-y-0.5 ${tone.card}`}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-channel-community px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white">
                {isKo ? "공지" : "Notice"}
              </span>
              <span className={`text-xs font-extrabold ${tone.date}`}>
                {formatNoticeDate(notice.published_at, isKo ? "ko" : "en")}
              </span>
            </div>
            <h3 className={`mt-3 text-base font-extrabold ${tone.text}`}>{notice.title}</h3>
            <p className={`mt-2 line-clamp-2 text-sm font-extrabold ${tone.body}`}>{notice.body}</p>
          </Link>
        );
      })}
    </div>
  );
}
