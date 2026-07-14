import type { AnimalGroup } from "@/lib/saju/pet-trait-mapping";
import type { ElementKey, Locale } from "@/lib/saju/types";

export type TraitCopy = { trait: string; body: string };

type TraitCopyKey = `${AnimalGroup}-${ElementKey}`;

export const PERSONALITY_TRAIT_COPY_KO: Record<TraitCopyKey, TraitCopy[]> = {
  "dog-wood": [
    { trait: "호기심 많음", body: "처음 보는 냄새나 소리에도 망설임 없이 코부터 들이대는 편이에요. 새로운 산책길이나 낯선 물건 앞에서 유난히 눈이 반짝여요." },
    { trait: "성장 욕구 강함", body: "같은 놀이를 반복하기보다 새로운 자극과 도전을 좋아해요. 하나를 익히고 나면 금방 다음 단계를 궁금해해요." },
    { trait: "훈련 습득 빠름", body: "같은 명령을 반복해서 알려주지 않아도 흐름을 빨리 캐치해요. 새 훈련을 시작할 때 적응 속도가 눈에 띄게 빠른 편이에요." },
  ],
  "dog-fire": [
    { trait: "활발함", body: "가만히 있는 시간보다 몸을 움직이는 시간을 훨씬 편하게 느껴요. 산책이나 놀이 시간이 짧으면 오히려 에너지가 남아 안절부절못할 수 있어요." },
    { trait: "애정 표현이 큼", body: "반가움이나 애정을 몸 전체로 표현해요. 꼬리, 점프, 부비기처럼 표현이 크고 즉각적인 편이에요." },
    { trait: "에너지 넘침", body: "짧은 산책 한 번으로는 성이 안 찰 수 있어요. 활동량이 부족하면 실내에서라도 에너지를 풀 거리를 찾아요." },
  ],
  "dog-earth": [
    { trait: "안정적", body: "낯선 상황에서도 비교적 차분하게 반응해요. 환경이 조금 바뀌어도 크게 동요하지 않는 편이에요." },
    { trait: "느긋함", body: "재촉한다고 서두르는 타입이 아니에요. 자기만의 속도로 상황을 받아들이는 편이에요." },
    { trait: "충직함", body: "한번 마음을 준 사람 곁을 잘 벗어나지 않으려 해요. 애착 대상 근처에 머무는 걸 자연스럽게 좋아해요." },
  ],
  "dog-metal": [
    { trait: "독립적", body: "혼자 있는 시간도 크게 힘들어하지 않아요. 항상 붙어있지 않아도 안정감을 느끼는 편이에요." },
    { trait: "경계심 있음", body: "낯선 사람이나 소리에 먼저 반응하고 살피는 편이에요. 익숙해지기 전까지는 거리를 두고 관찰해요." },
    { trait: "단호함", body: "한번 결정한 행동은 잘 바꾸지 않아요. 고집스럽다기보다 자기 기준이 뚜렷한 편이에요." },
  ],
  "dog-water": [
    { trait: "영리함", body: "패턴을 빨리 파악하고 상황을 미리 예측하는 편이에요. 같은 상황이 반복되면 요령을 금방 터득해요." },
    { trait: "관찰력 좋음", body: "행동하기 전에 주변을 먼저 살피는 편이에요. 사람의 표정이나 톤 변화를 잘 캐치해요." },
    { trait: "낯가림 있을 수 있음", body: "새로운 사람이나 공간에는 시간을 두고 적응해요. 처음엔 거리를 두다가 편해지면 확 달라져요." },
  ],
  "cat-wood": [
    { trait: "탐험을 좋아함", body: "새로운 물건이나 공간이 생기면 먼저 다가가서 확인해요. 집안 구조가 바뀌면 제일 먼저 눈치채는 편이에요." },
    { trait: "높은 곳 선호", body: "캣타워나 가구 위처럼 높은 자리를 편하게 여겨요. 위에서 아래를 내려다보는 자리를 스스로 찾아가요." },
    { trait: "자기주장 뚜렷", body: "원하는 게 있으면 표현을 참지 않아요. 울음이나 행동으로 의사를 분명하게 드러내는 편이에요." },
  ],
  "cat-fire": [
    { trait: "감정 기복 있음", body: "기분에 따라 반응이 꽤 달라질 수 있어요. 같은 상황에도 어떤 날은 반기고 어떤 날은 시큰둥할 수 있어요." },
    { trait: "애교와 도도함 공존", body: "다가올 땐 확실히 다가오다가도 금방 선을 긋기도 해요. 애정 표현과 거리두기가 번갈아 나타나는 편이에요." },
    { trait: "순간 폭발적 에너지", body: "평소엔 여유롭다가도 스위치가 켜지면 갑자기 몸을 크게 움직여요. 짧고 강한 활동 텀이 반복되는 편이에요." },
  ],
  "cat-earth": [
    { trait: "느긋함", body: "서두르는 법이 거의 없어요. 자극이 있어도 한 박자 늦게, 여유 있게 반응하는 편이에요." },
    { trait: "집순이 성향", body: "익숙한 공간을 벗어나는 걸 별로 좋아하지 않아요. 집 안에서 자기 자리를 정해두고 머무는 편이에요." },
    { trait: "안정 추구", body: "환경 변화에 예민하게 반응할 수 있어요. 루틴이 일정할수록 편안해하는 편이에요." },
  ],
  "cat-metal": [
    { trait: "도도함", body: "다가오라고 부른다고 바로 오지 않아요. 관심이 없어서가 아니라 자기 페이스대로 움직이는 거예요." },
    { trait: "선 긋기 분명", body: "스킨십이나 놀이도 원할 때만 받아들이는 편이에요. 싫은 건 확실하게 피하거나 자리를 뜨는 식으로 표현해요." },
    { trait: "관찰 후 행동", body: "새로운 상황에 바로 뛰어들기보다 지켜본 뒤 움직여요. 안전하다고 판단되면 그제야 다가가요." },
  ],
  "cat-water": [
    { trait: "신중함", body: "낯선 자극에 곧바로 반응하지 않고 한 발 물러나 지켜봐요. 확신이 서야 움직이는 편이에요." },
    { trait: "낯가림", body: "새로운 사람 앞에서는 몸을 낮추거나 숨는 모습을 보일 수 있어요. 적응 시간이 필요한 편이에요." },
    { trait: "한번 마음 열면 깊은 애착", body: "마음을 여는 데는 시간이 걸리지만, 한번 곁을 내주면 꽤 깊게 붙어있으려 해요." },
  ],
  "reptile-wood": [
    { trait: "환경 적응력 양호", body: "사육 환경이 조금씩 바뀌어도 비교적 빠르게 적응하는 편이에요." },
    { trait: "활동 반경 넓힘", body: "익숙해질수록 사육장 안에서 움직이는 범위가 넓어지는 편이에요." },
  ],
  "reptile-fire": [
    { trait: "온도 민감", body: "온도 변화에 따라 컨디션과 행동이 눈에 띄게 달라질 수 있어요." },
    { trait: "활동성 변화 큼", body: "따뜻할 때와 서늘할 때의 활동량 차이가 꽤 큰 편이에요." },
  ],
  "reptile-earth": [
    { trait: "안정적 생체리듬", body: "먹이·휴식 패턴이 비교적 일정하게 유지되는 편이에요." },
    { trait: "루틴 선호", body: "정해진 시간과 순서가 반복될 때 더 편안해하는 편이에요." },
  ],
  "reptile-metal": [
    { trait: "경계심 높음", body: "새로운 자극이나 손길에 예민하게 반응할 수 있어요." },
    { trait: "핸들링 시 예민할 수 있음", body: "다루는 손길에 따라 스트레스 반응이 클 수 있어 주의가 필요해요." },
  ],
  "reptile-water": [
    { trait: "습도 민감", body: "습도 변화에 따라 활동성과 컨디션이 달라질 수 있어요." },
    { trait: "은신 선호", body: "은신처나 어두운 공간에 머무는 시간을 편안하게 여겨요." },
  ],
};

