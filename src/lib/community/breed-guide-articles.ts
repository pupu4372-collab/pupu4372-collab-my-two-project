export interface BreedGuideArticleSection {
  heading: string;
  children?: string[];
  body?: string[];
}

export interface LocalizedBreedGuideArticle {
  title: string;
  summary: string;
  sections: BreedGuideArticleSection[];
  closing: string[];
}

export interface BreedGuideArticle {
  breedSlug: string;
  slug: string;
  ko: LocalizedBreedGuideArticle;
  en: LocalizedBreedGuideArticle;
}

function outlineSection(koHeading: string, koChildren: string[], enHeading: string, enChildren: string[]) {
  return {
    ko: { heading: koHeading, children: koChildren },
    en: { heading: enHeading, children: enChildren },
  };
}

function createOutlineArticle(input: {
  breedSlug: string;
  slug: string;
  koTitle: string;
  enTitle: string;
  koSummary: string;
  enSummary: string;
  sections: ReturnType<typeof outlineSection>[];
  koSectionBodies?: string[][];
  enSectionBodies?: string[][];
  koClosing?: string[];
  enClosing?: string[];
}): BreedGuideArticle {
  return {
    breedSlug: input.breedSlug,
    slug: input.slug,
    ko: {
      title: input.koTitle,
      summary: input.koSummary,
      sections: input.sections.map((section, index) => ({
        ...section.ko,
        body: input.koSectionBodies?.[index],
      })),
      closing: input.koClosing ?? [],
    },
    en: {
      title: input.enTitle,
      summary: input.enSummary,
      sections: input.sections.map((section, index) => ({
        ...section.en,
        body: input.enSectionBodies?.[index],
      })),
      closing: input.enClosing ?? [],
    },
  };
}

const REPTILE_COMMON_SECTIONS = [
  outlineSection(
    "자주 묻는 질문",
    ["집에서 관리해도 괜찮은 경우", "병원에 바로 가야 하는 경우"],
    "Frequently Asked Questions",
    ["When home care may be enough", "When to visit a vet immediately"],
  ),
  outlineSection(
    "우리 아이 성향도 함께 확인해보세요",
    ["이 품종 사주 보기", "오늘의 운세 확인하기", "같은 고민의 보호자 글 보기"],
    "Check Your Pet's Temperament Too",
    ["View this breed's K-Saju", "Check today's fortune", "Read posts from owners with similar concerns"],
  ),
];

function createReptileOutlineArticle(input: Parameters<typeof createOutlineArticle>[0]) {
  return createOutlineArticle({
    ...input,
    sections: [...input.sections, ...REPTILE_COMMON_SECTIONS],
  });
}

