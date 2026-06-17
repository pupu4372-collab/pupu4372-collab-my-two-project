import { COMMUNITY_CHIP_IDLE_CLASS, COMMUNITY_SOLID_CARD_CLASS } from "@/components/community/CommunityDetailSurface";
import type { BreedGuide, PetAnimalType } from "@/lib/supabase/types";
import { getAnimalLabel } from "@/lib/community/board-categories";
import { Link } from "@/i18n/navigation";

const ANIMAL_TABS: Array<{ id: PetAnimalType | "all"; ko: string; en: string }> = [
  { id: "all", ko: "전체", en: "All" },
  { id: "dog", ko: "강아지", en: "Dogs" },
  { id: "cat", ko: "고양이", en: "Cats" },
  { id: "other", ko: "렙타일(다른동물)", en: "Other" },
];

interface BreedGuideHubProps {
  guides: BreedGuide[];
  source: "supabase" | "mock";
  activeAnimal: PetAnimalType | "all";
  isKo: boolean;
}

export function BreedGuideHub({ guides, source, activeAnimal, isKo }: BreedGuideHubProps) {
  return (
    <div className="space-y-5">
      <nav className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar" aria-label={isKo ? "동물 종류" : "Animal type"}>
        {ANIMAL_TABS.map((tab) => {
          const href =
            tab.id === "all" ? "/community/breeds" : `/community/breeds?animal=${tab.id}`;
          const active = activeAnimal === tab.id;
          return (
            <Link
              key={tab.id}
              href={href}
              className={
                active
                  ? "whitespace-nowrap rounded-full bg-channel-community px-5 py-2.5 text-xs font-extrabold text-white shadow-sm"
                  : COMMUNITY_CHIP_IDLE_CLASS
              }
            >
              {isKo ? tab.ko : tab.en}
            </Link>
          );
        })}
      </nav>

      {source === "mock" && (
        <p className="text-xs text-white/70">
          {isKo ? "데모 품종 가이드 (DB 마이그레이션 후 Supabase 데이터)" : "Demo breed guides (Supabase after migration)"}
        </p>
      )}

      {guides.length === 0 ? (
        <div className={`${COMMUNITY_SOLID_SURFACE_CLASS} p-8 text-center text-sm text-plum/75`}>
          {isKo ? "아직 등록된 가이드가 없어요." : "No guides published yet."}
        </div>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {guides.map((guide) => (
            <li key={guide.id}>
              <Link
                href={`/community/breeds/${guide.seo_slug}`}
                className={`flex h-full flex-col ${COMMUNITY_SOLID_CARD_CLASS} p-4 transition hover:-translate-y-1 hover:bg-white`}
              >
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="rounded-full bg-channel-community/10 px-2.5 py-0.5 text-[10px] font-extrabold text-channel-community">
                    {getAnimalLabel(guide.animal_type, isKo)}
                  </span>
                  {guide.size_category && (
                    <span className="text-[10px] font-bold uppercase text-plum/45">{guide.size_category}</span>
                  )}
                  {guide.beginner_friendly && (
                    <span className="rounded-full bg-mint/40 px-2.5 py-0.5 text-[10px] font-bold text-plum/70">
                      {isKo ? "초보 추천" : "Beginner friendly"}
                    </span>
                  )}
                </div>
                <h2 className="mt-2 text-base font-extrabold text-primary">
                  {isKo ? guide.breed_name : guide.breed_name_en ?? guide.breed_name}
                </h2>
                {guide.summary && (
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-plum/70">{guide.summary}</p>
                )}
                {guide.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {guide.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-channel-community/10 px-2 py-0.5 text-[10px] font-bold text-channel-community"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-plum/55">
                  {guide.lifespan && <span>{isKo ? "수명" : "Lifespan"}: {guide.lifespan}</span>}
                  {guide.exercise_level && (
                    <span>
                      {isKo ? "운동량" : "Exercise"}: {guide.exercise_level}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs font-extrabold text-channel-community">
                  {isKo ? "가이드 보기" : "View guide"} →
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
