import type { Species } from "@/lib/saju/types";

export type MbtiAxis = "EI" | "SN" | "TF" | "JP";

export type MbtiOption = { label: string; value: 0 | 1 };

export type MbtiQuestion = {
  id: string;
  axis: MbtiAxis;
  question: string;
  optionA: MbtiOption;
  optionB: MbtiOption;
};

type MbtiQuestionRaw = {
  id: string;
  axis: MbtiAxis;
  questionKo: string;
  questionEn: string;
  optionA: { labelKo: string; labelEn: string; value: 0 | 1 };
  optionB: { labelKo: string; labelEn: string; value: 0 | 1 };
};

function localizeQuestion(raw: MbtiQuestionRaw, locale: "ko" | "en"): MbtiQuestion {
  return {
    id: raw.id,
    axis: raw.axis,
    question: locale === "en" ? raw.questionEn : raw.questionKo,
    optionA: {
      label: locale === "en" ? raw.optionA.labelEn : raw.optionA.labelKo,
      value: raw.optionA.value,
    },
    optionB: {
      label: locale === "en" ? raw.optionB.labelEn : raw.optionB.labelKo,
      value: raw.optionB.value,
    },
  };
}

const DOG_QUESTIONS: MbtiQuestionRaw[] = [
  {
    id: "dog_ei_1",
    axis: "EI",
    questionKo: "산책 중 낯선 개를 만나면?",
    questionEn: "When meeting a stranger dog on a walk?",
    optionA: { labelKo: "먼저 달려가 인사한다", labelEn: "Runs up first to say hello", value: 0 },
    optionB: { labelKo: "주인 뒤에 숨거나 경계한다", labelEn: "Hides behind you or stays alert", value: 1 },
  },
  {
    id: "dog_ei_2",
    axis: "EI",
    questionKo: "집에 손님이 오면?",
    questionEn: "When guests visit?",
    optionA: { labelKo: "온 집을 뛰어다니며 환영한다", labelEn: "Runs around the house to welcome them", value: 0 },
    optionB: { labelKo: "구석에서 지켜보다 천천히 다가간다", labelEn: "Watches from a corner, then approaches slowly", value: 1 },
  },
  {
    id: "dog_ei_3",
    axis: "EI",
    questionKo: "혼자 집에 남겨지면?",
    questionEn: "When left home alone?",
    optionA: { labelKo: "낑낑대거나 짖으며 불안해한다", labelEn: "Whines or barks anxiously", value: 0 },
    optionB: { labelKo: "조용히 자리 잡고 잠든다", labelEn: "Settles quietly in their spot and sleeps", value: 1 },
  },
  {
    id: "dog_sn_1",
    axis: "SN",
    questionKo: "새 장난감을 줬을 때?",
    questionEn: "When given a new toy?",
    optionA: { labelKo: "바로 물고 신나게 흔든다", labelEn: "Grabs it right away and shakes it excitedly", value: 0 },
    optionB: { labelKo: "냄새 맡고 한참 관찰 후 접근한다", labelEn: "Sniffs and observes for a while before approaching", value: 1 },
  },
  {
    id: "dog_sn_2",
    axis: "SN",
    questionKo: "산책 루트를 바꾸면?",
    questionEn: "When the walk route changes?",
    optionA: { labelKo: "새 냄새를 맡느라 신이 난다", labelEn: "Gets excited exploring new scents", value: 0 },
    optionB: { labelKo: "어리둥절하며 원래 방향을 보려 한다", labelEn: "Looks confused and tries to go the usual way", value: 1 },
  },
  {
    id: "dog_tf_1",
    axis: "TF",
    questionKo: "보호자가 슬퍼 보이면?",
    questionEn: "When you seem sad?",
    optionA: { labelKo: "옆에 딱 붙어서 핥아준다", labelEn: "Sticks close and licks you", value: 0 },
    optionB: { labelKo: "평소와 다름없이 행동한다", labelEn: "Acts the same as usual", value: 1 },
  },
  {
    id: "dog_tf_2",
    axis: "TF",
    questionKo: "간식을 주지 않으면?",
    questionEn: "When you don't give a treat?",
    optionA: { labelKo: "눈을 반짝이며 애교를 부린다", labelEn: "Gives you big puppy eyes and charms you", value: 0 },
    optionB: { labelKo: "잠시 쳐다보다 그냥 돌아간다", labelEn: "Glances, then walks away", value: 1 },
  },
  {
    id: "dog_tf_3",
    axis: "TF",
    questionKo: "다른 개가 자기 장난감을 가져가면?",
    questionEn: "When another dog takes their toy?",
    optionA: { labelKo: "바로 쫓아가 되찾아온다", labelEn: "Chases right away to get it back", value: 0 },
    optionB: { labelKo: "멍하니 바라보다 다른 걸 찾는다", labelEn: "Stares blankly and finds something else", value: 1 },
  },
  {
    id: "dog_jp_1",
    axis: "JP",
    questionKo: "밥 시간이 됐을 때?",
    questionEn: "When mealtime comes?",
    optionA: { labelKo: "정해진 자리에서 얌전히 기다린다", labelEn: "Waits quietly in their usual spot", value: 0 },
    optionB: { labelKo: "주방을 왔다갔다 어슬렁거린다", labelEn: "Paces around the kitchen", value: 1 },
  },
  {
    id: "dog_jp_2",
    axis: "JP",
    questionKo: "산책 준비를 하면?",
    questionEn: "When you prepare for a walk?",
    optionA: { labelKo: "리드줄 채우는 동안 얌전히 선다", labelEn: "Stands still while you clip the leash", value: 0 },
    optionB: { labelKo: "흥분해서 뱅뱅 돌며 난리친다", labelEn: "Spins in excitement and goes wild", value: 1 },
  },
];

