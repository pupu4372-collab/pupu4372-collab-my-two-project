import type { CommunityPost, PetAnimalType } from "@/lib/supabase/types";
import { isPetAnimalType } from "@/lib/community/board-categories";
import { slugifyTitle } from "@/lib/community/slug";

/** Matches supabase/migrations/006_qa_comments_and_seed.sql IDs */
function qaId(n: number) {
  return `00000000-0000-0000-0000-${String(600000 + n).padStart(12, "0")}`;
}

const SEED: Array<{
  n: number;
  title: string;
  content: string;
  tags: string[];
  likes: number;
  views: number;
  pinned?: boolean;
}> = [
  { n: 1, title: "강아지가 혼자 있으면 계속 짖어요", content: "외출하면 10분 안에 짖기 시작하고 문 앞에서 기다립니다. 분리불안인지, 집에서 어떤 순서로 연습하면 좋을까요?", tags: ["dog", "separation-anxiety", "training"], likes: 32, views: 410, pinned: true },
  { n: 2, title: "고양이 화장실은 몇 개가 적당할까요?", content: "한 마리를 키우는데 화장실 하나로 충분한지 고민입니다. 위치와 모래 종류도 같이 조언 부탁드려요.", tags: ["cat", "litter", "care"], likes: 28, views: 356, pinned: true },
  { n: 3, title: "산책 중 다른 강아지만 보면 흥분해요", content: "줄을 당기고 낑낑거리다가 짖기도 합니다. 인사시키는 게 맞는지, 거리를 두고 훈련해야 하는지 궁금해요.", tags: ["dog", "walk", "behavior"], likes: 25, views: 330, pinned: true },
  { n: 4, title: "새벽 우다다를 줄이는 방법이 있을까요?", content: "밤마다 뛰어다니고 장난감을 물고 옵니다. 자기 전 놀이 루틴을 어떻게 잡으면 좋을까요?", tags: ["cat", "play", "night"], likes: 21, views: 288 },
  { n: 5, title: "강아지가 사료를 갑자기 안 먹어요", content: "간식은 먹는데 사료만 남깁니다. 사료를 바로 바꿔도 되는지, 병원에 가야 하는 기준이 궁금해요.", tags: ["dog", "food", "health"], likes: 19, views: 275 },
  { n: 6, title: "고양이가 물을 너무 적게 마시는 것 같아요", content: "정수기를 써도 관심이 적습니다. 습식 비율이나 물그릇 위치를 어떻게 바꾸면 좋을까요?", tags: ["cat", "water", "food"], likes: 18, views: 261 },
  { n: 7, title: "배변 실수가 다시 시작됐어요", content: "배변 훈련이 끝난 줄 알았는데 최근 러그에 실수합니다. 환경 변화가 원인일 수 있을까요?", tags: ["dog", "potty", "routine"], likes: 16, views: 240 },
  { n: 8, title: "고양이 스크래처를 안 써요", content: "소파만 긁고 스크래처는 피합니다. 재질이나 위치를 바꾸면 효과가 있을까요?", tags: ["cat", "scratch", "home"], likes: 15, views: 229 },
  { n: 9, title: "입질이 심한 어린 강아지 어떻게 알려줘야 하나요?", content: "놀 때 손을 물고 흥분하면 더 세게 뭅니다. 혼내지 않고 멈추게 하는 방법이 궁금해요.", tags: ["dog", "puppy", "bite"], likes: 23, views: 315 },
  { n: 10, title: "고양이가 갑자기 숨는 시간이 늘었어요", content: "평소보다 침대 밑에 오래 있고 만지는 걸 피합니다. 스트레스인지 건강 문제인지 구분하고 싶어요.", tags: ["cat", "stress", "health"], likes: 20, views: 300 },
  { n: 11, title: "하네스 적응은 얼마나 걸릴까요?", content: "집에서는 괜찮은데 밖에 나가면 얼어붙습니다. 단계별로 적응시키는 팁이 있을까요?", tags: ["dog", "harness", "walk"], likes: 13, views: 190 },
  { n: 12, title: "고양이 합사 첫날에 서로 하악질해요", content: "문틈 냄새 교환은 했는데 얼굴을 보자마자 하악질합니다. 다시 분리해야 할까요?", tags: ["cat", "introductions", "behavior"], likes: 24, views: 340 },
  { n: 13, title: "강아지 귀 청소 주기가 궁금해요", content: "귀 냄새는 심하지 않은데 갈색 귀지가 조금 보입니다. 집에서 관리해도 되는 범위가 있을까요?", tags: ["dog", "grooming", "health"], likes: 12, views: 180 },
  { n: 14, title: "고양이 털토를 자주 해요", content: "일주일에 한두 번 정도 털을 토합니다. 빗질이나 사료로 줄일 수 있는지 궁금해요.", tags: ["cat", "grooming", "hairball"], likes: 17, views: 248 },
  { n: 15, title: "산책 시간이 짧아도 괜찮을까요?", content: "평일에는 15분씩 두 번이 한계입니다. 노즈워크나 실내 놀이로 보완할 수 있을까요?", tags: ["dog", "walk", "enrichment"], likes: 14, views: 210 },
  { n: 16, title: "고양이가 밥을 조금씩 자주 먹고 싶어해요", content: "정해진 시간 급식으로 바꾸려는데 계속 달라고 울어요. 천천히 바꾸는 방법이 있을까요?", tags: ["cat", "food", "routine"], likes: 11, views: 170 },
  { n: 17, title: "강아지가 초인종 소리에 심하게 짖어요", content: "택배가 오면 멈추지 않고 짖습니다. 소리 둔감화 훈련을 어떻게 시작하면 좋을까요?", tags: ["dog", "barking", "training"], likes: 22, views: 305 },
  { n: 18, title: "고양이 모래를 바꾸면 바로 거부할까요?", content: "먼지가 적은 모래로 바꾸고 싶은데 화장실을 안 쓸까 봐 걱정됩니다. 섞어서 바꾸는 게 좋나요?", tags: ["cat", "litter", "routine"], likes: 13, views: 205 },
  { n: 19, title: "강아지가 차만 타면 침을 흘려요", content: "병원 가는 날마다 차멀미처럼 보여요. 짧은 거리부터 연습하면 도움이 될까요?", tags: ["dog", "car", "stress"], likes: 10, views: 165 },
  { n: 20, title: "고양이가 손을 사냥감처럼 물어요", content: "놀다가 갑자기 손목을 잡고 뒷발차기를 합니다. 손놀이를 끊는 방법이 궁금해요.", tags: ["cat", "play", "bite"], likes: 18, views: 260 },
  { n: 21, title: "강아지 발 닦을 때 너무 싫어해요", content: "산책 후 발을 닦으려면 도망가고 으르렁거립니다. 간식 보상으로 천천히 해도 될까요?", tags: ["dog", "grooming", "training"], likes: 12, views: 188 },
  { n: 22, title: "고양이가 창밖 새를 보며 이상한 소리를 내요", content: "짹짹거리는 듯한 소리를 내는데 스트레스인지 흥분인지 궁금합니다.", tags: ["cat", "behavior", "play"], likes: 9, views: 140 },
  { n: 23, title: "강아지 사회화가 늦은 것 같아요", content: "성견 입양 후 사람과 개를 모두 무서워합니다. 무리하지 않고 적응시키는 기준을 알고 싶어요.", tags: ["dog", "socialization", "adoption"], likes: 20, views: 289 },
  { n: 24, title: "고양이 양치 적응은 어떻게 시작하나요?", content: "칫솔만 보면 고개를 돌립니다. 손가락 거즈부터 시작하는 게 맞을까요?", tags: ["cat", "dental", "care"], likes: 15, views: 236 },
  { n: 25, title: "강아지가 자기 방석 대신 바닥에서 자요", content: "좋은 방석을 사줬는데 시원한 바닥만 찾습니다. 그냥 둬도 괜찮을까요?", tags: ["dog", "sleep", "home"], likes: 7, views: 120 },
  { n: 26, title: "고양이가 새 장난감에 금방 질려요", content: "처음 하루만 좋아하고 관심이 사라집니다. 장난감 로테이션이 효과가 있나요?", tags: ["cat", "play", "enrichment"], likes: 12, views: 198 },
  { n: 27, title: "강아지 간식은 하루에 얼마나 줘야 할까요?", content: "훈련 보상으로 자주 주다 보니 식사량이 줄었습니다. 간식 비율 기준이 궁금해요.", tags: ["dog", "food", "training"], likes: 16, views: 255 },
  { n: 28, title: "고양이가 높은 곳에서만 쉬어요", content: "캣타워 위에서만 자고 아래로 잘 안 내려옵니다. 안정감을 느끼는 행동일까요?", tags: ["cat", "home", "behavior"], likes: 8, views: 132 },
  { n: 29, title: "비 오는 날 산책을 싫어해요", content: "우비를 입히면 멈춰 서고 비 냄새도 싫어하는 듯합니다. 실내 대체 활동 추천 부탁드려요.", tags: ["dog", "walk", "weather"], likes: 14, views: 215 },
  { n: 30, title: "고양이 발톱 깎을 때 한 발도 힘들어요", content: "자는 틈에 하나씩 깎아도 깨면 도망갑니다. 스트레스 적게 관리하는 루틴이 있을까요?", tags: ["cat", "grooming", "nail"], likes: 19, views: 278 },
  { n: 31, title: "강아지가 손님에게 뛰어올라요", content: "반가워서 달려드는데 손님들이 놀랍니다. 앉아서 인사하는 연습을 어떻게 시키나요?", tags: ["dog", "manners", "training"], likes: 17, views: 250 },
  { n: 32, title: "고양이가 밥그릇 주변을 긁어요", content: "먹고 난 뒤 바닥을 덮는 것처럼 긁습니다. 불만 표시인지 본능 행동인지 궁금해요.", tags: ["cat", "food", "behavior"], likes: 10, views: 168 },
  { n: 33, title: "강아지가 다른 집 개똥을 먹으려 해요", content: "산책 중 냄새 맡다가 먹으려 해서 걱정됩니다. 식분증과 훈련 방법을 알고 싶어요.", tags: ["dog", "walk", "coprophagia"], likes: 18, views: 290 },
  { n: 34, title: "고양이 이동장 적응이 너무 어려워요", content: "병원 갈 때만 이동장을 꺼내서 그런지 보자마자 숨습니다. 평소에 어떻게 둬야 할까요?", tags: ["cat", "carrier", "vet"], likes: 22, views: 315 },
  { n: 35, title: "강아지 노즈워크를 매일 해도 되나요?", content: "산책을 못 한 날 노즈워크를 길게 해줍니다. 난이도와 시간을 어떻게 조절하면 좋을까요?", tags: ["dog", "enrichment", "play"], likes: 13, views: 202 },
  { n: 36, title: "고양이가 특정 사람만 피합니다", content: "가족 중 한 명만 보면 멀리 돌아갑니다. 냄새나 목소리 때문일 수 있을까요?", tags: ["cat", "stress", "family"], likes: 9, views: 152 },
  { n: 37, title: "강아지가 물그릇을 엎어요", content: "마시기보다 앞발로 장난치듯 엎습니다. 그릇 높이나 재질을 바꿔야 할까요?", tags: ["dog", "water", "home"], likes: 8, views: 138 },
  { n: 38, title: "고양이가 새벽에 밥 달라고 깨워요", content: "자동급식기를 쓰면 도움이 될까요? 울 때 바로 주면 습관이 될까 봐 걱정됩니다.", tags: ["cat", "food", "night"], likes: 21, views: 301 },
  { n: 39, title: "강아지가 미용 후 예민해졌어요", content: "미용실 다녀온 뒤 만지는 걸 싫어하고 잠을 많이 잡니다. 어느 정도까지 정상 반응일까요?", tags: ["dog", "grooming", "stress"], likes: 15, views: 230 },
  { n: 40, title: "고양이 캣닢 반응이 없어요", content: "다른 고양이들은 좋아한다는데 우리 아이는 무덤덤합니다. 정상인가요?", tags: ["cat", "catnip", "play"], likes: 6, views: 110 },
  { n: 41, title: "강아지 예방접종 후 산책은 언제부터 괜찮나요?", content: "접종 스케줄 중인데 사회화도 중요하다고 해서 고민됩니다. 안전한 범위가 궁금해요.", tags: ["dog", "vaccine", "walk"], likes: 20, views: 330 },
  { n: 42, title: "고양이가 화장실 밖에서 소변을 봤어요", content: "딱 한 번 실수했는데 그냥 지켜봐도 될까요? 병원에 바로 가야 하는 신호가 궁금합니다.", tags: ["cat", "litter", "health"], likes: 26, views: 380 },
  { n: 43, title: "강아지가 장난감을 지키며 으르렁거려요", content: "뺏으려고 하면 으르렁거립니다. 교환 놀이로 연습하면 나아질까요?", tags: ["dog", "resource-guarding", "training"], likes: 23, views: 345 },
  { n: 44, title: "고양이가 그루밍을 너무 많이 해요", content: "배 쪽 털이 조금 얇아진 것 같습니다. 스트레스와 피부 문제 중 무엇을 먼저 봐야 할까요?", tags: ["cat", "grooming", "health"], likes: 24, views: 360 },
  { n: 45, title: "강아지 산책 코스를 매일 바꾸는 게 좋나요?", content: "익숙한 길을 좋아하는지 새로운 길을 좋아하는지 헷갈립니다. 성향별로 다를까요?", tags: ["dog", "walk", "routine"], likes: 11, views: 172 },
  { n: 46, title: "고양이에게 두 번째 캣타워가 필요할까요?", content: "창가 자리를 두고 고양이 둘이 경쟁합니다. 공간을 분리하면 싸움이 줄어들까요?", tags: ["cat", "multi-cat", "home"], likes: 16, views: 242 },
  { n: 47, title: "강아지가 보호자 뒤만 따라다녀요", content: "화장실까지 따라오고 떨어지면 불안해합니다. 독립 시간을 어떻게 연습하면 좋을까요?", tags: ["dog", "attachment", "training"], likes: 27, views: 390 },
  { n: 48, title: "고양이가 갑자기 사료를 묻으려 해요", content: "밥그릇 주변을 긁고 남깁니다. 양이 많거나 맛이 마음에 안 드는 걸까요?", tags: ["cat", "food", "behavior"], likes: 13, views: 208 },
  { n: 49, title: "반려동물 사주 결과를 생활 루틴에 적용해도 될까요?", content: "목 기운이 강한 아이는 탐색 놀이를 늘리는 식으로 참고해도 괜찮을지 궁금합니다.", tags: ["saju", "routine", "enrichment"], likes: 30, views: 420 },
  { n: 50, title: "우리 아이 성향 태그는 어떻게 고르면 좋을까요?", content: "겁쟁이, 에너자이저, 애교쟁이처럼 여러 태그가 맞는 것 같습니다. 프로필에는 몇 개가 적당할까요?", tags: ["profile", "saju", "community"], likes: 12, views: 184 },
];

