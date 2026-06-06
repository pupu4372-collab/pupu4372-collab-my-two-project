import { GlassCard } from "@/components/layout/StitchLayout";
import { Link } from "@/i18n/navigation";
import type { CommunityBoardKind } from "@/lib/community/qa-feed";
import Image from "next/image";

export type EmptyStatePreset = "reports" | "pets" | "petShow" | "petDetail" | "qa" | "qaSearch";

interface EmptyStateAction {
  href: string;
  label: string;
}

interface EmptyStateSuggestion {
  icon: string;
  title: string;
  body: string;
  href: string;
}

interface EmptyStatePanelProps {
  title: string;
  description: string;
  imageSrc?: string;
  imageAlt?: string;
  primaryAction: EmptyStateAction;
  suggestions?: EmptyStateSuggestion[];
  className?: string;
  compact?: boolean;
}

export function getBoardEmptyState(
  board: CommunityBoardKind,
  isKo: boolean,
  filters: { q?: string; tag?: string }
): Pick<EmptyStatePanelProps, "title" | "description" | "primaryAction" | "suggestions"> {
  if (filters.q?.trim()) {
    const preset = getEmptyStatePreset("qaSearch", isKo);
    return {
      ...preset,
      primaryAction: {
        href: `/community/${board}`,
        label: preset.primaryAction.label,
      },
    };
  }

  if (filters.tag && filters.tag !== "all") {
    const filterCopy = isKo
      ? {
          title: "이 카테고리에 맞는 글이 없어요",
          description: "다른 태그를 선택하거나 새 글을 작성해 보세요.",
          action: { href: "#board-composer", label: "글 작성하기" },
        }
      : {
          title: "No posts in this category",
          description: "Try another tag or write a new post.",
          action: { href: "#board-composer", label: "Write a post" },
        };
    return {
      title: filterCopy.title,
      description: filterCopy.description,
      primaryAction: filterCopy.action,
      suggestions: undefined,
    };
  }

  const boardActions: Record<CommunityBoardKind, { href: string; ko: string; en: string }> = {
    qa: { href: "#board-composer", ko: "첫 질문 남기기", en: "Ask the first question" },
    experience: { href: "#board-composer", ko: "경험담 작성하기", en: "Share your experience" },
    tips: { href: "#board-composer", ko: "팁 글 작성하기", en: "Write a tip" },
    free: { href: "#board-composer", ko: "글 작성하기", en: "Write a post" },
  };

  const preset = getEmptyStatePreset("qa", isKo);
  const action = boardActions[board];
  return {
    ...preset,
    primaryAction: { href: action.href, label: isKo ? action.ko : action.en },
  };
}

