export type PetChannel = "dog" | "cat";

export interface ChannelInfoCard {
  title: string;
  summary: string;
  points: string[];
}

export interface ChannelArticle {
  id: string;
  category: string;
  categorySlug?: string;
  categoryEmoji?: string;
  title: string;
  summary: string;
  readTime: string;
  badge?: string;
  checklist: string[];
  body?: string;
}

export interface ChannelRoutine {
  title: string;
  items: string[];
}

export interface ChannelContent {
  channel: PetChannel;
  label: string;
  emoji: string;
  headline: string;
  intro: string;
  heroPoints: string[];
  featured: ChannelArticle;
  articles: ChannelArticle[];
  routines: ChannelRoutine[];
  keywords: string[];
  sajuCta: string;
}

export const CHANNEL_CONTENT: Record<PetChannel, ChannelContent> = {
  dog: {
    channel: "dog",
    label: "강아지",
    emoji: "🐕",
    headline: "오늘도 꼬리 흔드는 댕댕 생활 백과",
    intro:
      "견종별 성향, 산책 루틴, 훈련, 식단까지. 초보 집사도 바로 따라할 수 있게 짧고 실전적으로 정리했어요.",
    heroPoints: ["산책·놀이 루틴", "훈련 체크리스트", "건강·식단 가이드"],
    featured: {
      id: "dog-walk-rhythm",
      category: "산책",
      title: "산책은 몇 분이 좋을까? 나이별 에너지 리듬",
      summary:
        "강아지 산책은 시간보다 리듬이 중요해요. 어린 강아지, 성견, 노견별로 무리 없는 산책 강도와 쉬는 신호를 정리했습니다.",
      readTime: "3분",
      badge: "오늘 추천",
      checklist: ["헥헥거림이 길어지면 즉시 쉬기", "산책 후 발바닥·귀 상태 확인", "새로운 냄새 맡기 시간을 5분 이상 주기"],
    },
    articles: [
      {
        id: "dog-basic-training",
        category: "훈련",
        title: "앉아·기다려보다 먼저 필요한 이름 반응 훈련",
        summary:
          "이름을 불렀을 때 눈을 맞추는 습관은 모든 훈련의 시작입니다. 간식 없이도 반응을 키우는 순서를 소개해요.",
        readTime: "4분",
        checklist: ["짧게 부르고 바로 칭찬", "혼날 때 이름 부르지 않기", "성공률 80% 이상이면 장소 바꾸기"],
      },
      {
        id: "dog-food-sensitive",
        category: "식단",
        title: "간식은 사랑이지만, 위장은 현실입니다",
        summary:
          "알레르기와 소화 민감도가 있는 아이를 위해 단백질, 지방, 급여량을 확인하는 법을 쉽게 정리했어요.",
        readTime: "5분",
        checklist: ["새 간식은 3일 간격으로 테스트", "눈물·귀 냄새 변화 기록", "하루 간식은 총 열량의 10% 안쪽"],
      },
      {
        id: "dog-breed-temper",
        category: "견종",
        title: "견종 성향은 설명서, 우리 아이는 한정판",
        summary:
          "견종 정보는 출발점일 뿐이에요. 에너지, 경계심, 애착 표현을 관찰해 우리 아이만의 프로필을 만드는 법.",
        readTime: "3분",
        checklist: ["낯선 소리 반응 기록", "혼자 쉬는 시간 보장", "좋아하는 보상 3가지 찾기"],
      },
    ],
    routines: [
      {
        title: "아침 10분 루틴",
        items: ["물그릇 교체", "배변 상태 확인", "짧은 냄새 산책 또는 노즈워크"],
      },
      {
        title: "밤 케어 루틴",
        items: ["발 닦으며 패드 확인", "귀·눈 주변 체크", "잠자리에서 과흥분 놀이 피하기"],
      },
    ],
    keywords: ["산책", "분리불안", "노즈워크", "견종", "간식", "기초훈련"],
    sajuCta: "우리 강아지 사주 보기",
  },
  cat: {
    channel: "cat",
    label: "고양이",
    emoji: "🐈",
    headline: "조용하지만 우주를 지배하는 냥님 생활 가이드",
    intro:
      "행동 심리, 화장실, 사냥 놀이, 식단을 고양이답게 풀어냅니다. 억지보다 환경 설계가 핵심이에요.",
    heroPoints: ["행동·심리 해석", "화장실·환경 관리", "사냥 놀이·식단"],
    featured: {
      id: "cat-play-hunt",
      category: "행동",
      title: "밤마다 우다다? 사냥 에너지를 낮에 풀어주세요",
      summary:
        "고양이의 우다다는 문제 행동이라기보다 남은 사냥 에너지일 수 있어요. 놀이 순서와 마무리 급여 루틴을 안내합니다.",
      readTime: "4분",
      badge: "오늘 추천",
      checklist: ["낚싯대 놀이는 숨기기-추격-성공 순서", "놀이 후 소량 급여로 사냥 완성", "레이저만 오래 쓰지 않기"],
    },
    articles: [
      {
        id: "cat-litter-box",
        category: "화장실",
        title: "화장실 밖 실수, 혼내기 전에 체크할 것",
        summary:
          "모래, 위치, 청결, 건강 신호를 순서대로 확인하세요. 고양이는 말 대신 화장실로 민원을 넣습니다.",
        readTime: "5분",
        checklist: ["고양이 수 + 1개 화장실", "강한 향 모래 피하기", "갑작스러운 실수는 병원 상담"],
      },
      {
        id: "cat-touch-boundary",
        category: "심리",
        title: "만져도 되는 시간과 그만하라는 꼬리 신호",
        summary:
          "골골송이 항상 무한 허락은 아니에요. 귀, 꼬리, 등 근육 신호로 냥님의 허락 범위를 읽어봅니다.",
        readTime: "3분",
        checklist: ["꼬리 끝 탁탁이면 중단", "배 만지기는 신뢰와 별개", "먼저 다가오게 기다리기"],
      },
      {
        id: "cat-water-food",
        category: "식단",
        title: "물을 잘 안 마시는 냥님을 위한 급수 작전",
        summary:
          "물그릇 위치, 재질, 습식 비율만 바꿔도 음수량이 달라질 수 있어요. 작은 실험부터 시작하세요.",
        readTime: "4분",
        checklist: ["밥그릇과 물그릇 분리", "넓은 그릇 또는 정수기 테스트", "소변 덩어리 크기 관찰"],
      },
    ],
    routines: [
      {
        title: "아침 7분 루틴",
        items: ["물그릇 새로 채우기", "화장실 덩어리 확인", "창가·숨숨집 상태 체크"],
      },
      {
        title: "밤 사냥 루틴",
        items: ["낚싯대 10분", "잡는 성공감 주기", "소량 급여 후 조명 낮추기"],
      },
    ],
    keywords: ["우다다", "화장실", "사냥놀이", "골골송", "음수량", "숨숨집"],
    sajuCta: "우리 고양이 사주 보기",
  },
};

