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

const DOG_QUESTIONS: MbtiQuestion[] = [
  {
    id: "dog_ei_1",
    axis: "EI",
    question: "산책 중 낯선 개를 만나면?",
    optionA: { label: "먼저 달려가 인사한다", value: 0 },
    optionB: { label: "주인 뒤에 숨거나 경계한다", value: 1 },
  },
  {
    id: "dog_ei_2",
    axis: "EI",
    question: "집에 손님이 오면?",
    optionA: { label: "온 집을 뛰어다니며 환영한다", value: 0 },
    optionB: { label: "구석에서 지켜보다 천천히 다가간다", value: 1 },
  },
  {
    id: "dog_ei_3",
    axis: "EI",
    question: "혼자 집에 남겨지면?",
    optionA: { label: "낑낑대거나 짖으며 불안해한다", value: 0 },
    optionB: { label: "조용히 자리 잡고 잠든다", value: 1 },
  },
  {
    id: "dog_sn_1",
    axis: "SN",
    question: "새 장난감을 줬을 때?",
    optionA: { label: "바로 물고 신나게 흔든다", value: 0 },
    optionB: { label: "냄새 맡고 한참 관찰 후 접근한다", value: 1 },
  },
  {
    id: "dog_sn_2",
    axis: "SN",
    question: "산책 루트를 바꾸면?",
    optionA: { label: "새 냄새를 맡느라 신이 난다", value: 0 },
    optionB: { label: "어리둥절하며 원래 방향을 보려 한다", value: 1 },
  },
  {
    id: "dog_tf_1",
    axis: "TF",
    question: "보호자가 슬퍼 보이면?",
    optionA: { label: "옆에 딱 붙어서 핥아준다", value: 0 },
    optionB: { label: "평소와 다름없이 행동한다", value: 1 },
  },
  {
    id: "dog_tf_2",
    axis: "TF",
    question: "간식을 주지 않으면?",
    optionA: { label: "눈을 반짝이며 애교를 부린다", value: 0 },
    optionB: { label: "잠시 쳐다보다 그냥 돌아간다", value: 1 },
  },
  {
    id: "dog_tf_3",
    axis: "TF",
    question: "다른 개가 자기 장난감을 가져가면?",
    optionA: { label: "바로 쫓아가 되찾아온다", value: 0 },
    optionB: { label: "멍하니 바라보다 다른 걸 찾는다", value: 1 },
  },
  {
    id: "dog_jp_1",
    axis: "JP",
    question: "밥 시간이 됐을 때?",
    optionA: { label: "정해진 자리에서 얌전히 기다린다", value: 0 },
    optionB: { label: "주방을 왔다갔다 어슬렁거린다", value: 1 },
  },
  {
    id: "dog_jp_2",
    axis: "JP",
    question: "산책 준비를 하면?",
    optionA: { label: "리드줄 채우는 동안 얌전히 선다", value: 0 },
    optionB: { label: "흥분해서 뱅뱅 돌며 난리친다", value: 1 },
  },
];

const CAT_QUESTIONS: MbtiQuestion[] = [
  {
    id: "cat_ei_1",
    axis: "EI",
    question: "보호자가 소파에 앉으면?",
    optionA: { label: "바로 와서 올라앉는다", value: 0 },
    optionB: { label: "근처에 있지만 거리를 유지한다", value: 1 },
  },
  {
    id: "cat_ei_2",
    axis: "EI",
    question: "낯선 방문객이 오면?",
    optionA: { label: "먼저 다가가 냄새를 맡는다", value: 0 },
    optionB: { label: "숨거나 높은 곳에서 내려다본다", value: 1 },
  },
  {
    id: "cat_ei_3",
    axis: "EI",
    question: "보호자가 다른 방에 있으면?",
    optionA: { label: "따라가서 옆에 있는다", value: 0 },
    optionB: { label: "자기 자리에서 혼자 논다", value: 1 },
  },
  {
    id: "cat_sn_1",
    axis: "SN",
    question: "새 물건이 집에 생기면?",
    optionA: { label: "즉시 올라가거나 들어간다", value: 0 },
    optionB: { label: "멀리서 오래 바라보다 나중에 접근한다", value: 1 },
  },
  {
    id: "cat_sn_2",
    axis: "SN",
    question: "창밖을 볼 때 주로 반응하는 건?",
    optionA: { label: "새나 벌레 등 움직이는 것", value: 0 },
    optionB: { label: "바람에 흔들리는 나뭇잎 같은 것", value: 1 },
  },
  {
    id: "cat_tf_1",
    axis: "TF",
    question: "배가 고플 때?",
    optionA: { label: "야옹거리며 발로 툭툭 건드린다", value: 0 },
    optionB: { label: "조용히 밥그릇 앞에 앉아 응시한다", value: 1 },
  },
  {
    id: "cat_tf_2",
    axis: "TF",
    question: "보호자가 아파서 누워있으면?",
    optionA: { label: "배 위에 올라와 꾹꾹이를 한다", value: 0 },
    optionB: { label: "평소와 다름없이 혼자 논다", value: 1 },
  },
  {
    id: "cat_tf_3",
    axis: "TF",
    question: "혼나거나 제지당하면?",
    optionA: { label: "야옹거리거나 더 부비적댄다", value: 0 },
    optionB: { label: "못마땅한 표정으로 자리를 피한다", value: 1 },
  },
  {
    id: "cat_jp_1",
    axis: "JP",
    question: "사냥 놀이를 할 때?",
    optionA: { label: "패턴 파악 후 기다렸다 정확히 낚아챈다", value: 0 },
    optionB: { label: "즉흥적으로 이리저리 뛰어다닌다", value: 1 },
  },
  {
    id: "cat_jp_2",
    axis: "JP",
    question: "하루 루틴이 바뀌면?",
    optionA: { label: "불안해하거나 울부짖는다", value: 0 },
    optionB: { label: "별 신경 안 쓰고 적응한다", value: 1 },
  },
];