export function getEmptyStatePreset(
  preset: EmptyStatePreset,
  isKo: boolean
): Pick<EmptyStatePanelProps, "title" | "description" | "primaryAction" | "suggestions"> {
  const copy = {
    reports: {
      ko: {
        title: "아직 저장된 리포트가 없어요",
        description: "반려동물의 사주를 분석하거나 커뮤니티 활동을 시작해 보세요.",
        action: { href: "/saju", label: "사주 분석 시작하기" },
        suggestions: [
          {
            icon: "✨",
            title: "사주 가이드 보기",
            body: "우리 아이의 타고난 성향과 오행 밸런스를 미리 확인해 보세요.",
            href: "/saju",
          },
          {
            icon: "🐾",
            title: "인기 펫 구경하기",
            body: "오늘 가장 사랑받는 반려동물들의 프로필을 만나보세요.",
            href: "/community/pet-show",
          },
        ],
      },
      en: {
        title: "No saved reports yet",
        description: "Start with a pet saju reading or explore the community to fill your vault.",
        action: { href: "/saju", label: "Start saju reading" },
        suggestions: [
          {
            icon: "✨",
            title: "Explore saju guide",
            body: "Preview your pet's elemental vibe and personality story.",
            href: "/saju",
          },
          {
            icon: "🐾",
            title: "Browse Pet Show",
            body: "Meet the most loved pet profiles in the community.",
            href: "/community/pet-show",
          },
        ],
      },
    },
    pets: {
      ko: {
        title: "아직 등록된 펫이 없어요",
        description: "홈에서 사주를 보면 반려동물 프로필이 자동으로 저장됩니다.",
        action: { href: "/saju", label: "사주 분석 시작하기" },
        suggestions: [
          {
            icon: "✨",
            title: "사주 분석하기",
            body: "이름과 생년월일만 입력하면 프로필이 함께 만들어져요.",
            href: "/saju",
          },
          {
            icon: "🏠",
            title: "홈으로 가기",
            body: "랭킹, 운세, 채널 콘텐츠를 먼저 둘러보세요.",
            href: "/",
          },
        ],
      },
      en: {
        title: "No pet profiles yet",
        description: "Run a saju reading from Home and your pet profile will be saved automatically.",
        action: { href: "/saju", label: "Start saju reading" },
        suggestions: [
          {
            icon: "✨",
            title: "Read saju",
            body: "Enter birth info once and keep the profile for future readings.",
            href: "/saju",
          },
          {
            icon: "🏠",
            title: "Go to Home",
            body: "Browse rankings, fortune, and channel content first.",
            href: "/",
          },
        ],
      },
    },
    petShow: {
      ko: {
        title: "아직 올린 사진이 없어요",
        description: "우리아이 자랑에 첫 사진을 올리고 주간 랭킹에 도전해 보세요.",
        action: { href: "/community/pet-show/upload", label: "사진 올리기" },
        suggestions: [
          {
            icon: "📸",
            title: "업로드 가이드",
            body: "Pet Show에 사진을 올리는 방법을 확인해 보세요.",
            href: "/community/pet-show",
          },
          {
            icon: "🏆",
            title: "랭킹 보기",
            body: "이번 주 인기 반려동물 순위를 먼저 확인해 보세요.",
            href: "/community/pet-show/ranking",
          },
        ],
      },
      en: {
        title: "No Pet Show photos yet",
        description: "Upload your first photo and join the weekly ranking.",
        action: { href: "/community/pet-show/upload", label: "Upload a photo" },
        suggestions: [
          {
            icon: "📸",
            title: "Pet Show hub",
            body: "See how uploads and reactions work in the community.",
            href: "/community/pet-show",
          },
          {
            icon: "🏆",
            title: "View rankings",
            body: "Check this week's most loved pet photos.",
            href: "/community/pet-show/ranking",
          },
        ],
      },
    },
    petDetail: {
      ko: {
        title: "펫을 찾을 수 없어요",
        description: "삭제되었거나 접근 권한이 없는 프로필일 수 있어요.",
        action: { href: "/profile", label: "프로필로 돌아가기" },
        suggestions: undefined,
      },
      en: {
        title: "Pet not found",
        description: "This profile may have been removed or you may not have access.",
        action: { href: "/profile", label: "Back to profile" },
        suggestions: undefined,
      },
    },
    qa: {
      ko: {
        title: "아직 게시글이 없어요",
        description: "왼쪽 작성 폼에서 첫 글을 남기거나, 다른 커뮤니티 게시판을 둘러보세요.",
        action: { href: "#board-composer", label: "글 작성하기" },
        suggestions: [
          {
            icon: "🔮",
            title: "사주 분석하기",
            body: "반려동물 사주를 보면 Q&A에 올릴 질문이 더 선명해져요.",
            href: "/saju",
          },
          {
            icon: "📸",
            title: "우리아이 자랑",
            body: "Pet Show에 사진을 올리고 집사님들의 응원을 받아보세요.",
            href: "/community/pet-show",
          },
        ],
      },
      en: {
        title: "No posts yet",
        description: "Write the first post on the left, or explore other community boards.",
        action: { href: "#board-composer", label: "Write a post" },
        suggestions: [
          {
            icon: "🔮",
            title: "Try a saju reading",
            body: "A basic reading can inspire your first community question.",
            href: "/saju",
          },
          {
            icon: "📸",
            title: "Browse Pet Show",
            body: "Share photos and meet other pet parents.",
            href: "/community/pet-show",
          },
        ],
      },
    },
    qaSearch: {
      ko: {
        title: "검색 결과가 없어요",
        description: "다른 키워드로 검색하거나 태그 필터를 바꿔 보세요.",
        action: { href: "/community/qa", label: "전체 글 보기" },
        suggestions: undefined,
      },
      en: {
        title: "No search results",
        description: "Try another keyword or change the tag filter.",
        action: { href: "/community/qa", label: "View all posts" },
        suggestions: undefined,
      },
    },
  } as const;

  const selected = copy[preset][isKo ? "ko" : "en"];
  return {
    title: selected.title,
    description: selected.description,
    primaryAction: { ...selected.action },
    suggestions: selected.suggestions ? [...selected.suggestions] : undefined,
  };
}

export function EmptyStatePanel({
  title,
  description,
  imageSrc = "/stitch/asset-69.jpg",
  imageAlt = "K-Saju Pet",
  primaryAction,
  suggestions,
  className = "",
  compact = false,
}: EmptyStatePanelProps) {
  return (
    <section
      className={`relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-cream via-surface-container-low to-secondary-container/20 text-center ${
        compact ? "px-5 py-8" : "px-6 py-10 md:px-10"
      } ${className}`}
    >
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-lavender/30 blur-3xl"
        aria-hidden
      />
      <div className="relative z-10 mx-auto flex max-w-xl flex-col items-center">
        {!compact && (
          <div className="relative mb-8 aspect-square w-full max-w-[280px] animate-float">
            <div className="absolute inset-0 scale-110 rounded-full bg-primary/5 blur-3xl" aria-hidden />
            <Image
              src={imageSrc}
              alt={imageAlt}
              width={400}
              height={400}
              unoptimized
              className="relative z-10 h-full w-full object-contain drop-shadow-2xl"
              priority
            />
          </div>
        )}

        <h2 className={`font-extrabold tracking-tight text-primary ${compact ? "text-xl" : "text-2xl md:text-3xl"}`}>
          {title}
        </h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-plum/75 md:text-base">{description}</p>

        <Link
          href={primaryAction.href}
          className="mt-8 inline-flex rounded-full bg-primary px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:brightness-105"
        >
          {primaryAction.label}
        </Link>

        {suggestions && suggestions.length > 0 && (
          <div className="mt-10 grid w-full gap-4 md:grid-cols-2">
            {suggestions.map((item) => (
              <Link key={item.href} href={item.href} className="text-left">
                <GlassCard className="h-full p-5 transition hover:-translate-y-0.5 hover:bg-white/80">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-secondary-container text-lg">
                    <span aria-hidden>{item.icon}</span>
                  </div>
                  <h3 className="text-base font-bold text-primary">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-plum/65">{item.body}</p>
                </GlassCard>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
