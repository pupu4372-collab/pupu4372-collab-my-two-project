import { COMMUNITY_SOLID_CARD_CLASS } from "@/components/community/CommunityDetailSurface";
import { formatNoticeDate } from "@/lib/notices/queries";
import type { Notice } from "@/lib/supabase/types";
import { Link } from "@/i18n/navigation";

interface CommunityPinnedNoticesProps {
  notices: Notice[];
  isKo: boolean;
}

export function CommunityPinnedNotices({ notices, isKo }: CommunityPinnedNoticesProps) {
  if (notices.length === 0) return null;

  return (
    <section aria-label={isKo ? "고정 공지" : "Pinned notices"}>
      <ul className="space-y-3">
        {notices.map((notice) => (
          <li key={notice.id}>
            <Link
              href={`/support/notices/${notice.id}`}
              className={`block ${COMMUNITY_SOLID_CARD_CLASS} px-4 py-4 transition hover:-translate-y-0.5 hover:bg-white`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-channel-community px-2.5 py-1 text-[11px] font-extrabold text-white">
                  {isKo ? "공지" : "Notice"}
                </span>
                <span className="text-xs font-bold text-plum/55">
                  {formatNoticeDate(notice.published_at, isKo ? "ko" : "en")}
                </span>
              </div>
              <p className="mt-2 text-sm font-extrabold text-primary md:text-base">{notice.title}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