export const CHANNEL_CONTENT_EN: Record<PetChannel, ChannelContent> = {
  dog: {
    channel: "dog",
    label: "Dog",
    emoji: "🐕",
    headline: "A practical guide for happy dog days",
    intro:
      "Breed tendencies, walk rhythm, training, and food care, written in short steps that new pet parents can use right away.",
    heroPoints: ["Walk and play routines", "Training checklist", "Health and food guide"],
    featured: {
      id: "dog-walk-rhythm",
      category: "Walks",
      title: "How long should walks be? Energy rhythm by age",
      summary:
        "Dog walks are more about rhythm than minutes. Here is how to adjust intensity and rest signals for puppies, adult dogs, and senior dogs.",
      readTime: "3 min",
      badge: "Today's pick",
      checklist: ["Rest when panting lasts too long", "Check paws and ears after walks", "Give at least 5 minutes for new scents"],
    },
    articles: [
      {
        id: "dog-basic-training",
        category: "Training",
        title: "Name response comes before sit and stay",
        summary:
          "Making eye contact when called is the beginning of every training habit. Learn the order for building response without relying only on treats.",
        readTime: "4 min",
        checklist: ["Call briefly and praise immediately", "Do not use the name when scolding", "Change locations after 80% success"],
      },
      {
        id: "dog-food-sensitive",
        category: "Food",
        title: "Treats are love, but digestion is real",
        summary:
          "For pets with allergies or sensitive digestion, check protein, fat, and serving size in a simple, practical way.",
        readTime: "5 min",
        checklist: ["Test new treats 3 days apart", "Track tear stains and ear smell changes", "Keep treats under 10% of daily calories"],
      },
      {
        id: "dog-breed-temper",
        category: "Breed",
        title: "Breed traits are a manual; your pet is limited edition",
        summary:
          "Breed information is only a starting point. Observe energy, alertness, and affection to build your own pet profile.",
        readTime: "3 min",
        checklist: ["Record reactions to unfamiliar sounds", "Protect alone-time breaks", "Find three favorite rewards"],
      },
    ],
    routines: [
      { title: "10-minute morning routine", items: ["Refresh the water bowl", "Check potty condition", "Short scent walk or nose work"] },
      { title: "Night care routine", items: ["Wipe paws and check pads", "Check ears and eyes", "Avoid overexciting play near bedtime"] },
    ],
    keywords: ["walks", "separation anxiety", "nose work", "breed", "treats", "basic training"],
    sajuCta: "Read my dog's saju",
  },
  cat: {
    channel: "cat",
    label: "Cat",
    emoji: "🐈",
    headline: "A quiet cat-care guide for tiny rulers of the universe",
    intro:
      "Behavior, litter, hunting play, and diet explained in a cat-first way. The key is environment design, not forcing.",
    heroPoints: ["Behavior and psychology", "Litter and environment", "Hunting play and diet"],
    featured: {
      id: "cat-play-hunt",
      category: "Behavior",
      title: "Night zoomies? Release hunting energy during the day",
      summary:
        "Cat zoomies are often leftover hunting energy, not just a problem behavior. Try a play order that ends with a small meal.",
      readTime: "4 min",
      badge: "Today's pick",
      checklist: ["Use hide-chase-catch order", "Finish the hunt with a small meal", "Do not rely on laser play alone"],
    },
    articles: [
      {
        id: "cat-litter-box",
        category: "Litter",
        title: "Before scolding litter mistakes, check these first",
        summary:
          "Check litter type, location, cleanliness, and health signals in order. Cats often file complaints through the litter box.",
        readTime: "5 min",
        checklist: ["Use cat count + 1 litter boxes", "Avoid strong scented litter", "Ask a vet about sudden accidents"],
      },
      {
        id: "cat-touch-boundary",
        category: "Psychology",
        title: "When touch is welcome, and when the tail says stop",
        summary:
          "Purring is not always unlimited consent. Read ears, tail, and back muscles to understand touch boundaries.",
        readTime: "3 min",
        checklist: ["Stop when the tail tip taps", "Belly touch is not proof of trust", "Wait for the cat to approach first"],
      },
      {
        id: "cat-water-food",
        category: "Food",
        title: "Hydration tactics for cats who avoid water",
        summary:
          "Changing bowl position, material, or wet-food ratio can shift water intake. Start with small experiments.",
        readTime: "4 min",
        checklist: ["Separate food and water bowls", "Try a wide bowl or fountain", "Watch urine clump size"],
      },
    ],
    routines: [
      { title: "7-minute morning routine", items: ["Refill water", "Check litter clumps", "Check window spots and hideouts"] },
      { title: "Night hunting routine", items: ["10 minutes with a wand toy", "Let the cat catch the prey", "Feed a small meal and dim the lights"] },
    ],
    keywords: ["zoomies", "litter", "hunting play", "purring", "hydration", "hideout"],
    sajuCta: "Read my cat's saju",
  },
};

