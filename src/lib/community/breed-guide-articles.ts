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
];

export function getBreedGuideArticles(breedSlug: string) {
  return BREED_GUIDE_ARTICLES.filter((article) => article.breedSlug === breedSlug);
}

export function getBreedGuideArticle(breedSlug: string, articleSlug: string) {
  return BREED_GUIDE_ARTICLES.find((article) => article.breedSlug === breedSlug && article.slug === articleSlug) ?? null;
}