export const BREED_GUIDE_ARTICLES: BreedGuideArticle[] = [
  {
    breedSlug: "maltese",
    slug: "tear-stain-care",
    ko: {
      title: "말티즈 눈물자국 원인과 관리법",
      summary:
        "하얀 털 때문에 더 도드라져 보이는 말티즈 눈물자국의 원인, 집에서 할 수 있는 관리 루틴, 병원 확인이 필요한 신호를 정리했어요.",
      sections: [
        {
          heading: "말티즈 눈물자국이 잘 생기는 이유",
          children: ["눈 구조와 털 특성", "식이·알레르기 영향", "눈 자극과 생활환경 문제"],
          body: [
            "말티즈는 하얀 털 때문에 작은 눈물 자국도 더 도드라져 보이는 품종입니다. 특히 눈 주변 털이 길거나 눈물이 자주 고이는 구조라면 갈색 착색이 쉽게 생길 수 있습니다.",
            "눈 주변 털이 눈을 찌르거나 먼지, 건조함 같은 환경 자극이 원인이 되기도 합니다. 일부 아이들은 식이 변화나 알레르기 반응과 함께 눈물이 늘어나는 경우도 있어요.",
          ],
        },
        {
          heading: "이런 증상이 보이면 더 주의하세요",
          children: ["눈곱 증가", "냄새와 붉은 착색", "눈 비빔과 충혈"],
          body: [
            "겉으로는 단순 미용 문제처럼 보여도, 경우에 따라 눈 자극이나 염증 신호일 수 있습니다. 평소보다 눈곱이 많아지거나 한쪽 눈만 유독 심하다면 단순 착색보다 다른 원인을 먼저 의심해봐야 합니다.",
          ],
        },
        {
          heading: "집에서 관리하는 방법",
          children: ["눈 주변 털 정리", "세정 루틴 만들기", "사료와 간식 점검"],
          body: [
            "가장 기본은 눈 주변을 매일 부드럽게 닦아주는 습관입니다. 젖은 털을 오래 방치하면 착색과 냄새가 심해질 수 있으므로, 세정 후에는 물기가 남지 않게 관리하는 것이 좋습니다.",
            "눈 주변 털이 길다면 미용으로 자극을 줄이고, 최근 사료나 간식을 바꿨다면 식이 변화도 함께 점검해보세요.",
          ],
        },
        {
          heading: "병원에 가야 하는 경우",
          children: ["노란 분비물이 있을 때", "한쪽 눈만 심할 때", "통증 반응이 있을 때"],
          body: [
            "눈물자국과 함께 충혈, 노란 분비물, 통증 반응, 한쪽 눈만 심한 증상이 보인다면 진료가 필요합니다. 단순 착색과 눈 질환은 겉으로 비슷해 보여도 대응이 다를 수 있기 때문입니다.",
          ],
        },
        {
          heading: "보호자가 자주 묻는 질문",
          children: ["눈물자국은 완전히 없어질까", "사료만 바꿔도 좋아질까"],
          body: [
            "말티즈 눈물자국은 꾸준한 관리로 완화되는 경우가 많지만, 갑자기 심해졌다면 원인부터 확인하는 것이 우선입니다.",
          ],
        },
      ],
      closing: [
        "우리 아이 성향도 함께 보고 싶다면, 말티즈 사주 보기와 오늘의 운세 콘텐츠로 생활 루틴을 함께 점검해보세요.",
        "개체마다 차이가 있으므로 건강 이상이 의심되면 수의사 상담을 권합니다.",
      ],
    },
    en: {
      title: "Maltese Tear Stains: Causes and Care",
      summary:
        "A practical guide to why Maltese tear stains show up, how to build a gentle home-care routine, and when a vet check is safer.",
      sections: [
        {
          heading: "Why Maltese Dogs Often Get Tear Stains",
          children: ["Eye shape and coat traits", "Diet and allergy influence", "Eye irritation and home environment"],
          body: [
            "Because Maltese dogs have bright white coats, even mild tear staining can stand out. Long hair around the eyes or a face shape that lets tears sit near the coat can make brown staining more noticeable.",
            "Tear stains can come from several overlapping causes, including hair rubbing the eye, dust, dry air, diet changes, or allergy-like reactions.",
          ],
        },
        {
          heading: "Signs That Need Extra Attention",
          children: ["More eye discharge", "Odor and reddish staining", "Rubbing and redness"],
          body: [
            "What looks like a cosmetic issue can sometimes be a sign of irritation or inflammation. If discharge suddenly increases or one eye is much worse than the other, look beyond simple staining.",
          ],
        },
        {
          heading: "How to Manage Tear Stains at Home",
          children: ["Trim hair around the eyes", "Build a cleaning routine", "Review food and treats"],
          body: [
            "The basic routine is gentle daily cleaning around the eyes. After cleaning, keep the area dry so moisture does not sit in the coat and worsen staining or odor.",
            "If the hair around the eyes is long, grooming may reduce irritation. If food or treats recently changed, review whether the timing matches the increase in tearing.",
          ],
        },
        {
          heading: "When to Visit the Vet",
          children: ["Yellow discharge", "Only one eye is severe", "Signs of pain"],
          body: [
            "A vet check is recommended when tear staining appears with redness, yellow discharge, pain, or one-sided symptoms. Eye disease and simple staining can look similar from the outside but require different care.",
          ],
        },
        {
          heading: "Common Questions",
          children: ["Can tear stains disappear completely?", "Can changing food alone help?"],
          body: [
            "Consistent care can often reduce Maltese tear stains, but sudden or severe changes should be checked from the cause first.",
          ],
        },
      ],
      closing: [
        "If you also want to understand your pet's temperament and daily rhythm, connect this care routine with Maltese K-Saju and today's fortune content.",
        "Every pet is different. Please consult a veterinarian if you notice concerning health changes.",
      ],
    },
  },
  {
    breedSlug: "maltese",
    slug: "patellar-luxation",
    ko: {
      title: "말티즈 슬개골 탈구 증상과 예방법",
      summary:
        "소형견 말티즈에게 자주 언급되는 슬개골 탈구의 초기 신호, 생활환경 관리, 병원 진료가 필요한 상황을 정리했어요.",
      sections: [
        {
          heading: "말티즈가 슬개골 탈구에 취약한 이유",
          children: ["소형견 체형 특성", "유전적 요인", "미끄러운 바닥과 생활습관"],
          body: [
            "말티즈처럼 체구가 작은 소형견은 무릎 관절에 부담이 쌓이기 쉬워 슬개골 탈구 이야기가 자주 나옵니다.",
            "특히 점프가 잦거나, 미끄러운 바닥에서 생활하거나, 체중 관리가 잘 되지 않으면 위험이 더 커질 수 있습니다.",
          ],
        },
        {
          heading: "초기 증상 체크리스트",
          children: ["다리를 들고 걷기", "갑자기 깽깽 뛰기", "산책 중 주저앉기"],
          body: [
            "초기에는 항상 아파 보이지 않을 수 있습니다. 대신 갑자기 한쪽 다리를 들고 걷거나, 몇 걸음 깽깽 뛰다가 다시 멀쩡하게 걷는 행동이 반복될 수 있습니다.",
            "산책 중 주저앉거나 소파에서 뛰어내린 뒤 움직임이 달라졌다면 관찰이 필요합니다.",
          ],
        },
        {
          heading: "집에서 할 수 있는 예방 관리",
          children: ["바닥 환경 개선", "체중 관리", "무리한 점프 줄이기"],
          body: [
            "가장 먼저 바닥 환경을 점검하세요. 미끄러운 마룻바닥은 무릎에 부담을 줄 수 있으므로 매트나 러그를 활용하는 것이 좋습니다.",
            "점프 습관을 줄이고, 침대나 소파 옆에 계단이나 발판을 두는 것도 도움이 됩니다. 무엇보다 체중이 늘지 않도록 식사량과 간식을 조절해야 합니다.",
          ],
        },
        {
          heading: "악화되기 쉬운 상황",
          children: ["비만인 경우", "계단 사용이 잦을 때", "운동량이 불균형할 때"],
          body: [
            "무리한 산책이나 반복적인 점프놀이가 항상 좋은 것은 아닙니다. 운동은 필요하지만, 관절에 부담이 적은 방식으로 꾸준히 하는 것이 중요합니다.",
            "가끔 그래서 괜찮겠지 하고 넘기면 만성화될 수 있어 반복되는 신호를 기록해두는 편이 좋아요.",
          ],
        },
        {
          heading: "병원 진료가 필요한 신호",
          children: ["반복적인 절뚝거림", "통증 반응", "보행 이상 지속"],
          body: [
            "절뚝거림이 자주 반복되거나, 다리를 만질 때 싫어하거나, 평소보다 활동량이 뚜렷하게 줄었다면 진료를 권합니다.",
          ],
        },
      ],
      closing: [
        "말티즈 슬개골 탈구는 조기에 관리할수록 일상 불편을 줄이는 데 도움이 됩니다.",
        "성향과 생활 루틴까지 함께 보고 싶다면, 말티즈 맞춤 사주 콘텐츠와 연결해보세요.",
      ],
    },
    en: {
      title: "Maltese Patellar Luxation: Signs and Prevention",
      summary:
        "A Maltese care guide covering early warning signs, safer home setup, weight control, and when limping should be checked by a vet.",
      sections: [
        {
          heading: "Why Maltese Dogs Are Prone to Patellar Luxation",
          children: ["Small-dog body structure", "Genetic factors", "Slippery floors and daily habits"],
          body: [
            "Small dogs like Maltese can place repeated stress on the knee joint, so patellar luxation is a common topic for this breed.",
            "Frequent jumping, slippery floors, and poor weight control may increase the risk or make symptoms more noticeable.",
          ],
        },
        {
          heading: "Early Signs to Watch For",
          children: ["Holding one leg up", "Sudden skipping steps", "Sitting down during walks"],
          body: [
            "Early signs do not always look like constant pain. A Maltese may suddenly hold one rear leg up, skip for a few steps, then walk normally again.",
            "If your dog sits down during a walk or moves differently after jumping off a sofa, watch the pattern closely.",
          ],
        },
        {
          heading: "Prevention You Can Start at Home",
          children: ["Improve floor traction", "Manage weight", "Reduce hard jumping"],
          body: [
            "Start with the floor. Slippery wood or tile can strain the knees, so mats or rugs can help create safer walking paths.",
            "Reduce jumping from beds and sofas by using steps or ramps. Keep meals and treats measured so extra weight does not add more joint stress.",
          ],
        },
        {
          heading: "Situations That Can Make It Worse",
          children: ["Weight gain", "Frequent stairs", "Unbalanced exercise"],
          body: [
            "More exercise is not always better when the knee is irritated. Keep activity steady and joint-friendly rather than relying on rough jumping games or sudden bursts.",
            "Do not dismiss repeated skipping as harmless just because it happens only sometimes. Patterns can become chronic.",
          ],
        },
        {
          heading: "When Vet Care Is Needed",
          children: ["Repeated limping", "Pain response", "Ongoing gait changes"],
          body: [
            "A vet visit is recommended when limping repeats, your dog dislikes having the leg touched, or activity level clearly drops from normal.",
          ],
        },
      ],
      closing: [
        "Early management can reduce daily discomfort for Maltese dogs with patellar luxation risk.",
        "If you want to connect temperament and daily routine as well, pair this care guide with Maltese K-Saju content.",
      ],
    },
  },
  createOutlineArticle({
    breedSlug: "pomeranian",
    slug: "tear-stain-causes",
    koTitle: "포메라니안 눈물자국 원인 5가지와 관리 팁",
    enTitle: "Pomeranian Tear Stains: 5 Causes and Care Tips",
    koSummary: "포메라니안 눈물자국의 주요 원인, 이상 신호, 생활 속 관리법과 병원 확인이 필요한 경우를 정리했어요.",
    enSummary: "A guide to common Pomeranian tear-stain causes, warning signs, daily care, and when a vet check is needed.",
    sections: [
      outlineSection("포메라니안 눈물자국의 주요 원인", ["털 자극", "눈물량 증가", "알레르기와 식이 문제"], "Common Causes of Pomeranian Tear Stains", ["Coat irritation", "Increased tearing", "Allergies and diet issues"]),
      outlineSection("꼭 확인해야 할 이상 신호", ["눈 주변 냄새", "붉은 눈물 얼룩", "눈을 자주 비비는 행동"], "Warning Signs to Check", ["Odor around the eyes", "Reddish tear stains", "Frequent eye rubbing"]),
      outlineSection("생활 속 관리 방법", ["매일 닦아주는 방법", "털 길이와 위생 관리", "물·사료 점검 포인트"], "Daily Care Tips", ["How to wipe daily", "Coat length and hygiene", "Water and food checkpoints"]),
      outlineSection("잘못된 관리 습관", ["자극적인 세정제 사용", "원인 확인 없이 사료만 교체", "장기간 방치"], "Care Habits to Avoid", ["Harsh cleansers", "Changing food without checking causes", "Leaving it untreated for too long"]),
      outlineSection("병원에 가야 하는 경우", ["충혈이 심할 때", "눈곱 색이 진할 때", "갑자기 악화될 때"], "When to Visit the Vet", ["Severe redness", "Dark or unusual discharge", "Sudden worsening"]),
    ],
    koSectionBodies: [
      [
        "포메라니안은 풍성한 털과 동그란 눈매 때문에 눈 주변 관리가 특히 중요합니다. 눈물자국은 외관상 지저분해 보이는 문제를 넘어서, 지속되면 냄새나 피부 자극으로 이어질 수 있습니다.",
        "대표적으로는 눈 주변 털 자극, 환경 자극, 눈물량 증가, 식이 변화, 알레르기 반응 등을 생각해볼 수 있습니다. 갑자기 심해졌다면 최근 바뀐 간식, 사료, 미용 스타일, 생활 공간의 먼지나 건조함도 함께 살펴보는 것이 좋습니다.",
      ],
      [
        "눈 주변 냄새가 나거나 붉은 눈물 얼룩이 갑자기 진해지고, 눈을 자주 비비는 행동이 늘었다면 단순 착색보다 눈 자극을 먼저 확인해보세요.",
      ],
      [
        "눈 주변은 매일 부드럽게 닦아주고, 젖은 털이 오래 남지 않게 관리하세요. 털이 눈을 찌르지 않도록 얼굴 미용을 점검하는 것도 중요합니다. 식이와 수분 섭취를 함께 살펴보면 도움이 되는 경우가 많습니다.",
      ],
      [
        "눈물자국이 보인다고 해서 강하게 문지르거나, 자극적인 제품을 쓰는 것은 오히려 피부를 예민하게 만들 수 있습니다. 또 원인 확인 없이 제품만 계속 바꾸는 것도 비효율적입니다.",
      ],
      [
        "충혈, 찡그림, 노란 눈곱, 한쪽 눈만 심한 증상은 단순 눈물자국이 아닐 수 있습니다. 이런 경우에는 검진이 우선입니다.",
      ],
    ],
    enSectionBodies: [
      [
        "Pomeranians need careful eye-area care because of their full coat and round eyes. Tear stains are not only a cosmetic issue; when they persist, they can lead to odor or skin irritation.",
        "Common causes include hair rubbing around the eyes, environmental irritation, increased tearing, diet changes, and allergy-like reactions. If the staining suddenly worsens, also review recent treats, food, grooming style, dust, and dryness at home.",
      ],
      [
        "If odor develops around the eyes, reddish staining deepens, or your dog rubs the eyes more often, check for irritation rather than treating it as simple discoloration.",
      ],
      [
        "Gently wipe the eye area every day and keep damp hair from staying wet too long. Grooming around the face can reduce hair irritation, and reviewing diet and hydration may also help.",
      ],
      [
        "Rubbing hard or using harsh products can make the skin more sensitive. Repeatedly changing products without checking the cause is usually inefficient too.",
      ],
      [
        "Redness, squinting, yellow discharge, or symptoms that affect only one eye may be more than tear staining. A vet check should come first in those cases.",
      ],
    ],
    koClosing: [
      "포메라니안 눈물자국은 매일의 작은 관리가 차이를 만듭니다.",
      "우리 아이의 성향과 케어 포인트를 더 알고 싶다면, 포메라니안 사주 보기로 이어질 수 있습니다.",
    ],
    enClosing: [
      "Small daily care habits can make a meaningful difference for Pomeranian tear stains.",
      "If you want to understand your pet's temperament and care points more deeply, continue with Pomeranian K-Saju content.",
    ],
  }),
  createOutlineArticle({
    breedSlug: "pomeranian",
    slug: "separation-anxiety-training",
    koTitle: "포메라니안 분리불안 증상과 훈련법",
    enTitle: "Pomeranian Separation Anxiety: Signs and Training",
    koSummary: "포메라니안 분리불안이 생기는 이유, 대표 증상, 집에서 시작하는 완화 훈련과 전문가 도움이 필요한 경우를 정리했어요.",
    enSummary: "A guide to Pomeranian separation anxiety causes, common signs, home training, and when expert help is needed.",
    sections: [
      outlineSection("포메라니안이 분리불안을 보이는 이유", ["보호자 의존 성향", "생활 리듬 변화", "혼자 있는 경험 부족"], "Why Pomeranians Show Separation Anxiety", ["Attachment to the owner", "Changes in daily rhythm", "Limited experience being alone"]),
      outlineSection("대표적인 분리불안 증상", ["보호자 외출 시 짖음", "배변 실수", "파괴 행동과 불안 행동"], "Common Separation Anxiety Signs", ["Barking when the owner leaves", "Potty accidents", "Destructive or anxious behavior"]),
      outlineSection("집에서 시작하는 완화 훈련", ["짧은 외출부터 연습", "독립 시간 늘리기", "보상 루틴 만들기"], "Home Training to Ease Anxiety", ["Practice short departures", "Increase independent time", "Build a reward routine"]),
      outlineSection("피해야 할 대응 방식", ["과한 인사와 작별", "불안 행동 즉시 안아주기", "갑작스러운 장시간 외출"], "Responses to Avoid", ["Overly emotional greetings and goodbyes", "Immediately picking up anxious dogs", "Sudden long absences"]),
      outlineSection("전문가 도움이 필요한 경우", ["자해 수준의 불안", "이웃 민원 수준의 짖음", "훈련 후에도 악화되는 경우"], "When Professional Help Is Needed", ["Self-harm level anxiety", "Barking that causes neighbor complaints", "Worsening despite training"]),
    ],
    koSectionBodies: [
      [
        "포메라니안은 보호자와의 유대가 강한 경우가 많아 혼자 있는 시간을 힘들어할 수 있습니다. 외출 준비만 해도 짖거나, 문 앞을 맴돌거나, 혼자 두면 배변 실수를 하는 행동이 반복된다면 분리불안을 의심해볼 수 있습니다.",
      ],
      [
        "보호자가 나가면 과하게 짖거나 낑낑거리고, 집안을 어지럽히거나 물건을 망가뜨리는 행동이 나타날 수 있습니다. 심한 경우 침 흘림, 호흡 가빠짐, 문 앞에서 장시간 기다리는 모습도 보입니다.",
      ],
      [
        "가장 중요한 것은 혼자 있는 시간을 아주 짧게부터 연습하는 것입니다. 1~2분 단위로 시작해 천천히 시간을 늘려보세요.",
        "외출과 귀가를 지나치게 큰 이벤트처럼 만들지 않는 것도 중요합니다. 장난감이나 노즈워크 도구를 활용해 혼자 있는 시간이 꼭 나쁜 시간만은 아니라는 경험을 만들어주는 방식이 좋습니다.",
      ],
      [
        "짖는다고 바로 돌아오거나, 불안 행동을 할 때마다 즉시 안아주는 방식은 오히려 의존을 강화할 수 있습니다. 또 갑자기 긴 시간 혼자 두는 방식은 개선보다 악화를 부르기 쉽습니다.",
      ],
      [
        "불안이 심해 자해 행동을 하거나, 짖음이 너무 심해 일상생활에 지장을 줄 정도라면 전문 상담이 필요할 수 있습니다.",
      ],
    ],
    enSectionBodies: [
      [
        "Pomeranians often form a strong bond with their owner, so being alone can feel difficult. If your dog barks during departure prep, circles near the door, or has accidents when left alone, separation anxiety may be involved.",
      ],
      [
        "Common signs include excessive barking or whining after the owner leaves, making a mess, or damaging objects. In more severe cases, drooling, fast breathing, or waiting by the door for a long time can appear.",
      ],
      [
        "Start by practicing very short alone periods. Begin with one or two minutes and increase slowly.",
        "Avoid making departures and returns into big emotional events. Toys or nose-work tools can help your dog learn that alone time is not always negative.",
      ],
      [
        "Returning immediately every time your dog barks, or picking them up whenever they show anxiety, can reinforce dependence. Suddenly leaving for long periods can also make the problem worse.",
      ],
      [
        "Professional help may be needed if anxiety leads to self-harm, barking severely disrupts daily life, or symptoms worsen despite training.",
      ],
    ],
    koClosing: [
      "포메라니안 분리불안은 “버릇”보다 “불안”의 관점에서 접근해야 합니다.",
      "우리 아이의 타고난 성향과 생활 궁합을 함께 보고 싶다면, 포메라니안 성향 분석 콘텐츠로 연결해보세요.",
    ],
    enClosing: [
      "Pomeranian separation anxiety is better approached as anxiety, not simply bad behavior.",
      "If you want to understand natural temperament and home-life compatibility, continue with Pomeranian temperament content.",
    ],
  }),
  createOutlineArticle({
    breedSlug: "poodle",
    slug: "otitis-ear-cleaning",
    koTitle: "푸들 외이염 증상과 귀 청소법",
    enTitle: "Poodle Ear Infections: Signs and Ear Cleaning",
    koSummary: "푸들이 외이염에 취약한 이유, 의심 증상, 귀 청소 주기와 병원 진료가 필요한 상황을 정리했어요.",
    enSummary: "A Poodle guide to ear infection risks, signs, safe cleaning routines, and when vet care is needed.",
    sections: [
      outlineSection("푸들이 외이염에 취약한 이유", ["귀 구조와 털", "습기와 통풍 부족", "목욕 후 관리 부족"], "Why Poodles Are Prone to Ear Infections", ["Ear shape and hair", "Moisture and poor airflow", "Lack of after-bath care"]),
      outlineSection("외이염 의심 증상", ["귀 냄새", "머리 흔들기", "귀 긁기와 붉어짐"], "Signs of Ear Infection", ["Ear odor", "Head shaking", "Scratching and redness"]),
      outlineSection("집에서 하는 귀 관리", ["올바른 귀 청소 주기", "청소 시 주의점", "목욕 후 건조 방법"], "Ear Care at Home", ["Proper cleaning frequency", "Cleaning precautions", "Drying after baths"]),
      outlineSection("악화시키는 행동", ["면봉 깊숙이 사용", "젖은 상태 방치", "냄새를 가볍게 넘기기"], "Habits That Can Make It Worse", ["Using cotton swabs too deeply", "Leaving ears wet", "Ignoring odor"]),
      outlineSection("병원 진료가 필요한 상황", ["진물이나 출혈", "통증 반응", "반복 재발"], "When Vet Care Is Needed", ["Discharge or bleeding", "Pain response", "Repeated recurrence"]),
    ],
    koSectionBodies: [
      [
        "푸들은 귀 주변 털이 많고, 귀 안 통풍이 잘 안 되는 편이라 습기가 차기 쉬운 환경이 만들어질 수 있습니다. 그래서 외이염 관련 고민이 자주 나오는 편입니다.",
      ],
      [
        "귀에서 냄새가 나거나, 고개를 자주 흔들거나, 귀를 긁는 행동이 반복되면 외이염을 의심할 수 있습니다. 귀 안이 붉어 보이거나 만지기 싫어하면 불편함이 커진 상태일 수 있습니다.",
      ],
      [
        "귀 청소는 너무 자주 하기보다, 아이 상태에 맞는 주기로 부드럽게 해주는 것이 좋습니다. 목욕 후에는 귀 주변이 축축하게 남지 않도록 신경 써야 하며, 청소 시에는 자극을 최소화해야 합니다.",
      ],
      [
        "면봉을 깊숙이 넣거나, 냄새가 나는데도 며칠 더 지켜보자는 식으로 방치하는 것은 좋지 않습니다. 외이염은 초기에 관리할수록 부담이 적은 경우가 많습니다.",
      ],
      [
        "진물, 출혈, 심한 통증 반응, 반복 재발이 있다면 집에서만 해결하려 하지 말고 진료를 받아야 합니다.",
      ],
    ],
    enSectionBodies: [
      [
        "Poodles often have plenty of hair around the ears, and airflow inside the ear can be limited. This can create a moist environment, which is why ear infection concerns are common.",
      ],
      [
        "Ear odor, frequent head shaking, or repeated scratching can suggest an ear infection. If the ear looks red or your dog dislikes having it touched, the discomfort may already be significant.",
      ],
      [
        "Ear cleaning should be gentle and matched to your dog's condition rather than done too often. After baths, keep the ear area from staying damp and minimize irritation during cleaning.",
      ],
      [
        "Avoid pushing cotton swabs deep into the ear or ignoring odor for several more days. Ear infections are often easier to manage when addressed early.",
      ],
      [
        "Discharge, bleeding, strong pain response, or repeated recurrence should be checked by a vet rather than handled only at home.",
      ],
    ],
    koClosing: [
      "푸들 귀 관리는 목욕만큼이나 중요한 일상 케어입니다.",
      "푸들의 성향과 생활 관리 포인트가 궁금하다면, 품종 맞춤 사주 콘텐츠와 함께 보세요.",
    ],
    enClosing: [
      "Poodle ear care is as important as bathing in daily care.",
      "If you want to understand temperament and lifestyle care points, pair this with breed-based K-Saju content.",
    ],
  }),
  createOutlineArticle({
    breedSlug: "poodle",
    slug: "itchy-skin-checklist",
    koTitle: "푸들 피부 가려움 원인과 관리 체크리스트",
    enTitle: "Poodle Itchy Skin: Causes and Care Checklist",
    koSummary: "푸들이 자주 가려워하는 원인, 함께 봐야 할 증상, 집에서 점검할 항목과 관리 방법을 정리했어요.",
    enSummary: "A checklist for Poodle itchy-skin causes, related symptoms, home checks, care steps, and vet warning signs.",
    sections: [
      outlineSection("푸들이 자주 가려워하는 이유", ["알레르기", "건조한 피부", "외부 기생충과 자극"], "Why Poodles Often Itch", ["Allergies", "Dry skin", "External parasites and irritation"]),
      outlineSection("가려움과 함께 보는 증상", ["핥기와 긁기", "붉은 반점", "비듬과 탈모"], "Symptoms to Check with Itching", ["Licking and scratching", "Red spots", "Dandruff and hair loss"]),
      outlineSection("집에서 점검할 항목", ["최근 바뀐 사료", "샴푸와 세제", "산책 환경 변화"], "Home Checklist", ["Recently changed food", "Shampoo and detergents", "Changes in walking environment"]),
      outlineSection("관리 방법", ["목욕 주기 조절", "보습과 피부 보호", "알레르기 유발 요소 줄이기"], "Care Methods", ["Adjust bathing frequency", "Moisturize and protect skin", "Reduce allergy triggers"]),
      outlineSection("병원에 가야 하는 신호", ["상처가 날 정도로 긁을 때", "냄새가 심할 때", "반복적으로 재발할 때"], "Signs You Should Visit the Vet", ["Scratching until wounds form", "Strong odor", "Repeated recurrence"]),
    ],
    koSectionBodies: [
      [
        "푸들은 피부가 예민한 편이라 보호자들이 가려움 문제를 자주 호소합니다. 단순 건조함일 수도 있지만, 알레르기나 외부 자극, 피부염 신호일 수도 있어 원인 구분이 중요합니다.",
        "가장 많이 떠올리는 것은 알레르기입니다. 최근 바뀐 사료, 간식, 샴푸, 세제, 산책 환경 같은 변화가 원인이 될 수 있습니다. 건조한 계절이나 목욕 후 보습 부족도 영향을 줄 수 있습니다.",
      ],
      [
        "가려움과 함께 발을 핥거나, 귀 주변을 긁거나, 배나 겨드랑이가 붉어지는지 살펴보세요. 비듬이 늘거나 털이 듬성듬성 빠진다면 피부 부담이 커졌다는 신호일 수 있습니다.",
      ],
      [
        "무엇이 바뀌었는지 먼저 기록해보는 것이 좋습니다. 최근 급여한 음식, 목욕 주기, 산책 장소, 사용하는 제품을 하나씩 점검하세요.",
      ],
      [
        "목욕을 너무 자주 하거나 자극적인 제품을 쓰는 습관은 줄이고, 피부가 건조해지지 않게 관리하는 것이 중요합니다.",
      ],
      [
        "긁어서 상처가 나거나, 냄새가 나거나, 밤에도 계속 가려워 잠을 설친다면 진료가 필요합니다.",
      ],
    ],
    enSectionBodies: [
      [
        "Poodles can have sensitive skin, so owners often notice itching concerns. It may be simple dryness, but allergies, external irritation, or dermatitis can also be involved.",
        "Allergies are a common possibility. Recent changes in food, treats, shampoo, detergent, or walking environment can be clues. Dry seasons and lack of moisture care after bathing can also contribute.",
      ],
      [
        "Watch for paw licking, scratching around the ears, or redness on the belly and armpits. More dandruff or patchy hair loss can signal increased skin stress.",
      ],
      [
        "Start by recording what changed. Review recent foods, bath frequency, walking locations, and products one by one.",
      ],
      [
        "Reduce overly frequent bathing and harsh products, and focus on preventing the skin from becoming too dry.",
      ],
      [
        "Vet care is needed if scratching causes wounds, odor develops, or your dog keeps itching at night and cannot rest.",
      ],
    ],
    koClosing: [
      "푸들 피부 가려움은 “피부만의 문제”가 아니라 생활 전반의 신호일 수 있습니다.",
      "푸들의 타고난 성향과 케어 포인트도 함께 알고 싶다면, 사주 기반 성향 콘텐츠를 참고해보세요.",
    ],
    enClosing: [
      "Poodle itching may be a signal from the whole daily routine, not only the skin.",
      "If you want to understand natural temperament and care points too, continue with K-Saju based temperament content.",
    ],
  }),
  createOutlineArticle({
    breedSlug: "maltipoo",
    slug: "skin-allergy-care",
    koTitle: "말티푸 피부 알레르기 증상과 관리법",
    enTitle: "Maltipoo Skin Allergies: Signs and Care",
    koSummary: "말티푸 피부 알레르기의 주요 원인, 흔한 증상, 집에서 관리하는 법과 진료가 필요한 경우를 정리했어요.",
    enSummary: "A Maltipoo guide to skin allergy causes, common signs, home care, recurrence tips, and when vet care is needed.",
    sections: [
      outlineSection("말티푸 피부 알레르기의 주요 원인", ["식이 알레르기", "환경 알레르기", "피부 장벽 약화"], "Common Causes of Maltipoo Skin Allergies", ["Food allergies", "Environmental allergies", "Weakened skin barrier"]),
      outlineSection("흔히 나타나는 증상", ["발 핥기", "귀 주변 가려움", "배와 겨드랑이 붉어짐"], "Common Signs", ["Paw licking", "Itching around the ears", "Redness on belly and armpits"]),
      outlineSection("집에서 관리하는 법", ["알레르기 유발 식품 점검", "침구와 생활공간 위생", "순한 목욕 루틴"], "Home Care", ["Review allergy-trigger foods", "Keep bedding and living space clean", "Use a gentle bathing routine"]),
      outlineSection("재발을 줄이는 팁", ["증상 일지 작성", "계절별 관리", "간식 선택 기준"], "Tips to Reduce Recurrence", ["Keep a symptom diary", "Seasonal care", "Treat selection standards"]),
      outlineSection("진료가 필요한 경우", ["귀 염증 동반", "피부가 진물날 때", "밤에도 계속 긁을 때"], "When Vet Care Is Needed", ["Ear inflammation together", "Oozing skin", "Scratching through the night"]),
    ],
    koSectionBodies: [
      [
        "말티푸는 많은 보호자들이 피부 예민함을 먼저 떠올리는 품종 중 하나입니다. 피부 알레르기는 단순 가려움으로 끝나지 않고, 귀 문제나 발 핥기, 붉은 피부로 이어질 수 있어 일상 관리가 중요합니다.",
        "피부 알레르기는 식이, 환경, 접촉 자극 등 다양한 이유로 나타날 수 있습니다. 그래서 “무조건 이 제품이 좋다”보다, 최근에 바뀐 요소를 추적하는 것이 더 중요합니다.",
      ],
      [
        "발을 자주 핥거나, 귀 주변을 긁거나, 배와 겨드랑이가 붉어지는 경우가 흔합니다. 털이 숱이 줄어 보이거나 피부가 거칠어 보일 수도 있습니다. 증상이 계절 따라 심해지거나 특정 음식 후 반복된다면 단서가 될 수 있습니다.",
      ],
      [
        "사료, 간식, 세제, 산책 환경, 침구 관리 등을 함께 살펴보세요. 침구와 생활공간을 청결하게 유지하고, 자극이 적은 목욕 루틴을 만드는 것이 기본입니다.",
      ],
      [
        "간식 종류가 많다면 한동안 단순화해 보는 것도 방법입니다. 증상 기록을 남기면 원인 추적에 도움이 됩니다.",
      ],
      [
        "피부가 진물나거나, 귀 염증이 같이 오거나, 밤에도 가려워 잠을 못 잘 정도라면 진료가 필요합니다.",
      ],
    ],
    enSectionBodies: [
      [
        "Many owners think of Maltipoos as a breed that can have sensitive skin. Skin allergies may go beyond simple itching and lead to ear issues, paw licking, or red skin, so daily management matters.",
        "Skin allergies can come from food, environment, or contact irritation. Rather than assuming one product is best, track what recently changed.",
      ],
      [
        "Frequent paw licking, scratching around the ears, and redness on the belly or armpits are common. The coat may look thinner or the skin may feel rough. Seasonal worsening or repeated symptoms after certain foods can be important clues.",
      ],
      [
        "Review food, treats, detergent, walking environment, and bedding care together. Keeping bedding and living space clean and using a gentle bathing routine are basic steps.",
      ],
      [
        "If your dog eats many different treats, simplifying them for a while can help. A symptom diary makes it easier to trace possible causes.",
      ],
      [
        "Vet care is needed if the skin oozes, ear inflammation appears together, or itching continues through the night and prevents sleep.",
      ],
    ],
    koClosing: [
      "말티푸 피부 알레르기는 꾸준한 관찰과 기록이 관리의 핵심입니다.",
      "말티푸의 성향과 생활 패턴까지 함께 보고 싶다면, 사주 기반 케어 콘텐츠로 연결해보세요.",
    ],
    enClosing: [
      "Consistent observation and records are central to managing Maltipoo skin allergies.",
      "If you want to understand temperament and daily patterns too, continue with K-Saju based care content.",
    ],
  }),
  createOutlineArticle({
    breedSlug: "bichon-frise",
    slug: "tear-stain-care",
    koTitle: "비숑프리제 눈물자국 관리법과 원인 정리",
    enTitle: "Bichon Frise Tear Stains: Causes and Care",
    koSummary: "비숑프리제 눈물자국이 두드러지는 이유, 확인해야 할 증상, 관리 루틴과 병원 검사가 필요한 경우를 정리했어요.",
    enSummary: "A Bichon Frise guide to tear-stain causes, symptoms to check, daily care routines, and vet-check signals.",
    sections: [
      outlineSection("비숑프리제 눈물자국이 두드러지는 이유", ["하얀 털 특성", "눈물량과 자극", "생활 습관 영향"], "Why Tear Stains Stand Out in Bichon Frise Dogs", ["White coat traits", "Tear volume and irritation", "Lifestyle influence"]),
      outlineSection("확인해야 할 증상", ["털 변색", "냄새", "눈곱과 충혈"], "Symptoms to Check", ["Coat discoloration", "Odor", "Discharge and redness"]),
      outlineSection("관리 루틴 만들기", ["세정 빈도", "털 정리 포인트", "식이와 수분 관리"], "Building a Care Routine", ["Cleaning frequency", "Coat-trimming points", "Diet and hydration care"]),
      outlineSection("보호자가 실수하기 쉬운 부분", ["과도한 문지르기", "눈 전용이 아닌 제품 사용", "원인 없이 미용만 반복"], "Common Owner Mistakes", ["Rubbing too hard", "Using non-eye products", "Repeating grooming without checking causes"]),
      outlineSection("병원 검사가 필요한 경우", ["한쪽 눈만 심할 때", "분비물이 누렇거나 초록빛일 때", "갑자기 눈을 잘 못 뜰 때"], "When a Vet Exam Is Needed", ["Only one eye is severe", "Yellow or greenish discharge", "Suddenly having trouble opening the eye"]),
    ],
    koSectionBodies: [
      [
        "비숑프리제는 밝은 털색 덕분에 눈물자국이 더 쉽게 보입니다. 그래서 실제 눈물 양이 비슷해도 다른 품종보다 더 심해 보일 수 있습니다.",
        "하지만 단순히 보기 싫은 문제로 넘기기보다는, 눈 주변 자극이나 위생 상태를 함께 살펴야 합니다. 눈 주변 털이 자극을 주거나, 눈물이 자주 고이거나, 눈곱이 많아지는 상황에서 착색이 심해질 수 있습니다.",
      ],
      [
        "생활환경의 먼지, 건조함, 식이 변화도 영향을 줄 수 있습니다. 털 변색, 냄새, 눈곱과 충혈이 함께 보이면 관리 루틴뿐 아니라 원인도 살펴보세요.",
      ],
      [
        "매일 부드럽게 닦아주는 루틴이 가장 중요합니다. 물기가 남지 않도록 하고, 눈 주변 털이 눈을 찌르지 않게 관리하세요. 최근 간식이나 사료를 바꿨다면 그 시점과 증상 변화를 함께 보는 것이 좋습니다.",
      ],
      [
        "눈물자국은 양쪽이 비슷하게 생기기도 하지만, 한쪽만 유독 심하다면 더 주의해야 합니다. 또 냄새가 나거나 분비물 색이 진해진다면 단순 착색이 아닐 수 있습니다.",
      ],
      [
        "충혈, 눈을 잘 못 뜨는 모습, 노란 분비물, 통증 반응이 있으면 검진을 권합니다.",
      ],
    ],
    enSectionBodies: [
      [
        "Bichon Frise dogs have bright coats, so tear stains show more easily. Even when tear volume is similar, staining can look more severe than in darker-coated breeds.",
        "Do not treat it only as a cosmetic issue. Check eye-area irritation and hygiene too. Hair rubbing near the eyes, tears sitting in the coat, or increased discharge can make staining worse.",
      ],
      [
        "Dust, dryness, and diet changes can also contribute. If coat discoloration, odor, discharge, or redness appear together, review both the care routine and possible causes.",
      ],
      [
        "A gentle daily wiping routine is most important. Keep the area dry and prevent hair from poking the eyes. If treats or food recently changed, compare the timing with symptom changes.",
      ],
      [
        "Tear stains may appear on both sides, but one-sided severe staining needs more attention. Odor or darker discharge may mean it is not simple discoloration.",
      ],
      [
        "A vet check is recommended if redness, trouble opening the eye, yellow discharge, or pain response appears.",
      ],
    ],
    koClosing: [
      "비숑프리제 눈물자국은 꾸준한 위생 관리와 원인 관찰이 핵심입니다.",
      "비숑의 성향과 케어 포인트를 더 알고 싶다면, 맞춤 사주 보기와 함께 활용해보세요.",
    ],
    enClosing: [
      "Bichon Frise tear-stain care depends on steady hygiene and careful observation of causes.",
      "If you want to understand Bichon temperament and care points, use it together with personalized K-Saju content.",
    ],
  }),
  createOutlineArticle({
    breedSlug: "welsh-corgi",
    slug: "disc-symptoms-back-care",
    koTitle: "코기 디스크 증상 체크와 허리 관리법",
    enTitle: "Corgi Disc Symptoms and Back Care",
    koSummary: "코기가 디스크에 취약한 이유, 대표 신호, 집에서 확인할 포인트와 응급으로 봐야 하는 경우를 정리했어요.",
    enSummary: "A Corgi guide to disc risk, warning signs, home checks, prevention, and emergency symptoms.",
    sections: [
      outlineSection("코기가 디스크에 취약한 이유", ["체형 특성", "점프와 계단 습관", "체중 증가 영향"], "Why Corgis Are Prone to Disc Problems", ["Body structure", "Jumping and stair habits", "Weight gain influence"]),
      outlineSection("대표적인 디스크 신호", ["허리 만지면 싫어함", "움직임 감소", "다리 힘 빠짐"], "Common Disc Warning Signs", ["Dislikes back touch", "Reduced movement", "Weakness in the legs"]),
      outlineSection("집에서 확인할 수 있는 포인트", ["일어나는 자세 변화", "걷는 속도 변화", "계단 회피 여부"], "Home Checkpoints", ["Changes in standing posture", "Changes in walking speed", "Avoiding stairs"]),
      outlineSection("예방과 관리법", ["미끄럼 방지", "점프 줄이기", "적정 체중 유지"], "Prevention and Care", ["Prevent slipping", "Reduce jumping", "Maintain healthy weight"]),
      outlineSection("응급으로 봐야 하는 경우", ["보행 불가", "배뇨 이상", "극심한 통증 반응"], "Emergency Signs", ["Unable to walk", "Urination problems", "Severe pain response"]),
    ],
    koSectionBodies: [
      [
        "코기는 다리가 짧고 허리가 긴 체형이라 허리 부담 이야기가 자주 나옵니다. 활동적인 성격과 귀여운 외모 덕분에 점프나 계단 사용을 쉽게 허용하게 되지만, 이런 습관이 허리에 무리를 줄 수 있습니다.",
      ],
      [
        "허리를 만지면 싫어하거나, 평소 잘 오르던 곳을 피하거나, 걷는 속도가 달라졌다면 살펴볼 필요가 있습니다. 심해지면 다리에 힘이 빠져 보이거나, 움직임 자체를 꺼릴 수 있습니다.",
      ],
      [
        "갑자기 움직임이 줄었거나, 일어설 때 힘들어하거나, 안아 올릴 때 긴장한다면 단순한 피곤함으로 넘기지 않는 것이 좋습니다.",
      ],
      [
        "먼저 생활환경부터 바꿔보세요. 소파와 침대에서 뛰어내리는 습관을 줄이고, 계단이나 발판을 활용하는 것이 좋습니다. 미끄러운 바닥은 허리와 다리에 모두 부담을 줄 수 있어 매트 사용이 도움이 됩니다. 체중 관리도 매우 중요합니다.",
      ],
      [
        "보행이 불안정하거나, 다리를 끌거나, 배뇨 이상이 함께 보인다면 빠르게 진료를 받아야 합니다.",
      ],
    ],
    enSectionBodies: [
      [
        "Corgis have short legs and long backs, so back strain is a common concern. Their active personality can make jumping and stairs feel normal, but those habits can add stress to the spine.",
      ],
      [
        "Watch for dislike of back touch, avoiding places they normally climb, or changes in walking speed. In more serious cases, the legs may look weak or your dog may avoid movement.",
      ],
      [
        "If movement suddenly decreases, standing up looks difficult, or your dog tenses when picked up, do not dismiss it as simple tiredness.",
      ],
      [
        "Start with the home environment. Reduce jumping from sofas and beds, and use steps or ramps. Slippery floors can strain both the back and legs, so mats can help. Weight control is also very important.",
      ],
      [
        "Unstable walking, dragging the legs, or urinary changes should be checked by a vet quickly.",
      ],
    ],
    koClosing: [
      "코기 허리 관리는 아플 때 시작하는 것이 아니라, 평소 습관에서 시작됩니다.",
      "코기의 생활 성향과 일상 케어 포인트가 궁금하다면, 품종 맞춤 사주 콘텐츠로 확장해보세요.",
    ],
    enClosing: [
      "Corgi back care starts with everyday habits, not only after pain appears.",
      "If you want to understand lifestyle temperament and daily care points, continue with breed-based K-Saju content.",
    ],
  }),
  createOutlineArticle({
    breedSlug: "french-bulldog",
    slug: "breathing-difficulty-emergency-signs",
    koTitle: "프렌치불독 호흡곤란 원인과 응급 신호",
    enTitle: "French Bulldog Breathing Difficulty: Causes and Emergency Signs",
    koSummary: "프렌치불독 호흡 문제가 흔한 이유, 주의 증상, 일상 관리법과 병원에 바로 가야 하는 신호를 정리했어요.",
    enSummary: "A French Bulldog guide to breathing risks, warning signs, daily management, emergency response, and urgent vet signals.",
    sections: [
      outlineSection("프렌치불독 호흡 문제가 흔한 이유", ["단두종 구조", "더위와 습도 영향", "비만과 운동 과부하"], "Why Breathing Issues Are Common in French Bulldogs", ["Brachycephalic structure", "Heat and humidity", "Obesity and exercise overload"]),
      outlineSection("주의해야 할 증상", ["숨소리가 거칠어짐", "운동 후 회복 지연", "혀 색 변화"], "Symptoms to Watch", ["Harsher breathing sounds", "Slow recovery after exercise", "Tongue color changes"]),
      outlineSection("일상 관리 방법", ["더운 시간대 산책 피하기", "체중 조절", "시원한 환경 유지"], "Daily Management", ["Avoid walks during hot hours", "Control weight", "Keep a cool environment"]),
      outlineSection("응급 대응법", ["즉시 휴식시키기", "체온 낮추기", "병원 이동 시 주의점"], "Emergency Response", ["Rest immediately", "Lower body temperature", "Be careful during transport to the vet"]),
      outlineSection("병원에 바로 가야 하는 경우", ["청색증", "실신", "입 벌리고 계속 숨쉬기"], "Go to the Vet Immediately When", ["Cyanosis", "Fainting", "Continuous open-mouth breathing"]),
    ],
    koSectionBodies: [
      [
        "프렌치불독은 얼굴 구조 특성상 숨소리가 거칠거나 더위에 약한 모습을 보이기 쉽습니다. 그래서 다른 품종보다 호흡 상태를 더 세심하게 살펴야 합니다.",
      ],
      [
        "숨소리가 갑자기 커지거나, 짧은 산책 후에도 한참 숨을 고르거나, 더운 날 쉽게 지쳐 보인다면 주의가 필요합니다. 평소보다 입을 벌리고 숨 쉬는 시간이 길어지거나, 혀 색이 달라 보이면 더 신경 써야 합니다.",
      ],
      [
        "더운 시간대 산책은 피하고, 실내 온도와 습도를 편안하게 유지하는 것이 중요합니다. 과체중은 호흡 부담을 더 키울 수 있으므로 체중 관리도 필요합니다. 흥분이 너무 심해지는 놀이 방식은 줄이는 것이 좋습니다.",
      ],
      [
        "숨이 너무 가빠서 진정되지 않거나, 축 처지거나, 혀나 잇몸 색이 평소와 다르게 보인다면 즉시 대응이 필요합니다. 이런 경우에는 집에서 오래 지켜보기보다 빠르게 진료를 받는 것이 안전합니다.",
      ],
      [
        "실신, 청색증이 의심되는 색 변화, 계속 입 벌리고 힘들게 숨 쉬는 모습은 바로 병원으로 가야 하는 신호입니다.",
      ],
    ],
    enSectionBodies: [
      [
        "Because of their facial structure, French Bulldogs can have noisy breathing and may struggle with heat. Their breathing should be watched more closely than many other breeds.",
      ],
      [
        "Pay attention if breathing suddenly becomes louder, recovery after a short walk takes longer, or your dog tires easily on warm days. Longer open-mouth breathing or changes in tongue color need extra care.",
      ],
      [
        "Avoid walks during hot hours and keep indoor temperature and humidity comfortable. Extra weight can increase breathing burden, so weight control matters. Reduce play that causes extreme excitement.",
      ],
      [
        "If breathing stays very fast, your dog becomes weak, or the tongue or gums look different from usual, respond immediately. In these cases, it is safer to seek vet care quickly rather than watching at home for too long.",
      ],
      [
        "Fainting, suspected cyanosis, or continuous open-mouth labored breathing are signs to go to the vet immediately.",
      ],
    ],
    koClosing: [
      "프렌치불독의 호흡 관리는 계절과 체중, 생활 습관의 영향을 크게 받습니다.",
      "우리 아이의 성향과 케어 루틴을 더 정교하게 보고 싶다면, 프렌치불독 맞춤 사주 콘텐츠와 함께 활용해보세요.",
    ],
    enClosing: [
      "French Bulldog breathing care is strongly affected by season, weight, and daily habits.",
      "If you want a more detailed look at temperament and care routines, use it with French Bulldog K-Saju content.",
    ],
  }),
  createOutlineArticle({
    breedSlug: "british-shorthair",
    slug: "obesity-weight-check",
    koTitle: "브리티시숏헤어 비만 관리법과 체중 체크",
    enTitle: "British Shorthair Obesity Care and Weight Check",
    koSummary: "브리티시숏헤어가 살찌기 쉬운 이유, 비만 신호, 건강한 체중 관리법과 병원 상담 기준을 정리했어요.",
    enSummary: "A British Shorthair guide to obesity risks, weight warning signs, healthy weight care, and when to consult a vet.",
    sections: [
      outlineSection("브리티시숏헤어가 살찌기 쉬운 이유", ["낮은 활동량", "식욕과 간식 습관", "실내생활 패턴"], "Why British Shorthairs Gain Weight Easily", ["Low activity level", "Appetite and treat habits", "Indoor lifestyle patterns"]),
      outlineSection("비만 신호 확인하기", ["허리 라인 사라짐", "뱃살 증가", "움직임 둔화"], "Checking Obesity Signs", ["Waistline disappears", "More belly fat", "Slower movement"]),
      outlineSection("건강하게 체중 줄이는 방법", ["급여량 조절", "놀이 시간 늘리기", "간식 관리"], "Healthy Weight Loss Methods", ["Adjust food portions", "Increase playtime", "Manage treats"]),
      outlineSection("비만이 부르는 문제", ["관절 부담", "그루밍 감소", "만성질환 위험"], "Problems Caused by Obesity", ["Joint burden", "Reduced grooming", "Chronic disease risk"]),
      outlineSection("병원 상담이 필요한 경우", ["급격한 체중 증가", "숨참", "체중 조절 실패"], "When Vet Consultation Is Needed", ["Rapid weight gain", "Shortness of breath", "Weight control fails"]),
    ],
    koSectionBodies: [
      [
        "브리티시숏헤어는 동글동글하고 단단한 체형이 매력인 고양이지만, 그만큼 체중이 늘어나는 변화를 놓치기 쉬운 편입니다. 원래 체형이 통통해 보여서 “원래 이런 아이인가?” 하고 넘기기 쉽지만, 실제로는 활동량 부족이나 과한 급여로 비만이 진행되는 경우도 있습니다.",
        "브리티시숏헤어는 비교적 차분한 성향을 보이는 경우가 많아, 놀이 시간이 짧거나 실내 자극이 부족하면 움직임이 줄어들 수 있습니다. 여기에 간식이 잦거나 자유급식 습관이 더해지면 체중이 서서히 오르기 쉽습니다.",
      ],
      [
        "몸을 위에서 봤을 때 허리선이 거의 보이지 않거나, 옆에서 봤을 때 배가 아래로 많이 처져 보인다면 체크가 필요합니다. 갈비뼈를 만졌을 때 적당히 만져지는지, 뛰거나 점프하는 빈도가 줄지는 않았는지도 함께 봐야 합니다. 털이 풍성한 아이는 체형이 잘 가려지므로 눈으로만 판단하지 않는 것이 좋습니다.",
      ],
      [
        "급격하게 양을 줄이기보다, 하루 급여량을 먼저 정확히 계산하고 간식 비중을 조절하는 것이 중요합니다. 놀이 시간을 짧게라도 자주 나눠 주면 운동량을 늘리는 데 도움이 됩니다. 사료를 퍼즐 급식기나 장난감과 함께 활용하면 먹는 속도를 늦추고 활동성도 높일 수 있습니다.",
      ],
      [
        "비만은 관절 부담, 그루밍 감소, 만성질환 위험으로 이어질 수 있습니다. 체중이 조금씩 늘어나는 경우 보호자가 뒤늦게 알아차리기 쉬워, 체형과 활동량을 주기적으로 확인하는 편이 좋습니다.",
      ],
      [
        "체중이 계속 오르는데 식사량은 크게 변하지 않았거나, 숨이 차 보이거나, 움직임이 뚜렷하게 줄었다면 진료가 필요할 수 있습니다. 단순 체형 문제보다 다른 건강 요인이 함께 있는지 확인하는 것이 좋습니다.",
      ],
    ],
    enSectionBodies: [
      [
        "British Shorthairs are loved for their round, sturdy look, but that same body shape can make weight gain easy to miss. It is tempting to think they are just naturally chunky, but low activity or overfeeding can gradually lead to obesity.",
        "Many British Shorthairs are relatively calm. When playtime is short or indoor stimulation is limited, movement can drop. Frequent treats or free-feeding can then make weight rise slowly over time.",
      ],
      [
        "Check whether the waistline is visible from above and whether the belly hangs low from the side. Also feel whether the ribs can be touched with light pressure and watch whether running or jumping has decreased. A thick coat can hide body shape, so do not rely on sight alone.",
      ],
      [
        "Rather than cutting food suddenly, calculate the daily portion accurately and adjust treats first. Short but frequent play sessions can help increase movement. Puzzle feeders or food toys can slow eating and add activity.",
      ],
      [
        "Obesity can increase joint burden, reduce grooming, and raise chronic disease risk. Because weight often rises gradually, check body shape and activity regularly.",
      ],
      [
        "Consult a vet if weight keeps rising without a clear food change, breathing looks labored, or movement clearly decreases. It is worth checking whether another health factor is involved.",
      ],
    ],
    koClosing: [
      "브리티시숏헤어의 비만 관리는 “덜 먹이기”보다 “지속 가능한 생활 루틴 만들기”에 가깝습니다.",
      "우리 아이 성향과 생활 패턴까지 함께 보고 싶다면, 브리티시숏헤어 맞춤 사주/성향 콘텐츠로 연결해보세요.",
    ],
    enClosing: [
      "British Shorthair weight care is less about simply feeding less and more about building a sustainable daily routine.",
      "If you want to understand temperament and lifestyle patterns too, continue with British Shorthair K-Saju content.",
    ],
  }),
  createOutlineArticle({
    breedSlug: "british-shorthair",
    slug: "hairball-vomiting-care",
    koTitle: "브리티시숏헤어 헤어볼 구토 줄이는 관리법",
    enTitle: "British Shorthair Hairball Vomiting Care",
    koSummary: "브리티시숏헤어 헤어볼이 생기는 이유, 정상과 이상 구토 구분, 예방 관리와 병원 방문 기준을 정리했어요.",
    enSummary: "A guide to British Shorthair hairballs, vomiting signs, prevention, daily checks, and when vet care is needed.",
    sections: [
      outlineSection("헤어볼이 생기는 이유", ["그루밍 습관", "털갈이 시기", "수분 부족"], "Why Hairballs Form", ["Grooming habits", "Shedding season", "Low hydration"]),
      outlineSection("정상과 이상 구토 구분", ["헤어볼 토의 특징", "음식물 구토와 차이", "위험 신호 확인"], "Normal vs Concerning Vomiting", ["Hairball vomiting traits", "Difference from food vomiting", "Check warning signs"]),
      outlineSection("헤어볼 예방 방법", ["빗질 주기", "수분 섭취 늘리기", "식이 보조 활용"], "Hairball Prevention", ["Brushing frequency", "Increase hydration", "Use dietary support"]),
      outlineSection("생활 속 체크포인트", ["배변 상태", "식욕 변화", "무기력 여부"], "Daily Checkpoints", ["Stool condition", "Appetite changes", "Lethargy"]),
      outlineSection("병원에 가야 하는 경우", ["구토가 너무 잦을 때", "변비 동반 시", "먹지 못할 때"], "When to Visit the Vet", ["Vomiting is too frequent", "Constipation appears", "Unable to eat"]),
    ],
    koSectionBodies: [
      [
        "고양이는 스스로 그루밍을 하면서 털을 삼키기 때문에 헤어볼 자체는 낯선 일이 아닙니다. 하지만 브리티시숏헤어가 헤어볼 때문에 자주 토한다면, 단순한 털 문제인지 생활 습관이나 소화 상태까지 함께 봐야 합니다.",
        "그루밍이 많아지는 털갈이 시기에는 삼키는 털 양도 늘어날 수 있습니다. 수분 섭취가 부족하거나 활동량이 낮으면 장을 통과하는 과정이 더딜 수 있어 보호자들이 헤어볼 구토를 자주 보게 됩니다.",
      ],
      [
        "간헐적으로 털 덩어리와 함께 토하는 것은 비교적 흔할 수 있습니다. 하지만 털이 거의 없는데 계속 토하거나, 밥을 먹고 바로 토하거나, 구토 후 기운이 없으면 다른 문제 가능성도 생각해야 합니다. 특히 구토 횟수가 갑자기 늘어난 경우에는 더 주의해야 합니다.",
      ],
      [
        "빗질 횟수를 늘려 삼키는 털 양 자체를 줄이는 것이 기본입니다. 물을 잘 마실 수 있도록 물그릇 위치를 늘리거나 습식사료를 일부 활용하는 것도 도움이 될 수 있습니다. 식이 변화는 급하게 하지 말고, 현재 먹는 것과의 반응을 함께 기록해두면 좋습니다.",
      ],
      [
        "배변 상태, 식욕 변화, 무기력 여부를 함께 확인하세요. 헤어볼처럼 보여도 변비나 식욕 저하가 동반되면 단순한 털 문제보다 불편이 커졌다는 신호일 수 있습니다.",
      ],
      [
        "구토가 너무 잦거나, 헤어볼이 아닌 음식물 구토가 반복되거나, 변비나 식욕 저하가 함께 나타나면 진료를 권합니다.",
      ],
    ],
    enSectionBodies: [
      [
        "Cats swallow hair while grooming, so hairballs are not unusual. But if a British Shorthair vomits often because of hairballs, look at daily habits and digestion as well as the coat itself.",
        "During shedding season, grooming and swallowed hair can increase. Low hydration or low activity may slow movement through the gut, making hairball vomiting more noticeable.",
      ],
      [
        "Occasional vomiting with a hair clump can be common. But repeated vomiting with little hair, vomiting right after eating, or low energy after vomiting may suggest another issue. A sudden increase in vomiting needs extra attention.",
      ],
      [
        "The basic step is brushing more often to reduce swallowed hair. More water stations or some wet food may help hydration. Avoid sudden diet changes and record how your cat responds to current food.",
      ],
      [
        "Check stool condition, appetite, and energy level together. Even if it looks like a hairball issue, constipation or reduced appetite can mean the discomfort is larger.",
      ],
      [
        "Vet care is recommended if vomiting is too frequent, food vomiting repeats, constipation appears, or appetite drops.",
      ],
    ],
    koClosing: [
      "브리티시숏헤어의 헤어볼 관리는 빗질, 수분, 식이, 활동량이 함께 맞물려 있습니다.",
      "생활 패턴과 기질까지 함께 살펴보고 싶다면, 우리 아이 성향 콘텐츠와 연결해보세요.",
    ],
    enClosing: [
      "British Shorthair hairball care connects brushing, hydration, diet, and activity.",
      "If you want to understand lifestyle patterns and temperament too, continue with pet temperament content.",
    ],
  }),
  createOutlineArticle({
    breedSlug: "munchkin",
    slug: "joint-pain-care",
    koTitle: "먼치킨 관절 통증 신호와 생활 관리법",
    enTitle: "Munchkin Joint Pain Signs and Daily Care",
    koSummary: "먼치킨에게 관절 관리가 중요한 이유, 통증 의심 행동, 생활환경 조정과 병원 검사 기준을 정리했어요.",
    enSummary: "A Munchkin guide to joint-care importance, pain signals, home setup, missed signs, and when vet exams are needed.",
    sections: [
      outlineSection("먼치킨에게 관절 관리가 중요한 이유", ["체형 특성", "체중의 영향", "점프 습관 부담"], "Why Joint Care Matters for Munchkins", ["Body structure", "Weight influence", "Jumping habit burden"]),
      outlineSection("통증을 의심할 수 있는 행동", ["높은 곳 피하기", "점프 실패", "움직임 둔화"], "Behaviors That May Suggest Pain", ["Avoiding high places", "Failed jumps", "Slower movement"]),
      outlineSection("집에서 환경을 바꾸는 방법", ["낮은 캣타워 사용", "미끄럼 방지", "체중 관리"], "How to Change the Home Environment", ["Use a low cat tower", "Prevent slipping", "Manage weight"]),
      outlineSection("보호자가 자주 놓치는 신호", ["만졌을 때 싫어함", "놀이 시간 감소", "자세 변화"], "Signs Owners Often Miss", ["Dislikes being touched", "Less playtime", "Posture changes"]),
      outlineSection("병원 검사가 필요한 경우", ["절뚝거림", "통증 반응 지속", "갑작스러운 움직임 제한"], "When Vet Exams Are Needed", ["Limping", "Ongoing pain response", "Sudden movement limitation"]),
    ],
    koSectionBodies: [
      [
        "먼치킨은 짧은 다리와 독특한 체형 때문에 귀엽다는 인상이 강하지만, 그만큼 관절과 허리 부담을 걱정하는 보호자도 많습니다. 항상 문제가 생긴다는 뜻은 아니지만, 움직임 변화에 더 민감하게 반응하는 것이 좋습니다.",
      ],
      [
        "예전보다 높은 곳에 덜 올라가거나, 점프를 망설이거나, 놀이 시간이 줄어드는 모습이 먼저 보일 수 있습니다. 안겼을 때 몸을 굳히거나, 만지는 걸 싫어하거나, 걷는 속도가 달라졌다면 관찰이 필요합니다. 고양이는 통증을 숨기는 경우가 많아 작은 변화가 더 중요합니다.",
      ],
      [
        "먼치킨은 높은 캣타워보다 오르내리기 쉬운 구조가 더 편할 수 있습니다. 미끄러운 바닥을 줄이고, 자주 쉬는 장소로 올라가는 동선에 낮은 발판을 두는 것도 도움이 됩니다. 체중이 늘면 관절 부담이 커질 수 있으므로 식사량과 간식도 함께 조절해야 합니다.",
      ],
      [
        "“원래 점프를 잘 안 하는 아이인가 보다” 하고 넘기는 경우가 많습니다. 하지만 점프를 피하거나 계단을 천천히 오르는 행동이 이전과 다르다면 단순 성격 변화가 아닐 수도 있습니다. 놀이 의욕이나 화장실 출입 자세도 함께 봐야 합니다.",
      ],
      [
        "절뚝거림이 보이거나, 통증 반응이 분명하거나, 움직임 제한이 갑자기 생겼다면 진료가 필요합니다. 오래 참게 하기보다 원인을 빨리 확인하는 것이 좋습니다.",
      ],
    ],
    enSectionBodies: [
      [
        "Munchkins are known for their short legs and unique body shape, but that same structure makes many owners think carefully about joints and back comfort. It does not mean every cat will have a problem, but movement changes should be watched closely.",
      ],
      [
        "Early changes may include avoiding higher places, hesitating before jumps, or playing less. If your cat stiffens when held, dislikes touch, or walks differently, observation is needed. Cats often hide pain, so small changes matter.",
      ],
      [
        "Munchkins may be more comfortable with easy-to-climb structures than very tall cat towers. Reducing slippery floors and adding low steps to favorite resting places can help. Because extra weight adds joint burden, food and treats should be managed too.",
      ],
      [
        "Owners may assume the cat simply does not like jumping. But if avoiding jumps or climbing slowly is new, it may not be only personality. Watch play motivation and litter-box posture too.",
      ],
      [
        "Vet care is needed if limping appears, pain response is clear, or movement suddenly becomes limited. Finding the cause early is better than letting discomfort build.",
      ],
    ],
    koClosing: [
      "먼치킨의 관절 관리는 “문제가 생긴 뒤 치료”보다 “불편이 쌓이지 않게 환경을 맞추는 것”에 가깝습니다.",
      "우리 아이 생활 성향과 관리 포인트를 더 알고 싶다면, 맞춤 성향 콘텐츠로 함께 확장해보세요.",
    ],
    enClosing: [
      "Munchkin joint care is more about shaping the environment before discomfort builds than only treating problems later.",
      "If you want to understand lifestyle temperament and care points too, continue with personalized temperament content.",
    ],
  }),
  createOutlineArticle({
    breedSlug: "munchkin",
    slug: "obesity-diet-care",
    koTitle: "먼치킨 비만 원인과 다이어트 관리법",
    enTitle: "Munchkin Obesity Causes and Diet Care",
    koSummary: "먼치킨 비만이 위험한 이유, 비만 체크 방법, 체중 관리 실천법과 수의사 상담 기준을 정리했어요.",
    enSummary: "A Munchkin guide to obesity risks, body checks, diet care, safe weight loss, and when to consult a vet.",
    sections: [
      outlineSection("먼치킨 비만이 위험한 이유", ["관절 부담 증가", "활동량 감소 악순환", "만성질환 연관성"], "Why Munchkin Obesity Is Risky", ["More joint burden", "Cycle of reduced activity", "Links to chronic disease"]),
      outlineSection("비만 여부 체크하기", ["갈비뼈 촉진", "허리선 관찰", "복부 라인 확인"], "Checking for Obesity", ["Feel the ribs", "Observe the waistline", "Check the belly line"]),
      outlineSection("체중 관리 실천법", ["급여량 계산", "간식 제한", "실내 놀이 루틴"], "Weight Management Steps", ["Calculate food portions", "Limit treats", "Indoor play routine"]),
      outlineSection("다이어트 시 주의할 점", ["급격한 감량 금지", "스트레스 관리", "기호성 저하 대처"], "Diet Precautions", ["Avoid rapid weight loss", "Manage stress", "Handle reduced food preference"]),
      outlineSection("수의사 상담이 필요한 경우", ["체중이 계속 늘 때", "숨이 찰 때", "활동성이 크게 줄 때"], "When Vet Consultation Is Needed", ["Weight keeps increasing", "Shortness of breath", "Activity drops sharply"]),
    ],
    koSectionBodies: [
      [
        "먼치킨은 짧은 다리 때문에 체중 증가가 관절과 움직임에 더 부담이 될 수 있습니다. 그래서 다른 고양이보다 “통통한 게 귀엽다”는 감상으로 넘기지 않고, 적정 체형을 유지하는 것이 중요합니다.",
        "체중이 늘면 점프와 이동이 더 힘들어지고, 활동량이 줄면서 다시 살이 찌는 악순환이 생길 수 있습니다. 몸을 그루밍하는 범위도 줄어 위생 관리가 어려워질 수 있고, 전반적인 컨디션이 떨어져 보일 수도 있습니다.",
      ],
      [
        "허리선이 거의 보이지 않거나, 복부가 아래로 많이 늘어져 보이면 확인이 필요합니다. 갈비뼈가 전혀 만져지지 않거나, 예전보다 놀지 않고 자는 시간이 늘었다면 체중 변화와 함께 보는 것이 좋습니다.",
      ],
      [
        "식사량을 무작정 줄이기보다 하루 총 급여량을 계산해 나누어 주는 방식이 더 안정적입니다. 놀이는 짧더라도 자주 나눠서 하는 것이 좋고, 사냥놀이처럼 움직이게 만드는 놀이가 도움이 됩니다. 간식은 “조금밖에 안 줬다”고 느껴져도 누적되면 체중 증가에 영향을 줄 수 있습니다.",
      ],
      [
        "급격한 감량은 오히려 부담이 될 수 있습니다. 기호성이 갑자기 떨어지면 스트레스를 받을 수 있으므로 식단 변화는 천천히 조정하는 것이 좋습니다.",
      ],
      [
        "체중이 계속 늘거나, 숨이 차 보이거나, 움직임이 눈에 띄게 줄었다면 전문가 상담이 필요할 수 있습니다.",
      ],
    ],
    enSectionBodies: [
      [
        "Because of their short legs, weight gain can add more burden to a Munchkin's joints and movement. It is important not to dismiss extra weight as simply cute.",
        "As weight increases, jumping and moving can become harder. Lower activity can then lead to more weight gain. Grooming range may also decrease, making hygiene harder and overall condition lower.",
      ],
      [
        "Check if the waistline is hard to see or the belly hangs low. If the ribs cannot be felt at all, or your cat sleeps more and plays less than before, review weight changes together.",
      ],
      [
        "Rather than cutting food randomly, calculate the total daily amount and divide it into meals. Short but frequent play sessions are helpful, especially hunting-style play. Even small treats can add up over time.",
      ],
      [
        "Rapid weight loss can be stressful and unsafe. If food preference suddenly drops, adjust diet changes slowly.",
      ],
      [
        "Professional advice may be needed if weight keeps increasing, breathing looks labored, or movement clearly drops.",
      ],
    ],
    koClosing: [
      "먼치킨의 다이어트는 “적게 먹이기”보다 “덜 무리하고 더 꾸준하게 관리하기”가 핵심입니다.",
      "우리 아이의 생활 리듬과 기질까지 함께 보고 싶다면, 성향 기반 콘텐츠와 연결해보세요.",
    ],
    enClosing: [
      "Munchkin weight care is less about feeding very little and more about steady, lower-stress management.",
      "If you want to understand daily rhythm and temperament too, continue with temperament-based content.",
    ],
  }),
  createOutlineArticle({
    breedSlug: "persian",
    slug: "tear-stain-eye-care",
    koTitle: "페르시안 눈물자국 원인과 눈 관리법",
    enTitle: "Persian Tear Stains and Eye Care",
    koSummary: "페르시안 눈물자국이 많은 이유, 동반 증상, 집에서 하는 눈 관리와 병원 방문 기준을 정리했어요.",
    enSummary: "A Persian guide to tear-stain causes, eye symptoms, home care, common misunderstandings, and vet warning signs.",
    sections: [
      outlineSection("페르시안이 눈물자국이 많은 이유", ["얼굴 구조 특성", "눈물 배출 문제", "털과 눈 자극"], "Why Persians Often Have Tear Stains", ["Facial structure", "Tear drainage issues", "Coat and eye irritation"]),
      outlineSection("확인해야 할 동반 증상", ["눈곱 증가", "냄새", "충혈과 눈 비빔"], "Symptoms to Check Together", ["More discharge", "Odor", "Redness and eye rubbing"]),
      outlineSection("집에서 관리하는 방법", ["하루 세정 루틴", "얼굴 털 위생 관리", "자극 줄이는 환경 만들기"], "Home Care Methods", ["Daily cleaning routine", "Facial coat hygiene", "Reduce irritation at home"]),
      outlineSection("흔한 오해", ["눈물자국은 미용 문제만은 아님", "물티슈로 닦는 습관 주의", "양쪽 대칭 여부 확인 중요"], "Common Misunderstandings", ["Tear stains are not only cosmetic", "Be careful with wet wipes", "Check whether both sides are similar"]),
      outlineSection("병원에 가야 하는 경우", ["한쪽만 심한 경우", "눈을 잘 못 뜨는 경우", "분비물 색이 진한 경우"], "When to Visit the Vet", ["Only one side is severe", "Trouble opening the eye", "Dark discharge color"]),
    ],
    koSectionBodies: [
      [
        "페르시안은 얼굴 구조상 눈물이 고이기 쉬워 눈물자국과 눈곱 관리가 중요한 편입니다. 털이 풍성하고 얼굴 주변이 민감해 작은 자극도 눈에 띄기 쉽기 때문에, 보호자들이 가장 먼저 체감하는 관리 포인트 중 하나입니다.",
        "얼굴 주변 털이 눈을 자극하거나, 눈물이 배출되는 흐름이 원활하지 않거나, 먼지와 건조함 같은 생활환경 요소가 영향을 줄 수 있습니다. 눈곱이 많아지거나 냄새가 나기 시작하면 단순 미용 관리 이상의 접근이 필요할 수 있습니다.",
      ],
      [
        "눈물자국이 양쪽 모두 비슷하게 생기는지, 한쪽만 유독 심한지 살펴보세요. 충혈, 찡그림, 눈을 자주 감는 행동, 분비물 색 변화가 있다면 더 자세히 봐야 합니다.",
      ],
      [
        "매일 한 번씩 눈 주변을 부드럽게 닦아주는 루틴이 중요합니다. 세정 후에는 물기를 남기지 않고, 얼굴 털이 눈을 찌르지 않도록 정리해주는 것이 좋습니다. 보호자가 자주 쓰는 생활용품이나 공기 환경이 자극 요인이 아닌지도 함께 보는 것이 도움이 됩니다.",
      ],
      [
        "눈물자국은 단순한 미용 문제만은 아닐 수 있습니다. 물티슈로 자주 문지르는 습관은 자극이 될 수 있고, 양쪽이 비슷한지 한쪽만 심한지 확인하는 것도 중요합니다.",
      ],
      [
        "한쪽 눈만 심하거나, 분비물이 진해지거나, 눈을 잘 못 뜨는 모습이 보이면 검진을 권합니다. 겉으로는 비슷해 보여도 원인이 다를 수 있습니다.",
      ],
    ],
    enSectionBodies: [
      [
        "Because of their facial structure, Persians can easily collect tears around the eyes, so tear stains and discharge need steady care. Their full coat and sensitive face make even small irritation noticeable.",
        "Hair around the face may irritate the eyes, tear drainage may not flow smoothly, and dust or dry air can also contribute. More discharge or odor may require more than cosmetic care.",
      ],
      [
        "Check whether stains are similar on both sides or much worse on one side. Redness, squinting, frequent eye closing, or changes in discharge color need closer attention.",
      ],
      [
        "A gentle once-daily cleaning routine around the eyes is important. After cleaning, keep the area dry and trim facial hair so it does not poke the eyes. It can also help to review household products and air quality.",
      ],
      [
        "Tear stains are not always just cosmetic. Frequent rubbing with wet wipes can irritate the skin, and checking whether symptoms are symmetrical is important.",
      ],
      [
        "A vet check is recommended if only one eye is severe, discharge becomes darker, or your cat has trouble opening the eye. Similar-looking symptoms can have different causes.",
      ],
    ],
    koClosing: [
      "페르시안 눈 관리는 매일의 루틴이 쌓여 차이를 만드는 영역입니다.",
      "우리 아이의 성향과 생활 케어 포인트까지 함께 보고 싶다면, 맞춤 사주/성향 콘텐츠를 활용해보세요.",
    ],
    enClosing: [
      "Persian eye care is an area where daily routine makes a real difference.",
      "If you want to understand temperament and lifestyle care points too, use personalized K-Saju content.",
    ],
  }),
  createOutlineArticle({
    breedSlug: "persian",
    slug: "hairball-vomiting-care",
    koTitle: "페르시안 헤어볼 구토 원인과 줄이는 방법",
    enTitle: "Persian Hairball Vomiting Causes and Care",
    koSummary: "페르시안이 헤어볼에 취약한 이유, 일반 구토와 위험 신호 구분, 예방 관리와 병원 방문 기준을 정리했어요.",
    enSummary: "A Persian guide to hairball risk, vomiting warning signs, prevention, daily checks, and when vet care is needed.",
    sections: [
      outlineSection("페르시안이 헤어볼에 취약한 이유", ["장모종 특성", "잦은 그루밍", "털갈이 시기"], "Why Persians Are Prone to Hairballs", ["Long-haired breed traits", "Frequent grooming", "Shedding season"]),
      outlineSection("일반적인 헤어볼 구토와 위험 신호", ["정상 범위 구토", "장폐색 의심 증상", "식욕 저하 동반 여부"], "Typical Hairball Vomiting vs Warning Signs", ["Normal-range vomiting", "Possible intestinal blockage signs", "Whether appetite drops"]),
      outlineSection("헤어볼 예방 관리", ["빗질 루틴", "헤어볼 케어 식이", "수분 섭취 늘리기"], "Hairball Prevention Care", ["Brushing routine", "Hairball-care diet", "Increase hydration"]),
      outlineSection("집사가 체크할 생활 변화", ["변 상태", "그루밍 빈도", "무기력 여부"], "Daily Changes to Check", ["Stool condition", "Grooming frequency", "Lethargy"]),
      outlineSection("병원 방문이 필요한 경우", ["하루 여러 번 구토", "먹고 바로 토할 때", "배변이 멈출 때"], "When a Vet Visit Is Needed", ["Vomiting several times a day", "Vomiting right after eating", "Bowel movements stop"]),
    ],
    koSectionBodies: [
      [
        "장모종인 페르시안은 털을 삼키는 양이 상대적으로 많아 보호자들이 헤어볼 구토를 자주 걱정합니다. 간헐적인 헤어볼은 흔할 수 있지만, 횟수나 패턴이 달라지면 관리 방식을 다시 볼 필요가 있습니다.",
        "풍성한 털과 잦은 그루밍이 가장 큰 이유입니다. 여기에 털갈이 시기, 수분 섭취 부족, 활동량 저하가 겹치면 털이 소화기관을 통과하는 흐름이 더 느려질 수 있습니다. 그래서 단순히 털만의 문제가 아니라 생활 루틴 전체와 연결해 봐야 합니다.",
      ],
      [
        "털 덩어리가 함께 나오는 가벼운 구토와 달리, 음식물만 반복해서 토하거나 토한 뒤 축 처지면 다른 원인을 의심해야 합니다. 특히 변비, 식욕 저하, 복부 불편감이 함께 보이면 더 주의가 필요합니다.",
      ],
      [
        "가장 기본은 빗질입니다. 털을 미리 제거해 삼키는 양을 줄여주면 도움이 됩니다. 물을 잘 마실 수 있도록 환경을 바꾸고, 습식사료를 일부 활용하는 것도 좋은 방법입니다. 털갈이 시기에는 평소보다 더 세심한 관리가 필요합니다.",
      ],
      [
        "변 상태, 그루밍 빈도, 무기력 여부를 함께 살펴보세요. 헤어볼처럼 보여도 생활 변화가 함께 나타난다면 단순한 털 문제가 아닐 수 있습니다.",
      ],
      [
        "하루에 여러 번 토하거나, 먹고 바로 토하거나, 배변이 줄고 기운이 없다면 진료를 권합니다. 헤어볼로 보이더라도 실제 불편은 더 클 수 있습니다.",
      ],
    ],
    enSectionBodies: [
      [
        "As a long-haired breed, Persians swallow relatively more hair, so owners often worry about hairball vomiting. Occasional hairballs can be common, but changes in frequency or pattern mean the care routine should be reviewed.",
        "Their full coat and frequent grooming are the main reasons. Shedding season, low hydration, and low activity can also slow hair movement through the digestive tract, so look at the whole routine, not only the coat.",
      ],
      [
        "Light vomiting with a hair clump differs from repeated food vomiting or low energy after vomiting. Constipation, appetite loss, or belly discomfort needs extra attention.",
      ],
      [
        "Brushing is the foundation. Removing loose hair before it is swallowed can help. Better access to water and some wet food may also support hydration. Shedding season needs more careful care than usual.",
      ],
      [
        "Watch stool condition, grooming frequency, and energy level together. If daily changes appear with vomiting, it may not be only a hair issue.",
      ],
      [
        "Vet care is recommended if your cat vomits several times a day, vomits right after eating, has fewer bowel movements, or seems low in energy.",
      ],
    ],
    koClosing: [
      "페르시안 헤어볼 관리는 “털 관리 + 수분 + 관찰”의 조합이 핵심입니다.",
      "우리 아이 생활 패턴과 기질까지 함께 이해하고 싶다면, 성향 콘텐츠와 이어서 보세요.",
    ],
    enClosing: [
      "Persian hairball care depends on the combination of coat care, hydration, and observation.",
      "If you want to understand daily patterns and temperament too, continue with temperament content.",
    ],
  }),
  createOutlineArticle({
    breedSlug: "scottish-fold",
    slug: "arthritis-care-points",
    koTitle: "스코티시폴드 관절염 증상과 관리 포인트",
    enTitle: "Scottish Fold Arthritis Signs and Care Points",
    koSummary: "스코티시폴드 관절 문제가 중요한 이유, 관절염 의심 증상, 집에서 도와주는 관리법과 진료 기준을 정리했어요.",
    enSummary: "A Scottish Fold guide to joint concerns, arthritis signs, home care, worsening situations, and vet-care criteria.",
    sections: [
      outlineSection("스코티시폴드 관절 문제가 중요한 이유", ["품종 특성과 유전적 배경", "통증이 숨겨지기 쉬운 이유", "조기 관찰의 중요성"], "Why Joint Issues Matter in Scottish Folds", ["Breed traits and genetic background", "Why pain can be hidden", "Importance of early observation"]),
      outlineSection("관절염 의심 증상", ["절뚝거림", "점프 줄어듦", "만지면 싫어함"], "Possible Arthritis Signs", ["Limping", "Less jumping", "Dislikes being touched"]),
      outlineSection("집에서 도와주는 관리법", ["낮은 높이의 생활환경", "체중 관리", "무리한 활동 줄이기"], "Home Care Support", ["Low-height environment", "Weight management", "Reduce excessive activity"]),
      outlineSection("악화되기 쉬운 상황", ["비만", "미끄러운 바닥", "활동 후 휴식 부족"], "Situations That Can Worsen It", ["Obesity", "Slippery floors", "Not enough rest after activity"]),
      outlineSection("병원 진료가 필요한 경우", ["통증 반응 뚜렷", "보행 이상 지속", "식욕까지 떨어질 때"], "When Vet Care Is Needed", ["Clear pain response", "Ongoing gait changes", "Appetite also drops"]),
    ],
    koSectionBodies: [
      [
        "스코티시폴드는 외형적 특징 때문에 관절 관련 걱정을 함께 떠올리는 보호자가 많습니다. 모든 아이가 같은 불편을 겪는 것은 아니지만, 움직임과 자세 변화를 주의 깊게 보는 습관은 중요합니다.",
      ],
      [
        "예전보다 점프를 덜 하거나, 계단이나 높은 곳을 피하거나, 앉고 일어나는 동작이 둔해질 수 있습니다. 만졌을 때 싫어하거나, 놀이에 대한 반응이 줄거나, 걸을 때 미세한 불편이 느껴질 수도 있습니다. 고양이는 통증을 티 내지 않는 경우가 많아 아주 작은 변화도 의미가 있을 수 있습니다.",
      ],
      [
        "높은 점프가 필요 없는 생활 동선을 만들어주고, 자주 올라가는 장소에는 낮은 발판을 두는 것이 좋습니다. 미끄러운 바닥은 줄이고, 체중이 늘지 않도록 식사와 간식을 조절해야 합니다. 관절에 무리가 가지 않도록 과한 놀이보다는 짧고 부드러운 놀이가 더 잘 맞는 경우도 있습니다.",
      ],
      [
        "비만, 미끄러운 환경, 무리한 점프 습관은 불편을 키울 수 있습니다. “원래 얌전한 성격”이라고 생각했는데 사실은 움직이는 것이 불편했던 경우도 있어 행동 변화를 세심하게 보는 것이 중요합니다.",
      ],
      [
        "절뚝거림, 통증 반응, 보행 이상이 반복되거나 식욕까지 떨어진다면 빠르게 진료를 받아보는 것이 좋습니다.",
      ],
    ],
    enSectionBodies: [
      [
        "Because of their distinctive traits, Scottish Fold owners often think carefully about joint health. Not every cat has the same discomfort, but watching movement and posture changes is important.",
      ],
      [
        "Possible signs include jumping less than before, avoiding stairs or high places, or moving more slowly when sitting and standing. Your cat may dislike touch, respond less to play, or show subtle discomfort while walking. Small changes can matter because cats often hide pain.",
      ],
      [
        "Create routes that do not require high jumps and place low steps near favorite spots. Reduce slippery floors and manage food and treats so weight does not rise. Short, gentle play may fit better than intense activity.",
      ],
      [
        "Obesity, slippery floors, and repeated hard jumping can worsen discomfort. What looks like a calm personality may sometimes be reduced movement from pain, so watch behavior changes closely.",
      ],
      [
        "Vet care is recommended if limping, pain response, or gait changes repeat, or if appetite also drops.",
      ],
    ],
    koClosing: [
      "스코티시폴드 관절 관리는 불편이 커지기 전에 환경과 루틴을 맞춰주는 데서 시작합니다.",
      "우리 아이의 타고난 기질과 생활 패턴도 함께 알고 싶다면, 맞춤 성향 콘텐츠로 연결해보세요.",
    ],
    enClosing: [
      "Scottish Fold joint care starts by adjusting the environment and routine before discomfort grows.",
      "If you want to understand natural temperament and daily patterns too, continue with personalized temperament content.",
    ],
  }),
  createOutlineArticle({
    breedSlug: "scottish-fold",
    slug: "stiff-tail-check",
    koTitle: "스코티시폴드 꼬리 뻣뻣할 때 확인할 점",
    enTitle: "Scottish Fold Stiff Tail: What to Check",
    koSummary: "스코티시폴드 꼬리 뻣뻣함이 의미할 수 있는 것, 함께 보는 행동 변화, 집에서 확인할 점과 병원 검사 기준을 정리했어요.",
    enSummary: "A Scottish Fold guide to stiff-tail meaning, related behavior changes, home checks, precautions, and vet exam signs.",
    sections: [
      outlineSection("꼬리 뻣뻣함이 의미하는 것", ["관절 이상 가능성", "통증 신호일 수 있는 이유", "정상 꼬리 움직임과 차이"], "What Tail Stiffness May Mean", ["Possible joint issue", "Why it may signal pain", "Difference from normal tail movement"]),
      outlineSection("같이 나타나는 행동 변화", ["만지는 것을 싫어함", "점프 감소", "활동성 저하"], "Behavior Changes That May Appear Together", ["Dislikes being touched", "Less jumping", "Lower activity"]),
      outlineSection("집에서 확인하는 방법", ["꼬리 움직임 관찰", "등과 허리 만졌을 때 반응", "화장실 자세 변화"], "How to Check at Home", ["Observe tail movement", "Reaction to back and waist touch", "Changes in litter-box posture"]),
      outlineSection("집에서 조심할 점", ["억지로 만지지 않기", "높은 곳 오르내림 줄이기", "체중 관리 병행"], "Home Precautions", ["Do not force handling", "Reduce climbing up and down", "Manage weight together"]),
      outlineSection("병원 검사가 필요한 경우", ["꼬리를 거의 움직이지 않을 때", "통증 반응이 심할 때", "보행 이상이 동반될 때"], "When Vet Exams Are Needed", ["Tail barely moves", "Strong pain response", "Gait changes appear together"]),
    ],
    koSectionBodies: [
      [
        "스코티시폴드 보호자들은 꼬리 움직임 변화를 민감하게 보는 편이 좋습니다. 꼬리를 평소보다 덜 움직이거나, 만질 때 불편해 보이거나, 전체적으로 뻣뻣한 느낌이 들면 단순 기분 문제가 아닐 수 있습니다.",
      ],
      [
        "꼬리를 만지면 몸을 피하거나, 안기는 것을 싫어하거나, 점프가 줄어드는 행동이 함께 보일 수 있습니다. 화장실 자세가 어색해지거나, 놀이 반응이 낮아지는 것도 함께 체크할 수 있는 변화입니다.",
      ],
      [
        "꼬리를 위아래, 좌우로 자연스럽게 움직이는지 먼저 살펴보세요. 허리나 꼬리 부위를 만졌을 때 과민하게 반응하는지도 중요합니다. 이전보다 덜 움직인다는 느낌이 들면 기록해두는 것이 좋습니다.",
      ],
      [
        "억지로 만져 보거나 꼬리를 반복적으로 움직여 확인하려 하지 않는 것이 좋습니다. 높은 곳 오르내림을 줄이고, 미끄럽지 않은 환경을 만들어 부담을 줄여주는 것이 우선입니다.",
      ],
      [
        "꼬리를 거의 움직이지 않거나, 통증 반응이 뚜렷하거나, 보행 이상이 함께 나타나면 진료를 받아보는 것이 안전합니다.",
      ],
    ],
    enSectionBodies: [
      [
        "Scottish Fold owners should watch tail movement carefully. If the tail moves less than usual, seems uncomfortable when touched, or feels stiff overall, it may not be only mood.",
      ],
      [
        "Your cat may avoid touch around the tail, dislike being held, or jump less. Awkward litter-box posture or lower play response can also be related changes.",
      ],
      [
        "First observe whether the tail moves naturally up, down, and side to side. Also notice whether your cat reacts sensitively when the back or tail area is touched. Record it if movement seems reduced compared with before.",
      ],
      [
        "Do not force handling or repeatedly move the tail to check it. Reducing climbing and creating non-slip surroundings should come first.",
      ],
      [
        "A vet exam is safer if the tail barely moves, pain response is clear, or gait changes appear together.",
      ],
    ],
    koClosing: [
      "꼬리 움직임은 작은 변화 같아 보여도 고양이의 불편을 알려주는 신호가 될 수 있습니다.",
      "생활 성향과 몸의 리듬까지 함께 보고 싶다면, 우리 아이 성향 분석 콘텐츠와 연결해보세요.",
    ],
    enClosing: [
      "Tail movement may look like a small detail, but it can signal discomfort in cats.",
      "If you want to understand lifestyle temperament and body rhythm too, continue with pet temperament analysis content.",
    ],
  }),
  createOutlineArticle({
    breedSlug: "russian-blue",
    slug: "loss-of-appetite-care",
    koTitle: "러시안블루 식욕부진 원인과 대처법",
    enTitle: "Russian Blue Loss of Appetite: Causes and Care",
    koSummary: "러시안블루 식욕이 떨어지는 이유, 함께 봐야 할 신호, 집에서 먼저 확인할 것과 병원 기준을 정리했어요.",
    enSummary: "A Russian Blue guide to appetite loss causes, related signs, home checks, recovery support, and vet-care criteria.",
    sections: [
      outlineSection("러시안블루가 식욕이 떨어지는 이유", ["스트레스", "환경 변화", "건강 이상 가능성"], "Why Russian Blues May Lose Appetite", ["Stress", "Environmental changes", "Possible health issues"]),
      outlineSection("식욕부진과 함께 보는 신호", ["숨기 행동", "구토와 설사", "음수량 변화"], "Signs to Check with Appetite Loss", ["Hiding behavior", "Vomiting and diarrhea", "Water intake changes"]),
      outlineSection("집에서 먼저 확인할 것", ["최근 바뀐 사료", "화장실 청결", "소음과 낯선 자극"], "What to Check First at Home", ["Recently changed food", "Litter-box cleanliness", "Noise and unfamiliar stimuli"]),
      outlineSection("식욕 회복을 돕는 방법", ["급여 환경 조정", "스트레스 줄이기", "습식사료 활용"], "Ways to Support Appetite Recovery", ["Adjust feeding environment", "Reduce stress", "Use wet food"]),
      outlineSection("병원에 가야 하는 기준", ["24시간 이상 거의 안 먹을 때", "무기력 동반 시", "구토가 반복될 때"], "When to Visit the Vet", ["Almost no eating for 24+ hours", "Lethargy appears", "Repeated vomiting"]),
    ],
    koSectionBodies: [
      [
        "러시안블루는 비교적 예민한 면을 보이는 아이들도 있어 환경 변화에 영향을 받는 경우가 있습니다. 그래서 식욕이 떨어졌을 때 단순 입맛 문제로만 보지 말고, 최근 달라진 점이 있었는지 함께 살펴보는 것이 중요합니다.",
        "사료 변경, 이사, 소음, 새로운 가족이나 동물 등장 같은 환경 변화가 영향을 줄 수 있습니다. 화장실 상태가 마음에 들지 않거나 급여 위치가 불편해도 먹는 양이 달라질 수 있습니다. 물론 컨디션 저하나 다른 건강 문제 가능성도 항상 함께 생각해야 합니다.",
      ],
      [
        "식욕이 줄면서 숨는 시간이 늘었는지, 물 마시는 양이 달라졌는지, 구토나 설사가 있는지를 함께 확인하세요. 평소보다 무기력하거나, 사람과의 상호작용을 더 피한다면 스트레스 또는 불편 신호일 수 있습니다.",
      ],
      [
        "최근 바뀐 사료, 화장실 청결, 소음과 낯선 자극을 먼저 확인하세요. 식욕부진은 급여 환경이나 생활환경 변화와 연결될 수 있습니다.",
      ],
      [
        "급여 장소를 조용하고 안정된 곳으로 옮기고, 최근 바뀐 요소가 있다면 하나씩 원래대로 돌려보는 것도 방법입니다. 습식사료나 따뜻하게 향을 살린 식사로 관심을 끌어보는 보호자도 많습니다. 다만 계속 안 먹는다면 오래 지켜보기보다 원인을 확인하는 쪽이 낫습니다.",
      ],
      [
        "24시간 이상 거의 먹지 않거나, 무기력, 구토, 설사, 호흡 변화가 함께 보이면 진료가 필요합니다. 고양이의 식욕부진은 생각보다 빨리 컨디션에 영향을 줄 수 있습니다.",
      ],
    ],
    enSectionBodies: [
      [
        "Some Russian Blues are sensitive to environmental changes. When appetite drops, do not treat it only as picky eating; review what changed recently.",
        "Food changes, moving, noise, new people, or new animals can affect appetite. Litter-box discomfort or an inconvenient feeding spot can also change eating amounts. Health problems should always stay on the checklist too.",
      ],
      [
        "Check whether hiding has increased, water intake has changed, or vomiting or diarrhea appears. Lower energy or avoiding interaction more than usual can signal stress or discomfort.",
      ],
      [
        "First review recently changed food, litter-box cleanliness, noise, and unfamiliar stimuli. Appetite loss can connect to feeding setup or changes in the home.",
      ],
      [
        "Move the feeding area to a quiet, stable place and reverse recent changes one by one if possible. Some owners use wet food or gently warmed food to make aroma more appealing. If your cat keeps refusing food, checking the cause is better than waiting too long.",
      ],
      [
        "Vet care is needed if your cat eats almost nothing for more than 24 hours, or if lethargy, vomiting, diarrhea, or breathing changes appear together.",
      ],
    ],
    koClosing: [
      "러시안블루 식욕부진은 “입맛”보다는 “환경과 컨디션 변화”의 신호일 수 있습니다.",
      "우리 아이의 예민함, 생활 리듬, 보호자와의 궁합까지 함께 보고 싶다면 성향 콘텐츠로 이어가보세요.",
    ],
    enClosing: [
      "Russian Blue appetite loss may be a signal of environmental or condition changes rather than only taste preference.",
      "If you want to understand sensitivity, daily rhythm, and compatibility with the owner, continue with temperament content.",
    ],
  }),
  createOutlineArticle({
    breedSlug: "ragdoll",
    slug: "heart-disease-signs",
    koTitle: "랙돌 심장병 증상과 보호자가 볼 신호",
    enTitle: "Ragdoll Heart Disease Signs Owners Should Watch",
    koSummary: "랙돌에서 심장 관련 문제가 중요한 이유, 보호자가 볼 수 있는 의심 증상, 일상 관찰법과 즉시 진료 신호를 정리했어요.",
    enSummary: "A Ragdoll guide to heart-risk importance, signs owners can observe, daily monitoring, precautions, and urgent vet signals.",
    sections: [
      outlineSection("랙돌에서 심장 관련 문제가 중요한 이유", ["품종 특성", "초기 발견이 어려운 이유", "정기 검진의 필요성"], "Why Heart Issues Matter in Ragdolls", ["Breed traits", "Why early detection is difficult", "Need for regular checkups"]),
      outlineSection("대표적인 심장병 의심 증상", ["활동량 감소", "호흡 변화", "쉽게 지침"], "Common Suspected Heart Disease Signs", ["Reduced activity", "Breathing changes", "Gets tired easily"]),
      outlineSection("일상에서 관찰하는 방법", ["자는 시간 변화", "놀 때 반응", "호흡수 체크"], "How to Observe Daily", ["Changes in sleeping time", "Response during play", "Check breathing rate"]),
      outlineSection("보호자가 조심할 점", ["무리한 운동 유도 금지", "체중 관리", "스트레스 줄이기"], "Owner Precautions", ["Do not force intense exercise", "Manage weight", "Reduce stress"]),
      outlineSection("즉시 진료가 필요한 경우", ["입 벌리고 호흡", "실신", "갑작스러운 무기력"], "When Immediate Vet Care Is Needed", ["Open-mouth breathing", "Fainting", "Sudden lethargy"]),
    ],
    koSectionBodies: [
      [
        "랙돌은 차분하고 느긋한 이미지가 강해서, 활동량 변화가 있어도 “원래 얌전한 아이”로 오해하기 쉽습니다. 하지만 평소와 다른 무기력, 호흡 변화, 놀이 반응 감소는 보호자가 놓치지 말아야 할 신호가 될 수 있습니다.",
      ],
      [
        "가장 먼저 보이는 것은 활동량 감소일 수 있습니다. 예전보다 덜 놀고, 쉽게 쉬려고 하거나, 뛰는 걸 피하는 모습이 나타날 수 있습니다. 평소보다 숨이 차 보이거나, 자는 동안 호흡이 유독 빠르게 느껴진다면 더 세심한 관찰이 필요합니다.",
      ],
      [
        "놀이 시간, 쉬는 시간, 숨소리, 밥 먹는 양처럼 일상적인 패턴 변화를 적어두면 도움이 됩니다. 고양이는 불편을 크게 표현하지 않는 경우가 많아서, “뭔가 예전과 다르다”는 감각을 숫자나 기록으로 남겨두는 것이 유용합니다.",
      ],
      [
        "무리하게 운동을 시키기보다 아이 컨디션에 맞춰 반응을 살피는 것이 중요합니다. 체중 관리를 해주고, 스트레스를 줄이는 환경을 유지하는 것도 기본적인 도움이 됩니다. 평소 건강검진 일정을 놓치지 않는 것도 중요합니다.",
      ],
      [
        "입을 벌리고 숨 쉬거나, 갑자기 힘이 빠지거나, 실신처럼 보이는 반응이 있다면 바로 병원으로 가야 합니다. 이런 신호는 지켜보기보다 빠른 대응이 우선입니다.",
      ],
    ],
    enSectionBodies: [
      [
        "Ragdolls have a calm, relaxed image, so activity changes can be mistaken for their normal personality. But unusual lethargy, breathing changes, and reduced play response are signs owners should not miss.",
      ],
      [
        "The first visible change may be reduced activity. Your cat may play less, rest sooner, or avoid running. If breathing seems heavier than usual or unusually fast during sleep, observe more carefully.",
      ],
      [
        "Recording daily patterns such as playtime, rest time, breathing sounds, and food intake can help. Cats often do not show discomfort strongly, so turning a sense of “something is different” into notes or numbers is useful.",
      ],
      [
        "Do not force intense exercise; watch your cat's response and match activity to condition. Weight management, a low-stress environment, and regular checkups are important basics.",
      ],
      [
        "Open-mouth breathing, sudden weakness, or fainting-like reactions require immediate vet care. These signs call for fast response rather than waiting.",
      ],
    ],
    koClosing: [
      "랙돌의 건강 관리는 “활동성이 적은 성격”과 “컨디션 저하”를 잘 구분하는 데서 시작합니다.",
      "우리 아이의 생활 리듬과 성향까지 함께 이해하고 싶다면, 맞춤 성향 콘텐츠로 연결해보세요.",
    ],
    enClosing: [
      "Ragdoll health care starts with distinguishing a calm personality from a real drop in condition.",
      "If you want to understand daily rhythm and temperament too, continue with personalized temperament content.",
    ],
  }),
  createReptileOutlineArticle({
    breedSlug: "leopard-gecko",
    slug: "shedding-problems-care",
    koTitle: "레오파드게코 탈피부전 원인과 해결법",
    enTitle: "Leopard Gecko Shedding Problems: Causes and Care",
    koSummary: "레오파드게코 탈피부전의 원인, 잔류 탈피 신호, 집에서 돕는 방법과 병원 기준을 정리했어요.",
    enSummary: "A Leopard Gecko guide to stuck shed causes, warning signs, home support, prevention, and vet-care criteria.",
    sections: [
      outlineSection("탈피부전이 생기는 이유", ["습도 부족", "영양 상태 문제", "사육 환경 스트레스"], "Why Shedding Problems Happen", ["Low humidity", "Nutrition issues", "Habitat stress"]),
      outlineSection("탈피부전 신호 확인하기", ["발가락 잔류 탈피", "눈 주변 껍질 남음", "꼬리 끝 이상"], "Signs of Stuck Shed", ["Stuck shed on toes", "Skin left around eyes", "Tail-tip changes"]),
      outlineSection("집에서 돕는 방법", ["습은신처 관리", "미온 습도 보조", "억지로 벗기지 말아야 하는 이유"], "How to Help at Home", ["Maintain a humid hide", "Use gentle humidity support", "Why you should not force removal"]),
      outlineSection("예방을 위한 환경 세팅", ["적정 습도 유지", "은신처 구성", "영양 보충 관리"], "Habitat Setup for Prevention", ["Maintain proper humidity", "Arrange hides", "Manage supplementation"]),
      outlineSection("병원에 가야 하는 경우", ["눈 주변 탈피가 남을 때", "발가락 색 변화", "반복적으로 탈피 실패할 때"], "When to Visit the Vet", ["Shed remains around eyes", "Toe color changes", "Repeated shedding failure"]),
    ],
    koSectionBodies: [
      [
        "레오파드게코는 성장 과정에서 주기적으로 탈피를 합니다. 보통은 큰 문제 없이 자연스럽게 벗겨지지만, 발가락이나 꼬리 끝, 눈 주변에 허물이 남는 경우가 있습니다. 이런 상태를 흔히 탈피부전이라고 부르며, 초보 보호자가 가장 많이 겪는 사육 고민 중 하나입니다.",
        "가장 먼저 확인할 것은 습도 부족입니다. 탈피 시기에는 피부가 부드럽게 분리되어야 하는데, 환경이 너무 건조하면 허물이 잘 떨어지지 않을 수 있습니다. 또 은신처 환경이 불안정하거나, 영양 상태가 좋지 않거나, 탈피 전후 스트레스를 많이 받은 경우에도 탈피가 매끄럽지 않을 수 있습니다.",
      ],
      [
        "발가락 끝에 얇은 허물이 링처럼 남아 있거나, 꼬리 끝에 하얗게 붙어 있거나, 눈 주변이 지저분해 보인다면 자세히 관찰해야 합니다. 처음에는 작은 문제처럼 보여도 오래 남으면 해당 부위에 부담이 될 수 있습니다. 특히 발가락은 잔류 탈피를 놓치기 쉬운 부위입니다.",
      ],
      [
        "가장 기본은 적절한 습은신처를 준비하는 것입니다. 내부가 너무 축축하지 않으면서도 탈피에 도움이 될 정도의 습도를 유지하는 것이 중요합니다. 탈피가 시작된 시기에는 핸들링을 줄이고, 환경을 안정적으로 유지하는 것도 도움이 됩니다. 허물을 억지로 잡아당겨 제거하려 하기보다, 먼저 환경 조건을 맞추는 쪽이 안전합니다.",
      ],
      [
        "탈피부전은 대부분 사육 환경 점검에서 답을 찾는 경우가 많습니다. 습도, 은신처, 영양 상태, 스트레스 요인을 함께 확인하며 같은 문제가 반복되지 않도록 루틴을 정리해두는 것이 좋습니다.",
      ],
      [
        "눈 주변에 탈피가 남았거나, 발가락 색이 달라지거나, 같은 문제가 반복된다면 진료를 받아보는 것이 좋습니다. 단순히 한 번의 탈피 실패로 끝나는지, 관리가 필요한 상태인지 구분하는 것이 중요합니다.",
      ],
    ],
    koClosing: [
      "레오파드게코 탈피부전은 대부분 사육 환경 점검에서 답을 찾는 경우가 많습니다.",
      "우리 아이의 생활 리듬과 케어 포인트까지 함께 보고 싶다면, 맞춤 성향 콘텐츠와 연결해보세요.",
    ],
    enSectionBodies: [
      [
        "Leopard geckos shed regularly as they grow. Shedding usually completes without issue, but skin can remain on toes, tail tips, or around the eyes. This is commonly called stuck shed, and it is one of the most frequent care concerns for new owners.",
        "Low humidity is the first thing to check. During shedding, skin needs to separate smoothly, and an overly dry environment can prevent old skin from coming off. Unstable hides, poor nutrition, or stress before and after shedding can also make shedding less clean.",
      ],
      [
        "Watch closely if thin skin rings remain on toe tips, white shed sticks to the tail tip, or the eye area looks messy. What looks minor at first can become a problem if it stays too long. Toes are especially easy to miss.",
      ],
      [
        "Start with a proper humid hide. It should not be soaking wet, but humid enough to support shedding. Reduce handling when shedding begins and keep the habitat stable. Adjust the environment first rather than pulling shed off by force.",
      ],
      [
        "Stuck shed is often solved by reviewing habitat setup. Check humidity, hides, nutrition, and stress together, and build a routine so the same issue does not repeat.",
      ],
      [
        "See a vet if shed remains around the eyes, toe color changes, or the same problem keeps happening. It helps to tell whether this was a one-time shed issue or a condition that needs ongoing care.",
      ],
    ],
    enClosing: [
      "Leopard gecko stuck shed is often solved by reviewing habitat setup.",
      "If you also want to understand daily rhythm and care points, continue with personalized temperament content.",
    ],
  }),
  createReptileOutlineArticle({
    breedSlug: "leopard-gecko",
    slug: "loss-of-appetite-check",
    koTitle: "레오파드게코 식욕부진 원인과 기본 점검법",
    enTitle: "Leopard Gecko Appetite Loss: Basic Checks",
    koSummary: "레오파드게코 식욕이 떨어지는 흔한 이유, 함께 보는 증상, 환경 점검과 진료 기준을 정리했어요.",
    enSummary: "A Leopard Gecko guide to appetite-loss causes, symptoms to check, home environment checks, and vet-care criteria.",
    sections: [
      outlineSection("식욕이 떨어지는 흔한 이유", ["온도 문제", "탈피 전후 변화", "스트레스와 환경 변화"], "Common Reasons Appetite Drops", ["Temperature issues", "Before and after shedding", "Stress and habitat changes"]),
      outlineSection("같이 살펴볼 증상", ["체중 감소", "꼬리 두께 변화", "활동성 저하"], "Symptoms to Check Together", ["Weight loss", "Tail thickness changes", "Lower activity"]),
      outlineSection("집에서 확인할 점", ["핫존과 쿨존 온도", "최근 먹이 변경", "은신처 안정감"], "What to Check at Home", ["Hot-zone and cool-zone temperatures", "Recent feeder changes", "Hide security"]),
      outlineSection("식욕 회복을 돕는 방법", ["환경 안정화", "급여 시간 조절", "스트레스 줄이기"], "Ways to Support Appetite Recovery", ["Stabilize the habitat", "Adjust feeding time", "Reduce stress"]),
      outlineSection("진료가 필요한 경우", ["장기간 거식", "체중 급감", "다른 이상 증상 동반"], "When Vet Care Is Needed", ["Long-term refusal to eat", "Rapid weight loss", "Other abnormal signs together"]),
    ],
    koSectionBodies: [
      [
        "평소 잘 먹던 레오파드게코가 먹이를 거부하면 보호자는 먼저 건강 이상을 걱정하게 됩니다. 하지만 식욕부진은 꼭 질병 때문만은 아니며, 탈피 주기나 온도 변화, 스트레스처럼 비교적 흔한 원인과도 연결될 수 있습니다.",
        "레오파드게코는 온도에 매우 민감합니다. 핫존과 쿨존의 온도 차가 적절하지 않으면 소화와 활동성이 함께 떨어질 수 있습니다. 또 탈피 전후에는 일시적으로 식욕이 줄어들 수 있고, 새로운 환경으로 옮긴 직후나 핸들링이 잦을 때도 먹는 양이 감소할 수 있습니다.",
      ],
      [
        "단순히 먹지 않는 것만이 아니라, 꼬리 두께가 줄었는지, 활동량이 떨어졌는지, 배변이 달라졌는지를 함께 봐야 합니다. 먹는 양이 줄었는데도 체형과 행동이 큰 변화가 없다면 일시적일 수 있지만, 다른 변화가 겹치면 더 신중히 봐야 합니다.",
      ],
      [
        "사육장 온도를 다시 확인하고, 최근 먹이 종류를 바꿨는지 살펴보세요. 은신처가 너무 밝거나 불안정하지 않은지도 중요합니다. 레오파드게코는 안정감이 떨어지면 먹이 반응도 예민해질 수 있습니다.",
      ],
      [
        "환경을 안정적으로 유지하고 급여 시간과 먹이 종류를 기록해보세요. 탈피 전후라면 무리하게 먹이 반응을 끌어내기보다 컨디션이 돌아오는지 차분히 관찰하는 편이 좋습니다.",
      ],
      [
        "장기간 거의 먹지 않거나, 꼬리가 눈에 띄게 가늘어지거나, 무기력·체중 감소 같은 변화가 함께 보이면 진료가 필요합니다. 단순 식욕 기복인지 더 확인이 필요한 상태인지 구분하는 것이 중요합니다.",
      ],
    ],
    koClosing: [
      "레오파드게코 식욕부진은 온도, 탈피, 스트레스처럼 기본 환경에서 시작되는 경우가 많습니다.",
      "사육 루틴과 생활 패턴까지 함께 정리하고 싶다면, 맞춤 케어 콘텐츠와 이어서 활용해보세요.",
    ],
    enSectionBodies: [
      [
        "When a leopard gecko that usually eats well refuses food, owners often worry about illness first. But appetite loss is not always disease-related. It can also come from shedding cycles, temperature shifts, or stress.",
        "Leopard geckos are very sensitive to temperature. If hot-zone and cool-zone temperatures are off, digestion and activity can drop together. Appetite may also fall temporarily before or after shedding, after a move, or with frequent handling.",
      ],
      [
        "Do not look at appetite alone. Check tail thickness, activity level, and stool patterns too. A smaller appetite with no major body or behavior change may be temporary, but overlapping changes need closer attention.",
      ],
      [
        "Recheck enclosure temperatures and whether feeder type recently changed. Make sure hides are not too bright or unstable. When security drops, feeder response can become more sensitive.",
      ],
      [
        "Keep the habitat stable and record feeding times and feeder types. If shedding is near, observe calmly rather than forcing food response before condition returns.",
      ],
      [
        "Vet care is needed if your gecko barely eats for a long time, the tail becomes noticeably thin, or lethargy and weight loss appear together. The key is telling a simple appetite dip from a state that needs further checks.",
      ],
    ],
    enClosing: [
      "Leopard gecko appetite loss often starts with basic environment checks such as temperature, shedding, and stress.",
      "If you want to organize care routines and daily patterns too, continue with personalized care content.",
    ],
  }),
  createReptileOutlineArticle({
    breedSlug: "leopard-gecko",
    slug: "thin-tail-causes",
    koTitle: "레오파드게코 꼬리 가늘어짐 원인과 대처법",
    enTitle: "Leopard Gecko Thin Tail: Causes and Care",
    koSummary: "레오파드게코 꼬리가 건강 지표인 이유, 가늘어지는 원인, 체크포인트와 병원 기준을 정리했어요.",
    enSummary: "A Leopard Gecko guide to why the tail matters, causes of thinning, checkpoints, home support, and vet criteria.",
    sections: [
      outlineSection("꼬리가 건강 지표인 이유", ["에너지 저장 역할", "체력 상태 반영", "질병 신호 가능성"], "Why the Tail Is a Health Indicator", ["Energy storage role", "Reflects body condition", "May signal disease"]),
      outlineSection("꼬리가 가늘어지는 원인", ["먹이 부족", "기생충·소화 문제", "스트레스와 질환"], "Why the Tail Gets Thin", ["Not enough food", "Parasites or digestive issues", "Stress and illness"]),
      outlineSection("함께 보는 체크포인트", ["배변 상태", "식욕 변화", "움직임 감소"], "Checkpoints to Review Together", ["Stool condition", "Appetite changes", "Reduced movement"]),
      outlineSection("집에서 보완하는 방법", ["급여량 재점검", "환경 스트레스 최소화", "체중 기록 습관"], "Home Support Steps", ["Recheck feeding amount", "Minimize habitat stress", "Record weight regularly"]),
      outlineSection("병원에 가야 하는 경우", ["꼬리 감소가 빠를 때", "식욕까지 없을 때", "탈수·무기력 동반 시"], "When to Visit the Vet", ["Tail thinning is rapid", "Appetite is also gone", "Dehydration or lethargy appears"]),
    ],
    koSectionBodies: [
      [
        "레오파드게코의 꼬리는 단순한 외형이 아니라, 컨디션을 살피는 중요한 단서가 됩니다. 평소보다 꼬리가 눈에 띄게 얇아졌다면 먹이 섭취, 스트레스, 소화 상태 등 여러 요소를 함께 점검할 필요가 있습니다.",
      ],
      [
        "가장 흔한 이유는 충분히 먹지 못하는 상황입니다. 먹이를 거부하거나, 먹어도 소화·흡수 과정에 부담이 있으면 체형 변화가 먼저 보일 수 있습니다. 탈피 전후 컨디션 저하, 스트레스, 사육 환경 불안정도 영향을 줄 수 있습니다.",
      ],
      [
        "꼬리만 보는 것이 아니라, 배변 상태와 활동성을 같이 확인해야 합니다. 은신처에서 잘 나오지 않거나, 먹이 반응이 줄었거나, 예전보다 몸 전체가 마른 느낌이 든다면 꼬리 변화와 연결해서 봐야 합니다.",
      ],
      [
        "먹이 반응과 급여 주기를 다시 점검하고, 온도와 은신 환경을 안정적으로 맞춰주세요. 체중과 꼬리 상태를 사진으로 기록해두면 변화 추적에 도움이 됩니다. 스트레스 요인이 있다면 핸들링 빈도도 줄이는 것이 좋습니다.",
      ],
      [
        "꼬리가 빠르게 가늘어지거나, 장기간 먹지 않거나, 무기력과 탈수처럼 보이는 변화가 함께 있으면 진료를 받아보는 것이 안전합니다.",
      ],
    ],
    koClosing: [
      "레오파드게코 꼬리 변화는 “조금 마른 것 같다”로 넘기기보다 전체 컨디션 신호로 보는 것이 좋습니다.",
      "생활 패턴과 케어 포인트를 함께 정리하고 싶다면, 성향 기반 콘텐츠와 연결해보세요.",
    ],
    enSectionBodies: [
      [
        "A leopard gecko's tail is not just appearance. It is an important clue to overall condition. If the tail looks noticeably thinner than usual, check food intake, stress, and digestion together.",
      ],
      [
        "The most common reason is not eating enough. If your gecko refuses food or has trouble digesting and absorbing nutrients, body changes may show in the tail first. Lower condition around shedding, stress, and unstable habitat can also play a role.",
      ],
      [
        "Do not look at the tail alone. Check stool and activity too. If your gecko stays in hides, eats less, or the whole body feels thinner, connect those signs with tail changes.",
      ],
      [
        "Recheck feeder response and feeding schedule, and stabilize temperature and hide setup. Photos of weight and tail shape help track changes. Reduce handling if stress is likely.",
      ],
      [
        "See a vet if the tail thins quickly, eating stops for a long time, or lethargy and possible dehydration appear together.",
      ],
    ],
    enClosing: [
      "Tail changes in leopard geckos are better treated as whole-condition signals than as “maybe a little thin.”",
      "If you want to organize daily patterns and care points together, continue with temperament-based content.",
    ],
  }),
  createReptileOutlineArticle({
    breedSlug: "leopard-gecko",
    slug: "eye-not-opening-care",
    koTitle: "레오파드게코 눈 못 뜰 때 원인과 대응법",
    enTitle: "Leopard Gecko Not Opening Eyes: Causes and Response",
    koSummary: "레오파드게코가 눈을 못 뜰 때 가능한 원인, 보호자가 볼 부분, 조심해야 할 대응과 병원 기준을 정리했어요.",
    enSummary: "A Leopard Gecko guide to closed-eye causes, owner checks, safe response, prevention, and vet-care signs.",
    sections: [
      outlineSection("눈을 못 뜨는 주요 원인", ["잔류 탈피", "이물질 자극", "감염 가능성"], "Main Reasons Eyes Stay Closed", ["Retained shed", "Foreign-body irritation", "Possible infection"]),
      outlineSection("보호자가 먼저 볼 부분", ["눈꺼풀 주변 상태", "탈피 시기 여부", "한쪽만 그런지 양쪽인지"], "What Owners Should Check First", ["Eyelid-area condition", "Whether shedding is near", "One eye or both eyes"]),
      outlineSection("집에서 조심해야 할 대응", ["무리한 제거 금지", "습도 보조", "청결한 사육 환경 유지"], "Safe Home Response", ["Do not force removal", "Support humidity", "Keep the habitat clean"]),
      outlineSection("예방 방법", ["탈피 관리", "바닥재 점검", "정기 관찰 루틴"], "Prevention Methods", ["Shedding care", "Substrate checks", "Regular observation routine"]),
      outlineSection("병원 진료가 필요한 경우", ["눈이 부어 있을 때", "고름·분비물 동반 시", "며칠째 개선이 없을 때"], "When Vet Care Is Needed", ["Eye is swollen", "Pus or discharge appears", "No improvement for several days"]),
    ],
    koSectionBodies: [
      [
        "레오파드게코가 한쪽 또는 양쪽 눈을 잘 못 뜨고 있다면 보호자는 당황하기 쉽습니다. 눈 문제는 비교적 작은 자극부터 탈피 관련 불편, 감염 가능성까지 다양한 원인과 연결될 수 있어 조심스럽게 살펴야 합니다.",
        "가장 흔하게는 잔류 탈피가 눈 주변에 남은 경우를 생각해볼 수 있습니다. 그 외에도 바닥재나 미세한 이물질 자극, 환경 위생 문제, 눈 주변 건조함이 영향을 줄 수 있습니다. 최근 탈피를 했는지도 중요한 단서입니다.",
      ],
      [
        "눈 주위에 허물이 붙어 있는지, 한쪽만 그런지 양쪽 모두 그런지 확인해보세요. 부어 보이거나, 분비물이 있거나, 자꾸 눈을 감고만 있다면 불편이 꽤 클 수 있습니다. 억지로 눈을 벌리려 하기보다는 관찰이 먼저입니다.",
      ],
      [
        "무리하게 제거하거나 만지지 않는 것이 중요합니다. 사육장 청결을 유지하고, 탈피 관련 문제라면 습도와 은신 환경을 먼저 점검해야 합니다. 핸들링은 줄이고 스트레스를 최소화하는 편이 좋습니다.",
      ],
      [
        "탈피 시기와 눈 상태를 정기적으로 관찰하고, 바닥재나 사육장 위생처럼 눈을 자극할 수 있는 요소를 함께 점검하세요. 작은 자극도 반복되면 눈 불편으로 이어질 수 있습니다.",
      ],
      [
        "며칠째 눈을 못 뜨거나, 눈이 부어 있거나, 분비물이 보이면 진료가 필요합니다. 특히 잔류 탈피가 눈 주변에 남은 경우는 보호자가 무리하게 해결하려 하지 않는 편이 안전합니다.",
      ],
    ],
    koClosing: [
      "레오파드게코의 눈 문제는 작은 이상처럼 보여도 빠르게 불편이 커질 수 있습니다.",
      "사육 환경과 루틴까지 함께 점검하고 싶다면, 맞춤 케어 콘텐츠와 연결해보세요.",
    ],
    enSectionBodies: [
      [
        "If a leopard gecko keeps one or both eyes closed, owners understandably get worried. Eye issues can range from minor irritation to shedding discomfort and possible infection, so they need careful review.",
        "Retained shed around the eyes is the most common suspect. Substrate irritation, tiny foreign material, poor hygiene, and dryness around the eyes can also contribute. Recent shedding is an important clue.",
      ],
      [
        "Check whether shed is stuck around the eyes and whether one or both eyes are affected. Swelling, discharge, or constant eye closing can mean significant discomfort. Observe first rather than forcing the eyes open.",
      ],
      [
        "Do not force removal or handle the area roughly. Keep the enclosure clean, and if shedding is involved, review humidity and hide setup first. Reduce handling and minimize stress.",
      ],
      [
        "Watch eye condition regularly around shedding periods, and review substrate and enclosure hygiene that may irritate the eyes. Repeated minor irritation can become ongoing eye discomfort.",
      ],
      [
        "See a vet if the eyes stay closed for days, look swollen, or have discharge. If retained shed is around the eyes, avoid trying to solve it forcefully at home.",
      ],
    ],
    enClosing: [
      "Eye problems in leopard geckos can worsen quickly even when they first look minor.",
      "If you want to review habitat and routine together, continue with personalized care content.",
    ],
  }),
  createReptileOutlineArticle({
    breedSlug: "leopard-gecko",
    slug: "no-poop-checklist",
    koTitle: "레오파드게코 변 안 볼 때 체크해야 할 것",
    enTitle: "Leopard Gecko Not Pooping: What to Check",
    koSummary: "레오파드게코 배변이 줄어드는 이유, 함께 보는 증상, 집에서 확인할 점과 병원 기준을 정리했어요.",
    enSummary: "A Leopard Gecko guide to reduced bowel movements, related signs, home checks, care steps, and vet criteria.",
    sections: [
      outlineSection("배변이 줄어드는 이유", ["온도 부족", "먹이량 감소", "소화 문제와 변비"], "Why Bowel Movements Decrease", ["Low temperature", "Reduced food intake", "Digestive issues and constipation"]),
      outlineSection("함께 확인할 증상", ["복부 팽만", "식욕 저하", "활동성 감소"], "Symptoms to Check Together", ["Belly swelling", "Lower appetite", "Reduced activity"]),
      outlineSection("집에서 점검하는 방법", ["핫존 온도 확인", "수분 상태 점검", "최근 급여 기록 확인"], "How to Check at Home", ["Check hot-zone temperature", "Check hydration", "Review recent feeding records"]),
      outlineSection("완화를 돕는 관리법", ["적정 온도 유지", "스트레스 줄이기", "먹이와 급여 주기 조정"], "Care That May Help", ["Maintain proper temperature", "Reduce stress", "Adjust feeders and feeding schedule"]),
      outlineSection("병원에 가야 하는 경우", ["장기간 배변 없음", "배가 딱딱해 보일 때", "통증 반응이 있을 때"], "When to Visit the Vet", ["No stool for a long time", "Belly looks hard", "Pain response appears"]),
    ],
    koSectionBodies: [
      [
        "레오파드게코의 배변 주기는 먹이량과 온도, 활동성에 따라 달라질 수 있습니다. 그래서 하루이틀 배변이 없다고 무조건 이상이라고 보긴 어렵지만, 평소 패턴과 확실히 다르다면 점검이 필요합니다.",
        "가장 먼저 볼 것은 온도 부족입니다. 적정 온도가 맞지 않으면 소화가 원활하지 않을 수 있습니다. 또 최근 먹는 양이 줄었거나, 탈피 전후로 식욕이 떨어졌다면 배변 간격도 달라질 수 있습니다. 스트레스와 환경 변화 역시 영향을 줍니다.",
      ],
      [
        "배변이 없는 것과 함께 식욕이 떨어졌는지, 배가 불편해 보이는지, 활동량이 줄었는지를 같이 보세요. 복부가 유난히 빵빵해 보이거나, 은신처 안에서만 오래 머문다면 더 신중하게 봐야 합니다.",
      ],
      [
        "핫존 온도가 충분한지 확인하고, 최근 먹이 급여량과 횟수를 기록해보세요. 수분 상태와 환경 스트레스도 함께 체크하는 것이 좋습니다. 사육장 청결 상태가 나쁘지 않은지도 기본적으로 살펴봐야 합니다.",
      ],
      [
        "적정 온도를 유지하고 스트레스를 줄이며, 먹이 종류와 급여 주기를 다시 확인해보세요. 배변 문제는 먹이보다 환경에서 원인을 찾게 되는 경우가 많습니다.",
      ],
      [
        "장기간 배변이 없고 식욕까지 줄었거나, 배가 딱딱해 보이거나, 움직임이 둔해졌다면 진료를 권합니다.",
      ],
    ],
    koClosing: [
      "레오파드게코 배변 문제는 먹이보다 환경에서 원인을 찾게 되는 경우가 많습니다.",
      "기록 중심의 케어 루틴을 만들고 싶다면, 생활 패턴 콘텐츠와 함께 정리해보세요.",
    ],
    enSectionBodies: [
      [
        "Leopard gecko bowel patterns vary with food intake, temperature, and activity. Missing stool for a day or two is not always abnormal, but a clear change from your gecko's usual pattern needs review.",
        "Low temperature is the first thing to check. Poor temperature can slow digestion. Reduced food intake, lower appetite around shedding, stress, and habitat changes can also shift bowel timing.",
      ],
      [
        "Check appetite, belly comfort, and activity together with stool changes. If the belly looks unusually swollen or your gecko stays in hides for long periods, be more cautious.",
      ],
      [
        "Confirm hot-zone temperature and record recent feeding amount and frequency. Check hydration and environmental stress, and review basic enclosure cleanliness.",
      ],
      [
        "Maintain proper temperature, reduce stress, and recheck feeder type and feeding schedule. Bowel issues in leopard geckos are often traced back to habitat rather than food alone.",
      ],
      [
        "See a vet if there is no stool for a long time along with lower appetite, a hard-looking belly, or sluggish movement.",
      ],
    ],
    enClosing: [
      "Bowel issues in leopard geckos are often traced back to habitat rather than food alone.",
      "If you want a record-based care routine, organize it together with daily-pattern content.",
    ],
  }),
  createReptileOutlineArticle({
    breedSlug: "crested-gecko",
    slug: "shedding-failure-care",
    koTitle: "크레스티드게코 탈피 실패 원인과 관리법",
    enTitle: "Crested Gecko Shedding Failure: Causes and Care",
    koSummary: "크레스티드게코 탈피 실패 원인, 잔류 탈피 부위, 집에서 관리하는 방법과 병원 기준을 정리했어요.",
    enSummary: "A Crested Gecko guide to shedding failure causes, retained-shed areas, home care, prevention, and vet-care signs.",
    sections: [
      outlineSection("탈피 실패가 생기는 이유", ["습도 부족", "영양 불균형", "스트레스와 환경 문제"], "Why Shedding Failure Happens", ["Low humidity", "Nutrition imbalance", "Stress and habitat issues"]),
      outlineSection("주의해야 할 잔류 탈피 부위", ["발가락", "꼬리 끝", "눈 주변"], "Retained Shed Areas to Watch", ["Toes", "Tail tip", "Around eyes"]),
      outlineSection("집에서 관리하는 방법", ["분무와 습도 조절", "탈피 도움 환경 만들기", "억지 제거 금지 이유"], "Home Care Methods", ["Misting and humidity control", "Create a shedding-support environment", "Why forced removal is unsafe"]),
      outlineSection("예방 포인트", ["적정 습도 유지", "은신처와 수직 구조물 배치", "꾸준한 상태 기록"], "Prevention Points", ["Maintain proper humidity", "Arrange hides and vertical structures", "Record condition consistently"]),
      outlineSection("병원 진료가 필요한 경우", ["반복적 탈피 실패", "발가락 순환 문제 의심", "눈 문제 동반 시"], "When Vet Care Is Needed", ["Repeated shedding failure", "Possible toe circulation issue", "Eye issues appear together"]),
    ],
    koSectionBodies: [
      [
        "크레스티드게코는 탈피 과정에서 몸 전체가 한 번에 바뀌는 것처럼 보여도, 실제로는 환경 영향을 많이 받습니다. 발가락이나 꼬리 끝, 눈 주변에 허물이 남는다면 탈피 실패를 의심할 수 있습니다.",
        "첫 번째는 역시 습도 문제입니다. 크레스티드게코는 건조한 환경에 오래 노출되면 탈피가 깔끔하게 진행되지 않을 수 있습니다. 여기에 스트레스, 영양 불균형, 사육장 구조의 불편함이 더해지면 같은 문제가 반복될 수 있습니다.",
      ],
      [
        "발가락 끝은 잔류 탈피가 남기 쉬운 대표 부위입니다. 꼬리 끝이나 눈 주위도 함께 살펴야 하며, 특히 벽을 잘 타지 못하게 되는 변화가 있다면 발바닥 상태도 확인해볼 필요가 있습니다.",
      ],
      [
        "분무 루틴을 점검해 적절한 습도를 유지하고, 탈피가 편한 은신 공간과 수직 구조물을 마련하는 것이 좋습니다. 탈피 중인 개체를 과하게 만지지 않고, 환경을 안정적으로 유지하는 것만으로도 도움이 되는 경우가 많습니다.",
      ],
      [
        "적정 습도를 유지하고 은신처와 수직 구조물을 안정적으로 배치하세요. 탈피 상태를 꾸준히 기록해두면 반복되는 부위나 환경 문제를 찾는 데 도움이 됩니다.",
      ],
      [
        "같은 부위에 반복적으로 탈피가 남거나, 발가락 상태가 이상해 보이거나, 눈 주변 문제까지 동반된다면 진료가 필요합니다.",
      ],
    ],
    koClosing: [
      "크레스티드게코 탈피 실패는 대개 환경 세팅을 다시 보는 것에서 출발합니다.",
      "사육 루틴과 아이 성향을 함께 정리하고 싶다면, 맞춤 관리 콘텐츠와 연결해보세요.",
    ],
    enSectionBodies: [
      [
        "Crested geckos may look like they shed all at once, but the process depends heavily on environment. Shed stuck on toes, tail tips, or around the eyes suggests shedding failure.",
        "Humidity is usually the first issue. Long exposure to dry conditions can prevent clean shedding. Stress, nutrition imbalance, and awkward enclosure setup can make the same problem repeat.",
      ],
      [
        "Toe tips are a common place for retained shed. Also check tail tips and eye areas. If climbing becomes harder, toe-pad condition deserves extra attention.",
      ],
      [
        "Review misting routine and maintain proper humidity. Provide hides and vertical structures that support shedding, and avoid excessive handling while shedding is in progress.",
      ],
      [
        "Keep humidity stable and arrange hides and climbing structures consistently. Recording shed condition helps identify repeating problem areas or habitat issues.",
      ],
      [
        "See a vet if shed keeps returning in the same area, toe condition looks abnormal, or eye issues appear together.",
      ],
    ],
    enClosing: [
      "Crested gecko shedding failure usually starts with reviewing habitat setup again.",
      "If you want to organize care routines and temperament together, continue with personalized care content.",
    ],
  }),
  createReptileOutlineArticle({
    breedSlug: "crested-gecko",
    slug: "loss-of-appetite-care",
    koTitle: "크레스티드게코 식욕부진 원인과 대처법",
    enTitle: "Crested Gecko Appetite Loss: Causes and Care",
    koSummary: "크레스티드게코가 먹지 않는 이유, 같이 봐야 하는 이상 신호, 집에서 점검할 항목과 병원 기준을 정리했어요.",
    enSummary: "A Crested Gecko guide to appetite-loss causes, warning signs, home checks, recovery support, and vet criteria.",
    sections: [
      outlineSection("먹지 않는 이유는 무엇일까", ["온도와 습도 문제", "탈피 전후 변화", "이사·핸들링 스트레스"], "Why They May Stop Eating", ["Temperature and humidity issues", "Before and after shedding", "Moving or handling stress"]),
      outlineSection("같이 봐야 하는 이상 신호", ["체중 감소", "벽 타기 감소", "무기력"], "Warning Signs to Check Together", ["Weight loss", "Less climbing", "Lethargy"]),
      outlineSection("집에서 점검할 항목", ["온도 범위 확인", "은신처 안정성", "먹이 종류와 신선도"], "Home Checklist", ["Check temperature range", "Hide security", "Food type and freshness"]),
      outlineSection("식욕 회복을 돕는 방법", ["환경 안정화", "급여 시간 조절", "과도한 핸들링 줄이기"], "Ways to Support Appetite Recovery", ["Stabilize habitat", "Adjust feeding time", "Reduce excessive handling"]),
      outlineSection("병원에 가야 하는 경우", ["장기간 거식", "체중 급감", "탈수 징후 동반"], "When to Visit the Vet", ["Long-term refusal to eat", "Rapid weight loss", "Dehydration signs appear"]),
    ],
    koSectionBodies: [
      [
        "크레스티드게코는 환경 변화에 민감한 편이라, 식욕부진이 나타났을 때 단순 입맛 문제보다 사육장 조건을 먼저 확인하는 것이 좋습니다. 특히 온도와 습도, 핸들링 스트레스가 영향을 주는 경우가 많습니다.",
        "온도가 너무 낮거나 높으면 컨디션과 먹이 반응이 함께 달라질 수 있습니다. 탈피 전후엔 일시적으로 먹는 양이 줄기도 하고, 새로운 환경이나 잦은 핸들링 때문에 안정감을 잃었을 때도 비슷한 변화가 나타날 수 있습니다.",
      ],
      [
        "평소보다 벽을 덜 타거나, 은신처에만 오래 머물거나, 체중이 줄고 무기력해 보이면 식욕부진을 더 신중하게 봐야 합니다. 단순히 “오늘 안 먹는다”보다 며칠간의 흐름을 같이 보는 것이 중요합니다.",
      ],
      [
        "사육장 온습도를 다시 확인하고, 먹이의 상태나 급여 시간을 점검하세요. 핸들링을 줄이고 은신처 안정감을 높여 스트레스를 줄이는 것도 도움이 됩니다. 먹이를 자주 바꾸기보다 기본 조건을 먼저 안정시키는 편이 좋습니다.",
      ],
      [
        "환경을 안정적으로 유지하고 급여 시간을 일정하게 맞춰보세요. 과도한 핸들링을 줄이는 것만으로도 먹이 반응이 회복되는 경우가 있습니다.",
      ],
      [
        "장기간 거의 먹지 않거나, 체중 감소가 보이거나, 탈수·무기력 같은 변화가 동반되면 진료를 받는 것이 안전합니다.",
      ],
    ],
    koClosing: [
      "크레스티드게코 식욕부진은 환경과 스트레스 점검에서 실마리를 찾는 경우가 많습니다.",
      "우리 아이의 루틴과 케어 패턴을 더 체계적으로 정리하고 싶다면, 맞춤 콘텐츠와 이어보세요.",
    ],
    enSectionBodies: [
      [
        "Crested geckos are sensitive to environmental change, so when appetite drops, check enclosure conditions before assuming it is just pickiness. Temperature, humidity, and handling stress are common factors.",
        "If temperature is too low or too high, condition and feeder response can change together. Appetite may fall temporarily around shedding, after a move, or when frequent handling reduces security.",
      ],
      [
        "Take appetite loss more seriously if climbing decreases, your gecko stays in hides, or weight drops with lethargy. Look at the pattern over several days rather than one skipped meal.",
      ],
      [
        "Recheck enclosure temperature and humidity, feeder freshness, and feeding times. Reduce handling and improve hide security. Stabilize basics before changing food too often.",
      ],
      [
        "Keep the habitat stable and feeding times consistent. Simply reducing excessive handling can restore feeder response in some cases.",
      ],
      [
        "See a vet if your gecko barely eats for a long time, loses weight, or shows dehydration or lethargy together.",
      ],
    ],
    enClosing: [
      "Crested gecko appetite loss is often found through environment and stress checks.",
      "If you want a more structured care routine, continue with personalized content.",
    ],
  }),
  createReptileOutlineArticle({
    breedSlug: "crested-gecko",
    slug: "cannot-climb-walls",
    koTitle: "크레스티드게코 벽 못 타는 이유와 확인법",
    enTitle: "Why a Crested Gecko Cannot Climb Walls",
    koSummary: "크레스티드게코가 벽을 못 타는 이유, 발가락과 탈피 체크포인트, 집에서 할 조치와 병원 기준을 정리했어요.",
    enSummary: "A Crested Gecko guide to climbing trouble causes, toe and shed checks, home steps, warning signs, and vet criteria.",
    sections: [
      outlineSection("원래 잘 타던 아이가 못 타는 이유", ["탈피 문제", "발바닥 오염", "습도·컨디션 저하"], "Why a Good Climber May Stop Climbing", ["Shedding issues", "Dirty toe pads", "Humidity or condition decline"]),
      outlineSection("먼저 확인할 체크포인트", ["발가락 상태", "최근 탈피 여부", "사육장 유리면 상태"], "First Checkpoints", ["Toe condition", "Recent shedding", "Enclosure glass condition"]),
      outlineSection("집에서 할 수 있는 조치", ["습도 조정", "환경 청결 유지", "스트레스 요인 줄이기"], "Home Steps", ["Adjust humidity", "Keep the environment clean", "Reduce stress factors"]),
      outlineSection("벽 못 탐이 위험 신호인 경우", ["활동성까지 줄어든 경우", "먹지 않는 경우", "탈피 실패 동반 시"], "When Climbing Trouble Is a Warning Sign", ["Activity is also reduced", "Not eating", "Shedding failure appears together"]),
      outlineSection("병원 진료가 필요한 경우", ["오래 지속될 때", "발 상태가 이상할 때", "다른 신체 이상이 보일 때"], "When Vet Care Is Needed", ["It continues for a long time", "Feet look abnormal", "Other body abnormalities appear"]),
    ],
    koSectionBodies: [
      [
        "크레스티드게코의 대표적인 특징 중 하나는 수직 구조물을 잘 타는 능력입니다. 그래서 평소 잘 오르던 아이가 갑자기 벽을 잘 못 탄다면, 단순 기분 변화보다 몸 상태나 사육 환경 변화를 먼저 생각해봐야 합니다.",
        "발가락 주변에 탈피가 남아 접지력이 떨어졌을 수 있습니다. 사육장 유리면이 너무 더럽거나, 습도 상태가 맞지 않거나, 전반적인 컨디션이 떨어져도 비슷한 행동이 나타날 수 있습니다. 발바닥 자체의 상태를 보는 것도 중요합니다.",
      ],
      [
        "벽을 못 타는 것과 함께 먹는 양이 줄었는지, 활동성이 감소했는지, 최근 탈피가 있었는지 확인해보세요. 단순히 “미끄러지는 것 같다”는 느낌도 중요한 단서가 됩니다.",
      ],
      [
        "유리면과 내부 구조물을 청결하게 유지하고, 적절한 습도를 맞춰 주세요. 최근 탈피가 있었다면 발가락 잔류 탈피가 없는지 관찰하고, 과한 핸들링은 줄여 안정감을 주는 편이 좋습니다.",
      ],
      [
        "벽을 못 타는 상태와 함께 활동성이 줄거나 먹이 반응이 떨어지거나 탈피 실패가 동반된다면 더 신중하게 봐야 합니다. 크레스티드게코의 벽 타기 변화는 사육 환경 이상을 알려주는 꽤 민감한 신호일 수 있습니다.",
      ],
      [
        "벽을 못 타는 상태가 오래 지속되거나, 발 상태가 이상해 보이거나, 식욕과 활동성까지 떨어졌다면 진료를 고려해야 합니다.",
      ],
    ],
    koClosing: [
      "크레스티드게코의 벽 타기 변화는 사육 환경 이상을 알려주는 꽤 민감한 신호일 수 있습니다.",
      "환경 세팅과 생활 패턴을 함께 정리하고 싶다면, 맞춤 케어 콘텐츠와 연결해보세요.",
    ],
    enSectionBodies: [
      [
        "One hallmark of crested geckos is strong climbing ability. If a gecko that usually climbs well suddenly struggles on walls, think about body condition or habitat changes before dismissing it as mood.",
        "Retained shed around the toes can reduce grip. Dirty glass, poor humidity, or overall condition decline can cause similar behavior. Toe-pad condition matters.",
      ],
      [
        "Check whether food intake and activity also dropped, and whether shedding happened recently. A sense that your gecko is “slipping” can itself be an important clue.",
      ],
      [
        "Keep glass and interior surfaces clean and maintain proper humidity. If shedding was recent, watch for retained shed on toes and reduce handling to restore security.",
      ],
      [
        "Be more cautious if climbing trouble comes with lower activity, reduced appetite, or shedding failure. Climbing changes can be a sensitive signal of habitat or health issues.",
      ],
      [
        "Consider vet care if climbing trouble lasts, feet look abnormal, or appetite and activity drop together.",
      ],
    ],
    enClosing: [
      "Changes in crested gecko climbing can be a sensitive signal of habitat issues.",
      "If you want to organize habitat setup and daily patterns together, continue with personalized care content.",
    ],
  }),
  createReptileOutlineArticle({
    breedSlug: "bearded-dragon",
    slug: "loss-of-appetite-check-guide",
    koTitle: "비어디드래곤 식욕부진 원인과 점검 가이드",
    enTitle: "Bearded Dragon Appetite Loss: Check Guide",
    koSummary: "비어디드래곤이 먹지 않는 이유, 함께 확인할 증상, 환경 요소와 병원 기준을 정리했어요.",
    enSummary: "A Bearded Dragon guide to appetite-loss causes, symptoms, habitat checks, recovery care, and vet criteria.",
    sections: [
      outlineSection("비어디드래곤이 먹지 않는 이유", ["온도 문제", "UVB 부족", "탈피·스트레스 영향"], "Why Bearded Dragons May Stop Eating", ["Temperature issues", "Lack of UVB", "Shedding and stress effects"]),
      outlineSection("함께 확인해야 할 증상", ["무기력", "눈 감고 있음", "배변 감소"], "Symptoms to Check Together", ["Lethargy", "Eyes closed often", "Reduced bowel movements"]),
      outlineSection("집에서 확인할 환경 요소", ["바스킹존 온도", "조명 교체 주기", "은신 공간과 스트레스"], "Habitat Factors to Check", ["Basking-zone temperature", "Lighting replacement schedule", "Hides and stress"]),
      outlineSection("식욕 회복을 위한 관리", ["환경 재세팅", "먹이 종류 점검", "수분 공급"], "Care to Support Appetite", ["Reset the environment", "Review food types", "Provide hydration"]),
      outlineSection("병원에 가야 하는 경우", ["장기간 거식", "급격한 체중 감소", "눈을 계속 감고 있을 때"], "When to Visit the Vet", ["Long-term refusal to eat", "Rapid weight loss", "Eyes stay closed"]),
    ],
    koSectionBodies: [
      [
        "비어디드래곤은 비교적 표현이 분명한 편이지만, 식욕이 줄면 보호자가 바로 불안을 느끼게 됩니다. 다만 식욕부진은 단순한 입맛 변화보다 조명, 온도, 탈피, 스트레스 같은 사육 조건과 밀접하게 연결될 수 있습니다.",
        "비어디드래곤은 바스킹존 온도와 UVB가 매우 중요합니다. 온도가 부족하거나 조명 상태가 맞지 않으면 활동성과 식욕이 함께 떨어질 수 있습니다. 최근 조명을 오래 교체하지 않았거나, 계절 변화로 온도 관리가 달라졌다면 먼저 점검해야 합니다.",
      ],
      [
        "식욕 감소와 함께 무기력, 배변 감소, 눈을 자주 감고 있는 모습이 보이면 더 자세히 봐야 합니다. 탈피 전후로 잠시 먹는 양이 줄 수는 있지만, 다른 이상이 함께 있다면 단순한 변화로 넘기지 않는 것이 좋습니다.",
      ],
      [
        "바스킹존과 쿨존 온도를 다시 측정하고, 조명 교체 주기와 설치 위치를 확인하세요. 핸들링을 줄이고, 먹이 종류와 급여 시간을 기록해 반응을 비교해보는 것도 도움이 됩니다.",
      ],
      [
        "환경을 먼저 재세팅하고 먹이 종류와 급여 시간을 점검해보세요. 수분 공급 상태도 함께 확인하면 식욕 회복 흐름을 살피는 데 도움이 됩니다.",
      ],
      [
        "장기간 거의 먹지 않거나, 체중이 줄거나, 눈을 계속 감고 있거나, 무기력해 보이면 진료를 권합니다.",
      ],
    ],
    koClosing: [
      "비어디드래곤 식욕부진은 사육 환경 재점검이 가장 먼저입니다.",
      "사육 루틴과 상태 기록을 체계화하고 싶다면, 맞춤 관리 콘텐츠와 이어서 활용해보세요.",
    ],
    enSectionBodies: [
      [
        "Bearded dragons often show clear behavior, so appetite loss can feel alarming quickly. But reduced eating is often tied to lighting, temperature, shedding, and stress rather than taste alone.",
        "Basking-zone temperature and UVB are especially important. If temperatures are low or lighting is inadequate, activity and appetite can fall together. Review bulb replacement timing and seasonal temperature changes first.",
      ],
      [
        "Look more closely if appetite loss comes with lethargy, reduced bowel movements, or frequent eye closing. A short appetite dip around shedding can happen, but overlapping signs should not be ignored.",
      ],
      [
        "Measure basking and cool-zone temperatures again, and review lighting replacement schedule and placement. Reduce handling and record feeder type and feeding times to compare response.",
      ],
      [
        "Reset the habitat first, then review food type and feeding schedule. Checking hydration also helps track appetite recovery.",
      ],
      [
        "See a vet if your dragon barely eats for a long time, loses weight, keeps eyes closed, or looks lethargic.",
      ],
    ],
    enClosing: [
      "Bearded dragon appetite loss should start with a habitat reset.",
      "If you want structured care routines and condition records, continue with personalized care content.",
    ],
  }),
  createReptileOutlineArticle({
    breedSlug: "bearded-dragon",
    slug: "constipation-care",
    koTitle: "비어디드래곤 변비 원인과 관리법",
    enTitle: "Bearded Dragon Constipation: Causes and Care",
    koSummary: "비어디드래곤 변비의 주요 원인, 의심 증상, 집에서 해볼 수 있는 관리와 병원 기준을 정리했어요.",
    enSummary: "A Bearded Dragon guide to constipation causes, signs, home care, prevention, and when vet care is needed.",
    sections: [
      outlineSection("변비가 생기는 주요 원인", ["수분 부족", "온도 부족", "먹이 구성 문제"], "Main Causes of Constipation", ["Low hydration", "Low temperature", "Diet composition issues"]),
      outlineSection("변비 의심 증상", ["배변 횟수 감소", "배 팽만", "식욕 저하"], "Possible Constipation Signs", ["Fewer bowel movements", "Belly swelling", "Lower appetite"]),
      outlineSection("집에서 해볼 수 있는 관리", ["적정 온도 맞추기", "수분 공급 늘리기", "먹이 구성 조절"], "Home Care Steps", ["Set proper temperature", "Increase hydration", "Adjust food composition"]),
      outlineSection("예방하는 방법", ["규칙적인 온도 관리", "균형 잡힌 급여", "상태 기록 습관"], "Prevention Methods", ["Consistent temperature management", "Balanced feeding", "Condition-recording habit"]),
      outlineSection("병원 방문이 필요한 경우", ["장기간 배변 없음", "힘을 주는데 못 보는 경우", "무기력과 식욕부진 동반 시"], "When a Vet Visit Is Needed", ["No stool for a long time", "Straining without stool", "Lethargy and appetite loss together"]),
    ],
    koSectionBodies: [
      [
        "비어디드래곤의 배변 문제는 먹이만의 문제가 아니라 수분, 온도, 활동량, 먹이 구성과 함께 봐야 합니다. 며칠 배변이 없다고 바로 심각하다고 단정할 수는 없지만, 평소보다 확실히 달라졌다면 원인을 하나씩 점검할 필요가 있습니다.",
        "수분 섭취 부족, 바스킹존 온도 부족, 먹이 구성 불균형이 대표적인 원인으로 꼽힙니다. 활동량이 줄거나 컨디션이 떨어졌을 때도 배변 패턴이 달라질 수 있습니다. 최근 식단 변화가 있었다면 함께 보는 것이 좋습니다.",
      ],
      [
        "배변이 줄면서 식욕이 떨어지거나, 복부가 불편해 보이거나, 무기력해 보이면 더 신중하게 봐야 합니다. 힘을 주는 듯한 자세를 반복하는지, 먹고도 한참 배변이 없는지 같은 흐름도 중요합니다.",
      ],
      [
        "적정 온도를 다시 맞추고, 수분 공급을 점검하세요. 먹이 구성을 너무 단조롭게 하지 말고 현재 반응을 기록해보는 것이 도움이 됩니다. 평소보다 움직임이 적다면 환경 자극을 통해 활동성을 조금 높여보는 것도 방법입니다.",
      ],
      [
        "규칙적인 온도 관리와 균형 잡힌 급여, 상태 기록 습관이 예방의 기본입니다. 먹이뿐 아니라 온도와 수분, 활동성까지 함께 봐야 해결 실마리가 보입니다.",
      ],
      [
        "장기간 배변이 없고 식욕 저하나 무기력까지 동반되면 진료를 받아보는 것이 좋습니다. 복부 불편감이 커 보이거나 상태가 빠르게 달라질 때는 더 미루지 않는 편이 안전합니다.",
      ],
    ],
    koClosing: [
      "비어디드래곤 변비는 먹이뿐 아니라 온도와 수분, 활동성까지 함께 봐야 해결 실마리가 보입니다.",
      "우리 아이의 사육 패턴과 관리 포인트를 더 구조적으로 정리하고 싶다면, 맞춤 케어 콘텐츠와 연결해보세요.",
    ],
    enSectionBodies: [
      [
        "Bearded dragon bowel issues are not about food alone. Hydration, temperature, activity, and diet composition all matter. A few days without stool is not always serious, but a clear change from the usual pattern needs review.",
        "Low hydration, insufficient basking temperature, and unbalanced diet are common causes. Reduced activity or lower condition can also change bowel patterns. Recent diet changes should be reviewed together.",
      ],
      [
        "Be more cautious if fewer bowel movements come with lower appetite, belly discomfort, or lethargy. Repeated straining posture or long gaps after eating are also important patterns.",
      ],
      [
        "Reset proper temperature and review hydration. Avoid an overly narrow diet and record current response. If movement is low, modest environmental stimulation may help activity.",
      ],
      [
        "Consistent temperature management, balanced feeding, and condition records are the basics of prevention. Clues often appear when temperature, hydration, and activity are reviewed together.",
      ],
      [
        "See a vet if there is no stool for a long time along with appetite loss or lethargy. Do not delay if belly discomfort looks severe or condition worsens quickly.",
      ],
    ],
    enClosing: [
      "Bearded dragon constipation is often clearer when temperature, hydration, and activity are reviewed together.",
      "If you want a more structured care pattern, continue with personalized care content.",
    ],
  }),
];

export function getBreedGuideArticles(breedSlug: string) {
  return BREED_GUIDE_ARTICLES.filter((article) => article.breedSlug === breedSlug);
}

export function getBreedGuideArticle(breedSlug: string, articleSlug: string) {
  return BREED_GUIDE_ARTICLES.find((article) => article.breedSlug === breedSlug && article.slug === articleSlug) ?? null;
}