export const PET_CATEGORY_FILTER_TAGS = [
  { id: "all", ko: "전체", en: "All" },
  { id: "dog", ko: "강아지", en: "Dogs" },
  { id: "cat", ko: "고양이", en: "Cats" },
  { id: "reptile", ko: "렙타일", en: "Reptiles" },
  { id: "other", ko: "그외친구들", en: "Other Pals" },
] as const;

export const QA_FILTER_TAGS = [
  { id: "all", label: "전체" },
  { id: "dog", label: "강아지" },
  { id: "cat", label: "고양이" },
  { id: "reptile", label: "렙타일" },
  { id: "other", label: "그외친구들" },
  { id: "training", label: "훈련" },
  { id: "health", label: "건강" },
  { id: "food", label: "식단" },
  { id: "saju", label: "사주" },
] as const;

function inferQaCategory(animal: PetAnimalType, tags: string[]): string {
  const topic = tags.filter((t) => t !== animal);
  if (topic.some((t) => ["saju", "profile"].includes(t))) return "saju-fortune";
  if (topic.some((t) => ["health", "grooming", "dental", "vaccine", "hairball", "vet"].includes(t))) {
    return "health-disease";
  }
  if (topic.some((t) => ["food", "water", "litter", "catnip"].includes(t))) return "food-nutrition";
  return animal === "cat" ? "behavior-habits" : "behavior-training";
}

