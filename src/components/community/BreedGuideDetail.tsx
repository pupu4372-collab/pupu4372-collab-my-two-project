import type { BreedGuide } from "@/lib/supabase/types";
import { getAnimalLabel } from "@/lib/community/board-categories";
import { Link } from "@/i18n/navigation";

interface BreedGuideDetailProps {
  guide: BreedGuide;
  source: "supabase" | "mock";
  isKo: boolean;
  backHref?: "/community/breeds" | "/dog" | "/cat" | "/reptile";
  backLabel?: string;
}

export function BreedGuideDetail({ guide, source, isKo, backHref = "/community/breeds", backLabel }: BreedGuideDetailProps) {
  const title = isKo ? guide.breed_name : guide.breed_name_en ?? guide.breed_name;

  return (
    <article className="space-y-8">
      <Link
        href={backHref}
        className="text-sm font-semibold text-[#ffd7ff] underline"
      >
        {backLabel ?? (isKo ? "← 품종 가이드 목록" : "← All breed guides")}
      </Link>

      <header className="space-y-4 rounded-[2rem] border border-white/15 bg-cream p-6 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-channel-community/10 px-3 py-1 text-xs font-extrabold text-channel-community">
            {getAnimalLabel(guide.animal_type, isKo)}
          </span>
          {guide.size_category && (
            <span className="rounded-full bg-sand/70 px-3 py-1 text-xs font-bold text-plum/65">
              {guide.size_category}
            </span>
          )}
          {guide.beginner_friendly ? (
            <span className="rounded-full bg-mint/40 px-3 py-1 text-xs font-bold text-plum/75">
              {isKo ? "초보 집사 추천" : "Good for beginners"}
            </span>
          ) : (
            <span className="rounded-full bg-gold/35 px-3 py-1 text-xs font-bold text-plum/75">
              {isKo ? "경험 집사 권장" : "Experienced owners"}
            </span>
          )}
        </div>
        <h1 className="text-3xl font-extrabold text-primary">{title}</h1>
        {guide.summary && <p className="text-base leading-relaxed text-plum/75">{guide.summary}</p>}
        {source === "mock" && (
          <p className="text-xs text-plum/60">{isKo ? "데모 콘텐츠" : "Demo content"}</p>
        )}
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        {guide.lifespan && (
          <div className="rounded-[1.5rem] border border-white/20 bg-cream p-4 shadow-sm">
            <p className="text-xs font-extrabold text-channel-community">{isKo ? "평균 수명" : "Lifespan"}</p>
            <p className="mt-1 text-sm font-semibold text-plum/80">{guide.lifespan}</p>
          </div>
        )}
        {guide.exercise_level && (
          <div className="rounded-[1.5rem] border border-white/20 bg-cream p-4 shadow-sm">
            <p className="text-xs font-extrabold text-channel-community">{isKo ? "운동량" : "Exercise"}</p>
            <p className="mt-1 text-sm font-semibold text-plum/80">{guide.exercise_level}</p>
          </div>
        )}
        {guide.grooming_level && (
          <div className="rounded-[1.5rem] border border-white/20 bg-cream p-4 shadow-sm">
            <p className="text-xs font-extrabold text-channel-community">{isKo ? "그루밍" : "Grooming"}</p>
            <p className="mt-1 text-sm font-semibold text-plum/80">{guide.grooming_level}</p>
          </div>
        )}
        {guide.saju_tendency && (
          <div className="rounded-[1.5rem] border border-white/20 bg-cream p-4 shadow-sm sm:col-span-2">
            <p className="text-xs font-extrabold text-channel-community">{isKo ? "사주·성향 힌트" : "Saju tendency"}</p>
            <p className="mt-1 text-sm font-semibold text-plum/80">{guide.saju_tendency}</p>
          </div>
        )}
      </section>

      {guide.personality && (
        <section className="rounded-[1.5rem] border border-white/20 bg-cream p-5 shadow-sm">
          <h2 className="font-bold text-plum">{isKo ? "성격" : "Personality"}</h2>
          <p className="mt-2 text-sm leading-relaxed text-plum/75">{guide.personality}</p>
        </section>
      )}

      {guide.health_notes && (
        <section className="rounded-[1.5rem] border border-white/20 bg-cream p-5 shadow-sm">
          <h2 className="font-bold text-plum">{isKo ? "건강·주의" : "Health notes"}</h2>
          <p className="mt-2 text-sm leading-relaxed text-plum/75">{guide.health_notes}</p>
        </section>
      )}

      {guide.body && (
        <section className="whitespace-pre-wrap rounded-[1.5rem] border border-white/20 bg-cream px-5 py-5 text-sm leading-relaxed text-plum/80 shadow-sm">
          {guide.body}
        </section>
      )}

      {guide.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {guide.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-channel-community/10 px-3 py-1 text-xs font-semibold text-channel-community"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Link
          href="/saju"
          className="rounded-full bg-channel-community px-6 py-3 text-sm font-bold text-white shadow-md"
        >
          {isKo ? "우리 아이 사주 보기" : "Pet Saju reading"}
        </Link>
        <Link
          href={guide.animal_type === "cat" ? "/cat" : guide.animal_type === "dog" ? "/dog" : "/reptile"}
          className="rounded-full border border-channel-community/30 bg-cream px-6 py-3 text-sm font-bold text-channel-community shadow-sm transition hover:bg-white"
        >
          {isKo ? "채널 홈으로" : "Channel home"}
        </Link>
      </div>
    </article>
  );
}