const CAT_QUESTIONS: MbtiQuestionRaw[] = [
  {
    id: "cat_ei_1",
    axis: "EI",
    questionKo: "보호자가 소파에 앉으면?",
    questionEn: "When you sit on the sofa?",
    optionA: { labelKo: "바로 와서 올라앉는다", labelEn: "Jumps up right away to sit with you", value: 0 },
    optionB: { labelKo: "근처에 있지만 거리를 유지한다", labelEn: "Stays nearby but keeps some distance", value: 1 },
  },
  {
    id: "cat_ei_2",
    axis: "EI",
    questionKo: "낯선 방문객이 오면?",
    questionEn: "When a stranger visits?",
    optionA: { labelKo: "먼저 다가가 냄새를 맡는다", labelEn: "Approaches first to sniff them", value: 0 },
    optionB: { labelKo: "숨거나 높은 곳에서 내려다본다", labelEn: "Hides or watches from up high", value: 1 },
  },
  {
    id: "cat_ei_3",
    axis: "EI",
    questionKo: "보호자가 다른 방에 있으면?",
    questionEn: "When you are in another room?",
    optionA: { labelKo: "따라가서 옆에 있는다", labelEn: "Follows you and stays close", value: 0 },
    optionB: { labelKo: "자기 자리에서 혼자 논다", labelEn: "Plays alone in their spot", value: 1 },
  },
  {
    id: "cat_sn_1",
    axis: "SN",
    questionKo: "새 물건이 집에 생기면?",
    questionEn: "When something new appears at home?",
    optionA: { labelKo: "즉시 올라가거나 들어간다", labelEn: "Climbs on or into it immediately", value: 0 },
    optionB: { labelKo: "멀리서 오래 바라보다 나중에 접근한다", labelEn: "Watches from afar and approaches later", value: 1 },
  },
  {
    id: "cat_sn_2",
    axis: "SN",
    questionKo: "창밖을 볼 때 주로 반응하는 건?",
    questionEn: "When looking out the window, they react most to?",
    optionA: { labelKo: "새나 벌레 등 움직이는 것", labelEn: "Moving things like birds or bugs", value: 0 },
    optionB: { labelKo: "바람에 흔들리는 나뭇잎 같은 것", labelEn: "Things like leaves swaying in the wind", value: 1 },
  },
  {
    id: "cat_tf_1",
    axis: "TF",
    questionKo: "배가 고플 때?",
    questionEn: "When hungry?",
    optionA: { labelKo: "야옹거리며 발로 툭툭 건드린다", labelEn: "Meows and taps you with a paw", value: 0 },
    optionB: { labelKo: "조용히 밥그릇 앞에 앉아 응시한다", labelEn: "Sits quietly in front of the bowl and stares", value: 1 },
  },
  {
    id: "cat_tf_2",
    axis: "TF",
    questionKo: "보호자가 아파서 누워있으면?",
    questionEn: "When you are sick in bed?",
    optionA: { labelKo: "배 위에 올라와 꾹꾹이를 한다", labelEn: "Climbs on you and kneads", value: 0 },
    optionB: { labelKo: "평소와 다름없이 혼자 논다", labelEn: "Plays alone as usual", value: 1 },
  },
  {
    id: "cat_tf_3",
    axis: "TF",
    questionKo: "혼나거나 제지당하면?",
    questionEn: "When scolded or stopped?",
    optionA: { labelKo: "야옹거리거나 더 부비적댄다", labelEn: "Meows or rubs against you more", value: 0 },
    optionB: { labelKo: "못마땅한 표정으로 자리를 피한다", labelEn: "Leaves with a displeased look", value: 1 },
  },
  {
    id: "cat_jp_1",
    axis: "JP",
    questionKo: "사냥 놀이를 할 때?",
    questionEn: "During hunting play?",
    optionA: { labelKo: "패턴 파악 후 기다렸다 정확히 낚아챈다", labelEn: "Reads the pattern and pounces at the right moment", value: 0 },
    optionB: { labelKo: "즉흥적으로 이리저리 뛰어다닌다", labelEn: "Improvises and darts all over", value: 1 },
  },
  {
    id: "cat_jp_2",
    axis: "JP",
    questionKo: "하루 루틴이 바뀌면?",
    questionEn: "When the daily routine changes?",
    optionA: { labelKo: "불안해하거나 울부짖는다", labelEn: "Gets anxious or vocal", value: 0 },
    optionB: { labelKo: "별 신경 안 쓰고 적응한다", labelEn: "Adapts without much fuss", value: 1 },
  },
];