export const CHANNEL_INFO_CARDS: Record<PetChannel, ChannelInfoCard[]> = {
  dog: [
    {
      title: "견종별 성향 한눈에 보기",
      summary: "같은 강아지라도 견종마다 에너지, 경계심, 애착 표현이 달라요.",
      points: ["활동량: 낮음·보통·높음", "초보 집사 난이도", "짖음·분리불안 경향"],
    },
    {
      title: "매일 건강 체크",
      summary: "병원에 가기 전 집에서 먼저 볼 수 있는 신호를 모았습니다.",
      points: ["식욕·음수량 변화", "눈물·귀 냄새·피부", "변 상태와 산책 후 발바닥"],
    },
    {
      title: "식단과 간식 기준",
      summary: "사료량, 간식 비율, 알레르기 의심 신호를 쉽게 확인해요.",
      points: ["간식은 하루 열량 10% 안쪽", "새 간식은 3일 간격", "구토·설사·가려움 기록"],
    },
    {
      title: "산책·놀이 루틴",
      summary: "나이와 체력에 맞춰 산책과 노즈워크를 조절합니다.",
      points: ["퍼피는 짧게 자주", "성견은 냄새 맡기 포함", "노견은 관절 부담 줄이기"],
    },
  ],
  cat: [
    {
      title: "고양이 행동 신호",
      summary: "꼬리, 귀, 눈, 울음소리로 지금 기분을 읽어보세요.",
      points: ["꼬리 끝 탁탁은 중단 신호", "천천히 깜빡임은 안정감", "숨는 행동은 공간 필요"],
    },
    {
      title: "화장실 체크",
      summary: "실수나 모래 거부는 불만이 아니라 건강·환경 신호일 수 있어요.",
      points: ["고양이 수 + 1개", "강한 향 모래 피하기", "소변 덩어리 크기 관찰"],
    },
    {
      title: "음수량과 식단",
      summary: "물을 잘 안 마시는 아이를 위해 그릇 위치와 습식 비율을 조절해요.",
      points: ["밥그릇과 물그릇 분리", "넓은 그릇·정수기 테스트", "습식 급여 비율 확인"],
    },
    {
      title: "사냥 놀이 루틴",
      summary: "우다다와 새벽 활동은 낮 시간 놀이 설계로 줄일 수 있어요.",
      points: ["숨기기-추격-성공 순서", "놀이 후 소량 급여", "레이저만 오래 쓰지 않기"],
    },
  ],
};