const OTHER_QUESTIONS: MbtiQuestion[] = [
  {
    id: "other_ei_1",
    axis: "EI",
    question: "핸들링을 하면?",
    optionA: { label: "손 위를 자유롭게 돌아다닌다", value: 0 },
    optionB: { label: "가만히 있거나 숨으려 한다", value: 1 },
  },
  {
    id: "other_ei_2",
    axis: "EI",
    question: "케이지 문을 열면?",
    optionA: { label: "스스로 나오려고 한다", value: 0 },
    optionB: { label: "안쪽으로 들어가거나 숨는다", value: 1 },
  },
  {
    id: "other_ei_3",
    axis: "EI",
    question: "보호자가 케이지 앞에 서면?",
    optionA: { label: "앞으로 나와 관찰한다", value: 0 },
    optionB: { label: "반응 없이 제자리에 있는다", value: 1 },
  },
  {
    id: "other_sn_1",
    axis: "SN",
    question: "새로운 먹이를 줬을 때?",
    optionA: { label: "바로 공격적으로 덤빈다", value: 0 },
    optionB: { label: "냄새 맡고 한참 후 먹는다", value: 1 },
  },
  {
    id: "other_sn_2",
    axis: "SN",
    question: "케이지 안 새 장식물을 넣으면?",
    optionA: { label: "즉시 올라가거나 탐색한다", value: 0 },
    optionB: { label: "한동안 거리를 두고 지켜본다", value: 1 },
  },
  {
    id: "other_tf_1",
    axis: "TF",
    question: "보호자 손이 가까워지면?",
    optionA: { label: "혀를 내밀거나 고개를 돌린다", value: 0 },
    optionB: { label: "반응 없이 그냥 있는다", value: 1 },
  },
  {
    id: "other_tf_2",
    axis: "TF",
    question: "핸들링 도중 불편하면?",
    optionA: { label: "몸을 비틀거나 도망치려 한다", value: 0 },
    optionB: { label: "굳어서 가만히 버틴다", value: 1 },
  },
  {
    id: "other_tf_3",
    axis: "TF",
    question: "먹이를 눈앞에 두면?",
    optionA: { label: "흥분해서 혀를 빠르게 날름거린다", value: 0 },
    optionB: { label: "천천히 다가가 침착하게 먹는다", value: 1 },
  },
  {
    id: "other_jp_1",
    axis: "JP",
    question: "케이지 안에서 이동 패턴이?",
    optionA: { label: "매번 같은 루트로 다닌다", value: 0 },
    optionB: { label: "매번 다른 곳을 탐색한다", value: 1 },
  },
  {
    id: "other_jp_2",
    axis: "JP",
    question: "먹이 급여 시간이 바뀌면?",
    optionA: { label: "평소 시간에 앞으로 나와 기다린다", value: 0 },
    optionB: { label: "별 반응 없이 줄 때 먹는다", value: 1 },
  },
];

const QUESTIONS_BY_SPECIES: Record<Species, MbtiQuestion[]> = {
  dog: DOG_QUESTIONS,
  cat: CAT_QUESTIONS,
  other: OTHER_QUESTIONS,
};

export function getQuestionsBySpecies(species: Species): MbtiQuestion[] {
  return QUESTIONS_BY_SPECIES[species];
}