export function buildMockQaPosts(): CommunityPost[] {
  const base = Date.now();
  return SEED.map((row) => {
    const animal = row.tags.find((t): t is PetAnimalType => isPetAnimalType(t)) ?? "dog";
    return {
    id: qaId(row.n),
    author_id: "00000000-0000-0000-0000-000000000101",
    pet_id: null,
    channel: "community" as const,
    post_type: "qa" as const,
    title: row.title,
    content: row.content,
    image_urls: [],
    tags: row.tags,
    animal_type: animal,
    category: inferQaCategory(animal, row.tags),
    language: "ko",
    country_code: row.n % 3 === 0 ? "US" : "KR",
    like_count: row.likes,
    comment_count: 1,
    view_count: row.views,
    is_hidden: false,
    is_pinned: row.pinned ?? false,
    is_answered: row.n === 1,
    adopted_answer_id: row.n === 1 ? `${qaId(row.n)}-comment-2` : null,
    seo_slug: slugifyTitle(row.title) || `qa-${row.n}`,
    difficulty: null,
    time_required: null,
    save_count: row.n % 5,
    share_count: 0,
    created_at: new Date(base - row.n * 3600000).toISOString(),
    updated_at: new Date(base - row.n * 3600000).toISOString(),
  };
  });
}

export const MOCK_QA_POSTS = buildMockQaPosts();
