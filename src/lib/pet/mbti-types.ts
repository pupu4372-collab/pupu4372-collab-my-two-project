export type MbtiTypeData = {
  type: string;
  titleKo: string;
  descKo: string;
};

const MBTI_TYPES: MbtiTypeData[] = [
  {
    type: "ENFP",
    titleKo: "온 세상이 놀이터형",
    descKo: "에너지 넘치고 매일 새로운 걸 찾아다녀요",
  },
  {
    type: "ENFJ",
    titleKo: "우리 집 분위기 메이커형",
    descKo: "보호자 기분을 귀신같이 알아채는 공감 천재",
  },
  {
    type: "ENTP",
    titleKo: "규칙 따위는 없다형",
    descKo: "호기심 폭발, 매번 새로운 방식으로 사고쳐요",
  },
  {
    type: "ENTJ",
    titleKo: "내가 이 집 실세형",
    descKo: "당당하고 목표지향적, 원하는 건 반드시 얻어냄",
  },
  {
    type: "INFP",
    titleKo: "예민하고 섬세한 감수성형",
    descKo: "혼자만의 시간을 사랑하는 조용한 몽상가",
  },
  {
    type: "INFJ",
    titleKo: "말 없이 다 아는 신비형",
    descKo: "보호자의 감정을 누구보다 먼저 느껴요",
  },
  {
    type: "INTP",
    titleKo: "혼자가 제일 편한 철학자형",
    descKo: "관찰하고 분석하는 걸 좋아하는 조용한 천재",
  },
  {
    type: "INTJ",
    titleKo: "계획대로만 살고 싶은 전략가형",
    descKo: "루틴을 사랑하고 낯선 것엔 쉽게 마음 안 열어요",
  },
  {
    type: "ESFP",
    titleKo: "지금 이 순간이 전부형",
    descKo: "신나고 즉흥적, 항상 파티 분위기를 만들어요",
  },
  {
    type: "ESFJ",
    titleKo: "사랑받고 싶은 막내형",
    descKo: "보호자 눈치를 잘 보고 칭찬에 온몸으로 반응해요",
  },
  {
    type: "ESTP",
    titleKo: "일단 저지르고 보는 행동파형",
    descKo: "생각보다 몸이 먼저 움직이는 에너지 덩어리",
  },
  {
    type: "ESTJ",
    titleKo: "우리 집 규칙은 내가 정해형",
    descKo: "질서를 중요시하고 자기 영역에 분명한 선을 그어요",
  },
  {
    type: "ISFP",
    titleKo: "조용히 당신 곁에 있을게형",
    descKo: "말은 없지만 늘 가까이서 온기를 나눠줘요",
  },
  {
    type: "ISFJ",
    titleKo: "한결같이 믿음직한 수호자형",
    descKo: "변화를 싫어하고 가족에게 한없이 헌신해요",
  },
  {
    type: "ISTP",
    titleKo: "건드리지 않으면 나도 안 건드려형",
    descKo: "독립적이고 자기 페이스가 확실한 쿨가이",
  },
  {
    type: "ISTJ",
    titleKo: "하루도 빠짐없이 루틴 지킴이형",
    descKo: "정해진 시간, 정해진 자리, 정해진 행동이 최고예요",
  },
];

const MBTI_TYPE_BY_CODE = new Map(MBTI_TYPES.map((entry) => [entry.type, entry]));

export function getMbtiTypeData(type: string): MbtiTypeData | undefined {
  return MBTI_TYPE_BY_CODE.get(type.toUpperCase());
}