export const PERSONALITY_TRAIT_COPY_EN: Record<TraitCopyKey, TraitCopy[]> = {
  "dog-wood": [
    { trait: "Curious", body: "Quick to nose into anything new — a fresh scent or an unfamiliar object on the walk usually gets full attention first." },
    { trait: "Strong growth drive", body: "Prefers new challenges over repeating the same game. Once one skill clicks, the next is already on their mind." },
    { trait: "Quick to learn tricks", body: "Doesn't need a cue repeated many times to catch on. Adapts fast when a new training routine starts." },
  ],
  "dog-fire": [
    { trait: "Energetic", body: "Sitting still is harder than moving. If walks or play run short, that extra energy tends to show up indoors." },
    { trait: "Big on affection", body: "Greets people with their whole body — tail, jumps, nuzzling. Affection tends to be big and immediate." },
    { trait: "Overflowing enthusiasm", body: "A short walk rarely feels like enough. When activity is low, they'll find their own way to burn it off." },
  ],
  "dog-earth": [
    { trait: "Steady", body: "Stays fairly calm even in unfamiliar situations. Small changes to routine don't throw them off easily." },
    { trait: "Easygoing", body: "Doesn't rush no matter how much you push. Takes things in at their own pace." },
    { trait: "Loyal", body: "Doesn't wander far from people they've bonded with. Naturally gravitates toward staying close." },
  ],
  "dog-metal": [
    { trait: "Independent", body: "Handles alone time without much fuss. Doesn't need constant company to feel settled." },
    { trait: "Alert boundaries", body: "Notices unfamiliar people or sounds first. Keeps a little distance until things feel familiar." },
    { trait: "Decisive", body: "Once a decision is made, it tends to stick — less stubborn than simply having clear standards." },
  ],
  "dog-water": [
    { trait: "Clever", body: "Picks up on patterns quickly and often anticipates what's coming next." },
    { trait: "Observant", body: "Watches before acting. Picks up on tone of voice and facial expressions easily." },
    { trait: "May need time to warm up", body: "New people or places take a little time. Standoffish at first, noticeably different once comfortable." },
  ],
  "cat-wood": [
    { trait: "Loves to explore", body: "New objects or rearranged spaces get investigated first — usually the first to notice when something's moved." },
    { trait: "Prefers high perches", body: "Comfortable up on cat trees or furniture, seeking out spots that look down over the room." },
    { trait: "Strong self-will", body: "Doesn't hold back when there's something they want. Vocalizes or acts clearly to get the point across." },
  ],
  "cat-fire": [
    { trait: "Mood swings", body: "Reactions can vary a lot depending on the day — the same situation might get a warm welcome one day, indifference the next." },
    { trait: "Mix of affection and aloofness", body: "Comes in close, then draws a line just as quickly. Affection and distance tend to alternate." },
    { trait: "Bursts of energy", body: "Calm most of the time, until something flips the switch — then it's short, intense bursts of activity." },
  ],
  "cat-earth": [
    { trait: "Laid-back", body: "Rarely in a hurry. Reacts a beat slower and more relaxed, even to something exciting." },
    { trait: "Homebody", body: "Not eager to leave familiar territory. Tends to claim a spot at home and settle into it." },
    { trait: "Seeks stability", body: "Can be sensitive to changes in environment — more comfortable the more consistent the routine stays." },
  ],
  "cat-metal": [
    { trait: "Aloof", body: "Calling them over doesn't guarantee they'll come right away — not disinterest, just moving on their own schedule." },
    { trait: "Clear boundaries", body: "Affection and play happen on their terms. Dislikes are made clear by avoiding or walking away." },
    { trait: "Observes before acting", body: "Doesn't jump straight into a new situation — watches first, then moves in once it feels safe." },
  ],
  "cat-water": [
    { trait: "Cautious", body: "Doesn't react right away to something unfamiliar — tends to hang back and watch before deciding to engage." },
    { trait: "Shy with strangers", body: "May lower their body or hide around new people. Needs a bit of time to adjust." },
    { trait: "Deep bond once attached", body: "Takes time to open up, but once they do, they tend to stay close." },
  ],
  "reptile-wood": [
    { trait: "Adapts well to habitat changes", body: "Adjusts fairly quickly even when small changes are made to the enclosure." },
    { trait: "Expands activity range", body: "Tends to explore more of the enclosure as they settle in." },
  ],
  "reptile-fire": [
    { trait: "Temperature-sensitive", body: "Condition and behavior can shift noticeably with temperature changes." },
    { trait: "Activity shifts with heat/light", body: "Activity level tends to differ quite a bit between warmer and cooler periods." },
  ],
  "reptile-earth": [
    { trait: "Steady biological rhythm", body: "Feeding and rest patterns tend to stay fairly consistent." },
    { trait: "Prefers routine", body: "More settled when the same schedule and sequence repeat." },
  ],
  "reptile-metal": [
    { trait: "High alertness", body: "Can react sharply to new stimuli or handling." },
    { trait: "May be touch-sensitive", body: "Stress response to handling can vary — worth being gentle and attentive." },
  ],
  "reptile-water": [
    { trait: "Humidity-sensitive", body: "Activity and condition can shift with humidity changes." },
    { trait: "Prefers hiding spots", body: "Comfortable spending time in a hide or shaded space." },
  ],
};

export function personalityTraitBody(
  group: AnimalGroup,
  element: ElementKey,
  trait: string,
  locale: Locale
): string | null {
  const table = locale === "ko" ? PERSONALITY_TRAIT_COPY_KO : PERSONALITY_TRAIT_COPY_EN;
  const entries = table[`${group}-${element}`];
  return entries?.find((e) => e.trait === trait)?.body ?? null;
}
