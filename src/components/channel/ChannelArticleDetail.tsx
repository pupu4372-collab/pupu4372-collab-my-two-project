import type { ChannelArticle, PetChannel } from "@/lib/channel/content";
import { CHANNEL_CONTENT } from "@/lib/channel/content";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";

const THEME = {
  dog: {
    accent: "text-channel-dog",
    button: "bg-channel-dog text-white",
    back: "/dog",
  },
  cat: {
    accent: "text-channel-cat",
    button: "bg-channel-cat text-white",
    back: "/cat",
  },
} as const;

interface ChannelArticleDetailProps {
  channel: PetChannel;
  article: ChannelArticle;
  source?: "supabase" | "static";
}

export function ChannelArticleDetail({ channel, article, source }: ChannelArticleDetailProps) {
  const locale = useLocale();
  const isKo = locale === "ko";
  const theme = THEME[channel];
  const label = CHANNEL_CONTENT[channel].label;

  return (
    <article className="space-y-6">
      <Link href={theme.back} className={`text-sm font-semibold underline ${theme.accent}`}>
        ← {isKo ? `${label} 채널로` : `Back to ${channel} channel`}
      </Link>

      <div>
        <p className={`text-xs font-bold ${theme.accent}`}>
          {article.categoryEmoji ? `${article.categoryEmoji} ` : ""}
          {article.category} · {article.readTime}
        </p>
        <h2 className="mt-2 text-2xl font-bold text-plum">{article.title}</h2>
        <p className="mt-3 text-sm leading-relaxed text-plum/70">{article.summary}</p>
        {source && (
          <p className="mt-2 text-xs text-plum/45">
            {source === "supabase"
              ? isKo
                ? "DB 콘텐츠"
                : "DB content"
              : isKo
                ? "기본 가이드"
                : "Default guide"}
          </p>
        )}
      </div>

      {article.body && (
        <div className="whitespace-pre-wrap rounded-[1.5rem] bg-white/60 px-5 py-5 text-sm leading-relaxed text-plum/75">
          {article.body}
        </div>
      )}

      {article.checklist.length > 0 && (
        <section className="rounded-[1.5rem] bg-white/55 p-5">
          <h3 className="font-bold text-plum">{isKo ? "실천 체크리스트" : "Action checklist"}</h3>
          <ul className="mt-3 space-y-2 text-sm text-plum/70">
            {article.checklist.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-mint">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Link
        href="/saju"
        className={`inline-flex rounded-full px-6 py-3 text-sm font-bold ${theme.button}`}
      >
        {CHANNEL_CONTENT[channel].sajuCta}
      </Link>
    </article>
  );
}