const OTHER_QUESTIONS: MbtiQuestionRaw[] = [
  {
    id: "other_ei_1",
    axis: "EI",
    questionKo: "핸들링을 하면?",
    questionEn: "When handled?",
    optionA: { labelKo: "손 위를 자유롭게 돌아다닌다", labelEn: "Moves freely on your hand", value: 0 },
    optionB: { labelKo: "가만히 있거나 숨으려 한다", labelEn: "Stays still or tries to hide", value: 1 },
  },
  {
    id: "other_ei_2",
    axis: "EI",
    questionKo: "케이지 문을 열면?",
    questionEn: "When the cage door opens?",
    optionA: { labelKo: "스스로 나오려고 한다", labelEn: "Tries to come out on their own", value: 0 },
    optionB: { labelKo: "안쪽으로 들어가거나 숨는다", labelEn: "Goes inward or hides", value: 1 },
  },
  {
    id: "other_ei_3",
    axis: "EI",
    questionKo: "보호자가 케이지 앞에 서면?",
    questionEn: "When you stand in front of the cage?",
    optionA: { labelKo: "앞으로 나와 관찰한다", labelEn: "Comes forward to observe", value: 0 },
    optionB: { labelKo: "반응 없이 제자리에 있는다", labelEn: "Stays put with no reaction", value: 1 },
  },
  {
    id: "other_sn_1",
    axis: "SN",
    questionKo: "새로운 먹이를 줬을 때?",
    questionEn: "When given new food?",
    optionA: { labelKo: "바로 공격적으로 덤빈다", labelEn: "Lunges to eat right away", value: 0 },
    optionB: { labelKo: "냄새 맡고 한참 후 먹는다", labelEn: "Sniffs and eats after a while", value: 1 },
  },
  {
    id: "other_sn_2",
    axis: "SN",
    questionKo: "케이지 안 새 장식물을 넣으면?",
    questionEn: "When new décor is added to the cage?",
    optionA: { labelKo: "즉시 올라가거나 탐색한다", labelEn: "Climbs on or explores it immediately", value: 0 },
    optionB: { labelKo: "한동안 거리를 두고 지켜본다", labelEn: "Keeps distance and watches for a while", value: 1 },
  },
  {
    id: "other_tf_1",
    axis: "TF",
    questionKo: "보호자 손이 가까워지면?",
    questionEn: "When your hand comes close?",
    optionA: { labelKo: "혀를 내밀거나 고개를 돌린다", labelEn: "Flicks tongue or turns head toward you", value: 0 },
    optionB: { labelKo: "반응 없이 그냥 있는다", labelEn: "Stays still with no reaction", value: 1 },
  },
  {
    id: "other_tf_2",
    axis: "TF",
    questionKo: "핸들링 도중 불편하면?",
    questionEn: "When uncomfortable during handling?",
    optionA: { labelKo: "몸을 비틀거나 도망치려 한다", labelEn: "Wriggles or tries to escape", value: 0 },
    optionB: { labelKo: "굳어서 가만히 버틴다", labelEn: "Goes stiff and holds still", value: 1 },
  },
  {
    id: "other_tf_3",
    axis: "TF",
    questionKo: "먹이를 눈앞에 두면?",
    questionEn: "When food is placed in front of them?",
    optionA: { labelKo: "흥분해서 혀를 빠르게 날름거린다", labelEn: "Gets excited and flicks tongue rapidly", value: 0 },
    optionB: { labelKo: "천천히 다가가 침착하게 먹는다", labelEn: "Approaches slowly and eats calmly", value: 1 },
  },
  {
    id: "other_jp_1",
    axis: "JP",
    questionKo: "케이지 안에서 이동 패턴이?",
    questionEn: "Movement pattern inside the cage?",
    optionA: { labelKo: "매번 같은 루트로 다닌다", labelEn: "Follows the same route each time", value: 0 },
    optionB: { labelKo: "매번 다른 곳을 탐색한다", labelEn: "Explores a different spot each time", value: 1 },
  },
  {
    id: "other_jp_2",
    axis: "JP",
    questionKo: "먹이 급여 시간이 바뀌면?",
    questionEn: "When feeding time changes?",
    optionA: { labelKo: "평소 시간에 앞으로 나와 기다린다", labelEn: "Comes forward at the usual time and waits", value: 0 },
    optionB: { labelKo: "별 반응 없이 줄 때 먹는다", labelEn: "Eats when food is given with little reaction", value: 1 },
  },
];

const QUESTIONS_BY_SPECIES: Record<Species, MbtiQuestionRaw[]> = {
  dog: DOG_QUESTIONS,
  cat: CAT_QUESTIONS,
  other: OTHER_QUESTIONS,
};

export function getQuestionsBySpecies(species: Species, locale: "ko" | "en" = "ko"): MbtiQuestion[] {
  return QUESTIONS_BY_SPECIES[species].map((q) => localizeQuestion(q, locale));
}
