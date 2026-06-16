export type SajuTrainingElement = "mok" | "hwa" | "to" | "geum" | "su";

export type SajuTrainingDetail = {
  eyebrow: string;
  title: string;
  intro: string;
  fitCards: readonly { title: string; subtitle: string }[];
  routineTitle: string;
  steps: readonly {
    title: string;
    body: string;
    meta: readonly string[];
  }[];
  checklistTitle: string;
  checklist: readonly string[];
  caution: string;
};

export const SAJU_TRAINING_CARDS = [
  {
    element: "mok",
    icon: "木",
    ko: "Mok(木) 산책 훈련",
    en: "Mok walk training",
    koDesc: "호기심 많은 아이를 위한 야외 탐험형 산책 루틴. 새로운 코스·냄새 탐색으로 목 기운의 확장성을 풀어줘요.",
    enDesc: "An exploratory outdoor walk routine for curious dogs, using new routes and scent discovery to channel Mok energy.",
    koActions: ["신규 코스 탐험", "자유 탐색 시간"],
    enActions: ["New route walk", "Free sniff time"],
    koDetail: {
      eyebrow: "Mok(木) 기운 훈련",
      title: "호기심 많은 아이를 위한 야외 탐험 산책",
      intro:
        "목(木)은 뻗어나가고 확장하는 기운이에요. 새로운 자극에 끌리는 우리 아이의 호기심을 억누르지 않고, 안전하게 풀어주는 산책 루틴으로 정서적 만족감을 채워줘요.",
      fitCards: [
        { title: "목 부족", subtitle: "사주 오행상" },
        { title: "호기심형", subtitle: "성향 유형" },
        { title: "실내 답답", subtitle: "평소 신호" },
      ],
      routineTitle: "3단계 훈련 루틴",
      steps: [
        {
          title: "탐험 루트 변경",
          body:
            "매주 산책 코스를 한 군데씩 바꿔주세요. 같은 길보다 낯선 길에서 목 기운의 확장성이 더 활발하게 풀려요. 처음엔 익숙한 길의 작은 골목 하나만 바꿔보는 것으로 시작해요.",
          meta: ["주 1회 이상", "전체 산책의 일부 구간"],
        },
        {
          title: "자유 탐색 타임",
          body:
            "목적지 없이 아이가 원하는 방향으로 5분간 따라가 주세요. 냄새를 충분히 맡고 멈춰서 관찰하는 시간을 허용하면, 목 기운의 욕구가 자연스럽게 해소돼요.",
          meta: ["매 산책 5분", "리드줄 느슨하게"],
        },
        {
          title: "낯선 공간 노출",
          body:
            "한 달에 한 번은 완전히 새로운 장소를 방문해요. 새 환경 적응력이 길러지면서 평소 산책에서도 더 안정적이고 즐거운 태도를 보이게 돼요.",
          meta: ["월 1회", "새로운 장소"],
        },
      ],
      checklistTitle: "훈련 전 체크리스트",
      checklist: [
        "기초 명령어(이리와, 기다려)가 어느 정도 가능한 상태인가요?",
        "리드줄·하네스가 몸에 잘 맞고 편안한가요?",
        "예방접종·심장사상충 약을 정기적으로 챙기고 있나요?",
        "날씨·기온·지면 온도가 산책에 적합한가요?",
      ],
      caution:
        "분리불안이나 큰 소리에 예민한 아이는 새로운 장소를 천천히, 짧게부터 시작해주세요. 목 기운 훈련은 확장이 목적이지만, 무리한 노출은 오히려 불안감을 키울 수 있어요.",
    },
    enDetail: {
      eyebrow: "Mok(木) energy training",
      title: "Outdoor exploration walks for curious dogs",
      intro:
        "Mok(木) is the energy of growth and expansion. This walking routine lets your dog's curiosity unfold safely instead of holding it back, helping them feel emotionally satisfied.",
      fitCards: [
        { title: "Low Mok", subtitle: "Element balance" },
        { title: "Curious type", subtitle: "Temperament" },
        { title: "Indoor restlessness", subtitle: "Daily signal" },
      ],
      routineTitle: "3-step training routine",
      steps: [
        {
          title: "Change the exploration route",
          body:
            "Switch one walking route each week. Mok energy opens up more naturally on unfamiliar paths than on the same familiar road. Start small by changing just one short side street.",
          meta: ["At least once a week", "Part of the walk"],
        },
        {
          title: "Free sniffing time",
          body:
            "Follow your dog for five minutes without a fixed destination. Letting them sniff, pause, and observe helps their Mok needs unwind naturally.",
          meta: ["5 minutes per walk", "Loose leash"],
        },
        {
          title: "New place exposure",
          body:
            "Visit a completely new place once a month. As your dog adapts to new environments, regular walks can become calmer and more enjoyable too.",
          meta: ["Once a month", "New location"],
        },
      ],
      checklistTitle: "Before training",
      checklist: [
        "Can your dog respond to basic cues like come and wait?",
        "Does the leash or harness fit comfortably?",
        "Are vaccines and heartworm prevention up to date?",
        "Are the weather, temperature, and ground conditions safe for a walk?",
      ],
      caution:
        "For dogs with separation anxiety or sound sensitivity, introduce new places slowly and briefly. Mok training is about expansion, but too much exposure can increase anxiety.",
    },
  },
  {
    element: "hwa",
    icon: "火",
    ko: "Hwa(火) 진정 마사지",
    en: "Hwa calming massage",
    koDesc: "표현과 에너지가 큰 아이를 위한 차분한 터치 루틴. 흥분도를 낮추고 정서적 안정을 찾는 손길 가이드예요.",
    enDesc: "A gentle touch routine for expressive, high-energy dogs that helps lower arousal and rebuild emotional calm.",
    koActions: ["귀 뒤 천천히 쓰다듬기", "저음 톤 말걸기"],
    enActions: ["Slow ear rubs", "Low-tone praise"],
    koDetail: {
      eyebrow: "Hwa(火) 기운 훈련",
      title: "표현이 큰 아이를 위한 차분한 터치 가이드",
      intro:
        "화(火)는 솟아오르고 표현하는 기운이에요. 감정과 에너지가 크게 드러나는 우리 아이에게 억지로 멈추라고 하기보다, 천천히 가라앉히는 손길로 마음의 온도를 함께 낮춰줘요.",
      fitCards: [
        { title: "화 과다", subtitle: "사주 오행상" },
        { title: "표현형", subtitle: "성향 유형" },
        { title: "흥분 잦음", subtitle: "평소 신호" },
      ],
      routineTitle: "3단계 진정 터치법",
      steps: [
        {
          title: "귀 뒤·목덜미 천천히 쓰다듬기",
          body:
            "손바닥 전체로 귀 뒤부터 목덜미까지 느린 속도로 쓸어내려 주세요. 빠른 손길은 오히려 흥분을 키우니, 1회에 3초 이상 걸리는 속도를 유지해요.",
          meta: ["2~3분 반복", "손바닥 전체 사용"],
        },
        {
          title: "저음 톤으로 말 걸기",
          body:
            "평소보다 낮고 느린 목소리로 이름이나 짧은 단어를 반복해서 들려주세요. 높고 빠른 톤은 화 기운을 자극하니, 의식적으로 톤을 낮추는 것이 핵심이에요.",
          meta: ["낮은 톤 유지", "짧은 단어 반복"],
        },
        {
          title: "흥분 직후 침묵 타임",
          body:
            "놀이가 산책 직후 바로 다음 활동으로 넘어가지 말고, 5분간 조용히 함께 앉아있는 시간을 가져요. 에너지가 자연스럽게 가라앉을 여유를 주는 것이 목적이에요.",
          meta: ["활동 직후 5분", "조용한 공간"],
        },
      ],
      checklistTitle: "훈련 전 체크리스트",
      checklist: [
        "아이가 만지는 것을 거부하지 않고 편안해하는 상태인가요?",
        "마사지할 공간이 조용하고 방해 요소가 적은가요?",
        "최근 다친 곳이나 아픈 부위가 없는지 확인했나요?",
      ],
      caution:
        "지나친 흥분이 공격성을 동반하는 경우(이빨 보임, 으르렁거림)에는 직접 만지지 말고 거리를 둔 채 목소리로만 진정시켜 주세요. 평소와 다르게 과도한 흥분이 반복되면 건강 문제일 수 있어 수의사 상담을 권해요.",
    },
    enDetail: {
      eyebrow: "Hwa(火) energy training",
      title: "A calming touch guide for expressive dogs",
      intro:
        "Hwa(火) is the energy of rising expression. For dogs whose emotions and energy show strongly, this routine helps lower their emotional temperature with slow, gentle touch instead of forcing them to stop.",
      fitCards: [
        { title: "High Hwa", subtitle: "Element balance" },
        { title: "Expressive type", subtitle: "Temperament" },
        { title: "Frequent arousal", subtitle: "Daily signal" },
      ],
      routineTitle: "3-step calming touch routine",
      steps: [
        {
          title: "Slowly stroke behind the ears and neck",
          body:
            "Use your whole palm to stroke slowly from behind the ears down to the neck. Fast hands can raise excitement, so keep each stroke at least three seconds long.",
          meta: ["Repeat for 2-3 minutes", "Use the whole palm"],
        },
        {
          title: "Speak in a low tone",
          body:
            "Repeat your dog's name or a short word in a lower, slower voice than usual. High, quick tones can stimulate Hwa energy, so lowering your voice is the key.",
          meta: ["Keep a low tone", "Repeat short words"],
        },
        {
          title: "Quiet time after excitement",
          body:
            "After play or a walk, avoid jumping straight into the next activity. Sit together quietly for five minutes so their energy has room to settle naturally.",
          meta: ["5 minutes after activity", "Quiet space"],
        },
      ],
      checklistTitle: "Before training",
      checklist: [
        "Is your dog comfortable being touched right now?",
        "Is the massage space quiet with few distractions?",
        "Have you checked for recent injuries or painful areas?",
      ],
      caution:
        "If intense arousal includes aggression such as showing teeth or growling, do not touch directly. Keep distance and use your voice only. If unusual over-arousal repeats, consult a veterinarian.",
    },
  },
  {
    element: "su",
    icon: "水",
    ko: "Su(水) 안정감",
    en: "Su calm stability",
    koDesc: "불안이 많은 아이를 위한 환경·루틴 솔루션. 예측 가능한 패턴으로 마음의 물결을 잔잔하게 만들어줘요.",
    enDesc: "An environment and routine guide for anxious dogs, using predictable patterns to make emotional waves calmer.",
    koActions: ["고정 루틴 만들기", "안심 담요·소리"],
    enActions: ["Fixed routine", "Comfort blanket"],
    koDetail: {
      eyebrow: "Su(水) 기운 훈련",
      title: "불안이 많은 아이를 위한 안정감 솔루션",
      intro:
        "수(水)는 흐르고 스며드는 기운이에요. 작은 변화에도 마음이 출렁이는 우리 아이에게, 예측 가능한 패턴을 만들어주면 흐름이 잔잔해지고 안심하게 돼요.",
      fitCards: [
        { title: "수 과다", subtitle: "사주 오행상" },
        { title: "예민형", subtitle: "성향 유형" },
        { title: "분리불안", subtitle: "평소 신호" },
      ],
      routineTitle: "3단계 안정감 루틴",
      steps: [
        {
          title: "고정 루틴 만들기",
          body:
            "밥·산책·취침 시간을 매일 같은 시간으로 맞춰주세요. 시간이 일정해질수록 “다음에 무슨 일이 생길지” 미리 알게 되어 불안이 줄어들어요.",
          meta: ["매일 동일 시작", "최소 2주 유지"],
        },
        {
          title: "안심 담요·소리 활용",
          body:
            "평소 자주 사용하는 담요나 인형을 정해두고, 불안한 순간마다 같은 것을 제공해 주세요. 화이트노이즈나 익숙한 음악도 안정감을 더해줘요.",
          meta: ["고정 물건 사용", "일정한 배경음"],
        },
        {
          title: "분리 전후 동일한 인사 패턴",
          body:
            "외출 전과 귀가 후 항상 같은 말과 행동으로 인사해 주세요. “다녀올게, 곧 돌아와”처럼 짧고 일정한 문장을 반복하면 분리 자체가 예측 가능한 일상이 돼요.",
          meta: ["매번 동일 문구", "차분한 톤 유지"],
        },
      ],
      checklistTitle: "훈련 전 체크리스트",
      checklist: [
        "최근 환경 변화(이사, 가족 변화 등)가 있었는지 확인했나요?",
        "안심 물건(담요·인형)을 미리 정해뒀나요?",
        "가족 모두가 같은 루틴·인사 패턴을 지킬 수 있나요?",
      ],
      caution:
        "2주 이상 루틴을 유지해도 불안 신호가 줄지 않거나 식욕 저하·구토가 동반된다면, 행동 문제보다 건강 문제일 수 있어 수의사 상담을 먼저 받아보는 것이 좋아요.",
    },
    enDetail: {
      eyebrow: "Su(水) energy training",
      title: "A stability routine for anxious dogs",
      intro:
        "Su(水) is the energy of flowing and absorbing. For dogs whose emotions ripple with small changes, predictable patterns help the flow settle and make them feel safe.",
      fitCards: [
        { title: "High Su", subtitle: "Element balance" },
        { title: "Sensitive type", subtitle: "Temperament" },
        { title: "Separation anxiety", subtitle: "Daily signal" },
      ],
      routineTitle: "3-step stability routine",
      steps: [
        {
          title: "Create a fixed routine",
          body:
            "Keep meals, walks, and bedtime at the same time each day. The more predictable the day becomes, the less your dog has to worry about what comes next.",
          meta: ["Same start daily", "Keep for at least 2 weeks"],
        },
        {
          title: "Use a comfort blanket or sound",
          body:
            "Choose a familiar blanket or toy and offer it during anxious moments. White noise or familiar music can also add a steady sense of safety.",
          meta: ["Use a fixed comfort item", "Consistent background sound"],
        },
        {
          title: "Repeat the same greeting pattern",
          body:
            "Before leaving and after returning, use the same words and behavior. Short phrases like 'I'll be back soon' help departures become predictable.",
          meta: ["Same phrase each time", "Keep a calm tone"],
        },
      ],
      checklistTitle: "Before training",
      checklist: [
        "Have there been recent changes at home, such as moving or family changes?",
        "Have you chosen a comfort item such as a blanket or toy?",
        "Can everyone in the family follow the same routine and greeting pattern?",
      ],
      caution:
        "If anxiety signs do not improve after two weeks of routine, or if appetite loss or vomiting appears, consult a veterinarian first because health issues may be involved.",
    },
  },
  {
    element: "to",
    icon: "土",
    ko: "To(土) 포용력",
    en: "To grounded warmth",
    koDesc: "사회성을 기르는 그룹 훈련. 다른 친구·사람과 함께하는 경험으로 안정된 포용력을 단계적으로 넓혀가요.",
    enDesc: "A gradual social routine that builds grounded warmth through calm experiences with other dogs and people.",
    koActions: ["소그룹 산책 모임", "단계별 합사 훈련"],
    enActions: ["Small group walks", "Step-by-step socializing"],
    koDetail: {
      eyebrow: "To(土) 기운 훈련",
      title: "사회성을 기르는 그룹 훈련",
      intro:
        "토(土)는 품고 다지는 기운이에요. 낯선 친구나 사람을 만났을 때 경계가 강한 우리 아이에게, 단계적인 만남으로 안정된 포용력을 천천히 넓혀줘요.",
      fitCards: [
        { title: "토 부족", subtitle: "사주 오행상" },
        { title: "경계형", subtitle: "성향 유형" },
        { title: "낯가림", subtitle: "평소 신호" },
      ],
      routineTitle: "3단계 사회성 그룹 훈련",
      steps: [
        {
          title: "소그룹 산책 모임",
          body:
            "한두 마리의 친한 친구와 함께 짧게 걷는 시간부터 시작해요. 직접 마주 보게 하지 않고, 같은 방향으로 나란히 걷는 것만으로도 또 기운의 포용력이 자연스럽게 길러져요.",
          meta: ["주 1~2회", "1~2마리부터"],
        },
        {
          title: "단계별 합사·대면 훈련",
          body:
            "처음 만남은 5분 이내로 짧게, 거리를 두고 시작해요. 편안해 보이면 시간을 조금씩 늘리고, 긴장 신호가 보이면 바로 거리를 다시 벌려요.",
          meta: ["첫 만남 5분", "점진적 확대"],
        },
        {
          title: "낯선 사람에게 천천히 다가가기",
          body:
            "새로운 사람이 먼저 다가오지 않고 가만히 서 있는 상태에서, 아이가 스스로 냄새를 맡으러 다가가도록 기다려 주세요. 주도권을 아이에게 줄수록 경계심이 빠르게 풀려요.",
          meta: ["사람은 가만히", "아이가 먼저"],
        },
      ],
      checklistTitle: "훈련 전 체크리스트",
      checklist: [
        "함께할 친구·사람이 안전하고 차분한 성향인가요?",
        "언제든 거리를 벌릴 수 있는 열린 공간인가요?",
        "아이가 배고프거나 피곤하지 않은 상태인가요?",
      ],
      caution:
        "으르렁거림이나 이빨을 보이는 반응이 나오면 즉시 거리를 벌리고 훈련을 멈춰주세요. 무리한 합사는 관계를 더 나쁘게 만들 수 있어요. 천천히가 핵심이에요.",
    },
    enDetail: {
      eyebrow: "To(土) energy training",
      title: "Group training that builds social warmth",
      intro:
        "To(土) is the energy of grounding and holding. For dogs who become guarded around unfamiliar dogs or people, gradual meetings help expand stable social warmth.",
      fitCards: [
        { title: "Low To", subtitle: "Element balance" },
        { title: "Guarded type", subtitle: "Temperament" },
        { title: "Shy with strangers", subtitle: "Daily signal" },
      ],
      routineTitle: "3-step social group routine",
      steps: [
        {
          title: "Small group walk",
          body:
            "Start with a short walk beside one or two calm dog friends. They do not need to face each other directly. Walking in the same direction can naturally build To-style acceptance.",
          meta: ["1-2 times a week", "Start with 1-2 dogs"],
        },
        {
          title: "Step-by-step meeting practice",
          body:
            "Keep first meetings under five minutes and begin with distance. If your dog looks comfortable, extend time slowly. If tension appears, create distance again right away.",
          meta: ["5-minute first meeting", "Gradual expansion"],
        },
        {
          title: "Approach new people slowly",
          body:
            "Ask the new person to stand still instead of approaching first. Wait for your dog to choose to sniff and move closer. Giving your dog control helps guarded feelings soften faster.",
          meta: ["Person stays still", "Dog approaches first"],
        },
      ],
      checklistTitle: "Before training",
      checklist: [
        "Is the friend or person calm and safe to practice with?",
        "Is the space open enough to create distance anytime?",
        "Is your dog neither hungry nor overly tired?",
      ],
      caution:
        "If growling or teeth showing appears, create distance immediately and stop training. Forced socializing can make relationships worse. Slow progress is the key.",
    },
  },
  {
    element: "geum",
    icon: "金",
    ko: "Geum(金) 규칙",
    en: "Geum clear structure",
    koDesc: "단호하고 명확한 신호 교육. 일관된 명령어와 타이밍으로 기준을 분명히 세우는 훈련 체계예요.",
    enDesc: "Clear cue training built on consistent words and timing, giving structured dogs a reliable standard to follow.",
    koActions: ["명확한 한 단어 명령", "일관된 타이밍"],
    enActions: ["One-word cues", "Consistent timing"],
    koDetail: {
      eyebrow: "Geum(金) 기운 훈련",
      title: "기준을 세우는 명확한 신호 훈련",
      intro:
        "금(金)은 정리하고 구분하는 기운이에요. 기준이 흐릿하면 고집이 세지거나 혼란스러워지는 아이에게, 짧고 일관된 신호로 무엇을 하면 되는지 분명하게 알려줘요.",
      fitCards: [
        { title: "금 부족", subtitle: "사주 오행상" },
        { title: "규칙형", subtitle: "성향 유형" },
        { title: "지시 혼란", subtitle: "평소 신호" },
      ],
      routineTitle: "3단계 명확한 신호 훈련",
      steps: [
        {
          title: "한 단어 명령어 정하기",
          body:
            "앉아, 기다려, 이리와처럼 짧은 한 단어 명령어를 정하고 가족 모두 같은 표현을 사용해요. 말이 길어질수록 기준이 흐려지니, 한 행동에는 한 단어만 연결해 주세요.",
          meta: ["한 행동 한 단어", "가족 표현 통일"],
        },
        {
          title: "보상 타이밍 고정하기",
          body:
            "아이가 원하는 행동을 한 바로 그 순간에 칭찬과 보상을 주세요. 2~3초만 늦어도 어떤 행동이 맞았는지 헷갈릴 수 있어요. 금 기운 훈련은 정확한 타이밍이 핵심이에요.",
          meta: ["즉시 칭찬", "2초 안 보상"],
        },
        {
          title: "짧은 반복 루틴 만들기",
          body:
            "하루 한 번 길게 하기보다, 3분씩 짧게 반복하는 편이 좋아요. 같은 순서로 시작하고 끝내면 아이가 훈련의 경계를 이해하고 더 차분하게 따라올 수 있어요.",
          meta: ["하루 3분", "같은 시작·끝"],
        },
      ],
      checklistTitle: "훈련 전 체크리스트",
      checklist: [
        "가족 모두 같은 명령어를 쓰기로 정했나요?",
        "보상 간식이나 칭찬 타이밍을 바로 줄 수 있나요?",
        "아이가 너무 흥분하거나 지친 상태는 아닌가요?",
        "훈련할 공간에 장난감·소음 같은 방해 요소가 적은가요?",
      ],
      caution:
        "금 기운 훈련은 명확함이 중요하지만, 큰 소리나 반복된 꾸중은 아이를 위축시킬 수 있어요. 틀렸을 때 혼내기보다 잠깐 멈추고, 다시 짧은 신호로 성공할 기회를 주세요.",
    },
    enDetail: {
      eyebrow: "Geum(金) energy training",
      title: "Clear cue training that sets reliable standards",
      intro:
        "Geum(金) is the energy of structure and distinction. For dogs who become stubborn or confused when expectations are unclear, short and consistent cues show exactly what to do.",
      fitCards: [
        { title: "Low Geum", subtitle: "Element balance" },
        { title: "Rule-oriented type", subtitle: "Temperament" },
        { title: "Cue confusion", subtitle: "Daily signal" },
      ],
      routineTitle: "3-step clear cue routine",
      steps: [
        {
          title: "Choose one-word cues",
          body:
            "Use short one-word cues such as sit, wait, and come, and make sure everyone in the family uses the same words. The longer the phrase, the blurrier the standard becomes.",
          meta: ["One cue per behavior", "Family cue consistency"],
        },
        {
          title: "Fix the reward timing",
          body:
            "Give praise and reward at the exact moment your dog performs the desired behavior. Even a delay of two or three seconds can make the correct action unclear.",
          meta: ["Praise immediately", "Reward within 2 seconds"],
        },
        {
          title: "Create short repetition routines",
          body:
            "Instead of one long session, repeat brief three-minute practices. Starting and ending in the same order helps your dog understand the boundary of training.",
          meta: ["3 minutes daily", "Same start and finish"],
        },
      ],
      checklistTitle: "Before training",
      checklist: [
        "Has everyone agreed to use the same cue words?",
        "Can you reward or praise immediately?",
        "Is your dog not overly excited or tired?",
        "Is the space free from toys, noise, and other distractions?",
      ],
      caution:
        "Geum training needs clarity, but loud voices or repeated scolding can make dogs shrink back. Instead of punishing mistakes, pause briefly and give another chance with a short cue.",
    },
  },
] as const satisfies ReadonlyArray<{
  element: SajuTrainingElement;
  icon: string;
  ko: string;
  en: string;
  koDesc: string;
  enDesc: string;
  koActions: readonly string[];
  enActions: readonly string[];
  koDetail?: SajuTrainingDetail;
  enDetail?: SajuTrainingDetail;
}>;

export function getSajuTrainingCard(element: string) {
  return SAJU_TRAINING_CARDS.find((card) => card.element === element);
}