export const CHANNEL_INFO_CARDS_EN: Record<PetChannel, ChannelInfoCard[]> = {
  dog: [
    {
      title: "Breed tendencies at a glance",
      summary: "Energy, alertness, and affection can differ widely by breed.",
      points: ["Energy level", "Beginner difficulty", "Barking and separation tendencies"],
    },
    {
      title: "Daily health check",
      summary: "Simple signs to watch before a small issue becomes urgent.",
      points: ["Appetite and water intake", "Tears, ears, and skin", "Stool and paws after walks"],
    },
    {
      title: "Food and treat basics",
      summary: "Check portions, treat ratios, and allergy clues without overcomplicating it.",
      points: ["Treats under 10% of calories", "Test new treats 3 days apart", "Track vomiting, diarrhea, itching"],
    },
    {
      title: "Walk and play routine",
      summary: "Adjust walking and nose work by age, body condition, and energy.",
      points: ["Short and frequent for puppies", "Include scent time for adults", "Reduce joint load for seniors"],
    },
  ],
  cat: [
    {
      title: "Cat behavior signals",
      summary: "Read mood through tail, ears, eyes, and vocal cues.",
      points: ["Tail tapping means pause", "Slow blinking shows comfort", "Hiding can mean space is needed"],
    },
    {
      title: "Litter box basics",
      summary: "Accidents may be health or environment signals, not stubbornness.",
      points: ["Cat count plus one box", "Avoid strong scents", "Watch urine clump size"],
    },
    {
      title: "Hydration and food",
      summary: "Improve water intake with bowl placement, material, and wet food balance.",
      points: ["Separate food and water", "Try wide bowls or fountains", "Review wet-food ratio"],
    },
    {
      title: "Hunting play routine",
      summary: "Daytime play design can reduce night zoomies and restless energy.",
      points: ["Hide-chase-catch order", "Small meal after play", "Avoid laser-only sessions"],
    },
  ],
};

export function getChannelContent(channel: PetChannel, locale: "ko" | "en" = "ko"): ChannelContent {
  return locale === "en" ? CHANNEL_CONTENT_EN[channel] : CHANNEL_CONTENT[channel];
}

export function getChannelInfoCards(channel: PetChannel, locale: "ko" | "en" = "ko"): ChannelInfoCard[] {
  return locale === "en" ? CHANNEL_INFO_CARDS_EN[channel] : CHANNEL_INFO_CARDS[channel];
}
