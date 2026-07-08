import { ELEMENT_META } from "../elements";
import { dominantElementLabel } from "../pet-lucky-scores";
import type { ElementKey, Locale, Species } from "../types";
import type { ZodiacSignKey } from "./signs";

const ZODIAC_LABEL: Record<ZodiacSignKey, { ko: string; en: string }> = {
  aries: { ko: "양자리", en: "Aries" },
  taurus: { ko: "황소자리", en: "Taurus" },
  gemini: { ko: "쌍둥이자리", en: "Gemini" },
  cancer: { ko: "게자리", en: "Cancer" },
  leo: { ko: "사자자리", en: "Leo" },
  virgo: { ko: "처녀자리", en: "Virgo" },
  libra: { ko: "천칭자리", en: "Libra" },
  scorpio: { ko: "전갈자리", en: "Scorpio" },
  sagittarius: { ko: "사수자리", en: "Sagittarius" },
  capricorn: { ko: "염소자리", en: "Capricorn" },
  aquarius: { ko: "물병자리", en: "Aquarius" },
  pisces: { ko: "물고기자리", en: "Pisces" },
};

function fmtEl(el: ElementKey, locale: Locale): string {
  return dominantElementLabel(el, locale);
}

const SPECIES_KO: Record<Species, string> = { dog: "강아지", cat: "고양이", reptile: "렙타일", other: "그외친구" };
const SPECIES_EN: Record<Species, string> = { dog: "pup", cat: "cat", reptile: "reptile", other: "pet" };

const SIGN_DEPTH: Record<
  ZodiacSignKey,
  {
    ko: { temperament: string; bond: string; care: string };
    en: { temperament: string; bond: string; care: string };
  }
> = {
  aries: {
    ko: {
      temperament: "반응이 빠르고 먼저 움직이는 별자리예요. 새로운 냄새, 낯선 소리, 문밖의 작은 변화에도 즉각적으로 관심을 보이며 놀이가 시작되면 에너지를 아낌없이 씁니다.",
      bond: "집사와의 관계에서는 '같이 해보자'는 신호에 가장 잘 반응해요. 짧은 칭찬, 명확한 손짓, 바로 이어지는 보상이 있으면 자신감이 빠르게 올라갑니다.",
      care: "흥분이 오래 이어지면 점프나 돌진으로 이어질 수 있어요. 산책 전후로 짧은 대기 훈련을 넣어주면 용감함은 살리고 성급함은 부드럽게 다듬을 수 있습니다.",
    },
    en: {
      temperament: "Fast to react and first to move, this sign notices new scents, sudden sounds, and tiny changes outside the door. Once play begins, the energy comes out generously.",
      bond: "In the pet-parent bond, Aries responds best to a clear 'let's do this' signal. Short praise, crisp gestures, and immediate rewards quickly raise confidence.",
      care: "If excitement runs too long, it can turn into jumping or dashing. Add brief pause training before and after walks to keep the bravery while softening the impulsiveness.",
    },
  },
  taurus: {
    ko: {
      temperament: "느긋하지만 자기만의 속도가 분명한 별자리예요. 익숙한 자리, 포근한 담요, 정해진 식사 시간처럼 예측 가능한 환경에서 안정감이 크게 올라갑니다.",
      bond: "집사에게 마음을 열 때도 천천히 깊어지는 타입입니다. 같은 루틴을 반복해주면 '이 사람은 믿어도 된다'는 확신이 쌓이고 애정 표현도 꾸준해져요.",
      care: "간식과 편안함을 좋아하는 만큼 과식이나 활동 부족은 조심해야 해요. 짧은 산책, 노즈워크, 천천히 씹는 간식으로 안정과 운동의 균형을 맞춰주세요.",
    },
    en: {
      temperament: "Slow but very clear about their own pace, Taurus feels safest with familiar spots, cozy blankets, and predictable mealtimes.",
      bond: "Trust grows slowly and deeply. Repeated routines help them decide, 'this person is safe,' and affection becomes steady rather than flashy.",
      care: "Because comfort and snacks are extra appealing, watch overeating and low activity. Balance coziness with short walks, nose work, and slow-chew treats.",
    },
  },
  gemini: {
    ko: {
      temperament: "호기심이 빠르게 번지는 별자리예요. 장난감 하나도 여러 방식으로 탐색하고, 창밖 풍경이나 집사의 목소리 변화에도 반응이 다양합니다.",
      bond: "말을 걸어주고 선택지를 주면 교감이 살아나요. 같은 놀이만 반복하기보다 짧은 트릭, 숨은 간식 찾기, 이름 부르기 놀이처럼 변화가 있는 시간이 잘 맞습니다.",
      care: "자극이 너무 많으면 집중이 흩어질 수 있어요. 놀이 시간은 짧게 나누고, 쉬는 공간은 조용하게 만들어주면 밝은 호기심이 안정적으로 유지됩니다.",
    },
    en: {
      temperament: "Curiosity spreads quickly with Gemini. One toy can be explored in several ways, and even window scenes or changes in your voice can bring varied reactions.",
      bond: "Conversation and choices bring the bond alive. Short tricks, hidden treats, and name-call games fit better than repeating one game for too long.",
      care: "Too much stimulation can scatter focus. Split play into short rounds and keep the rest area quiet so the bright curiosity stays balanced.",
    },
  },
  cancer: {
    ko: {
      temperament: "감정의 온도를 섬세하게 읽는 별자리예요. 집 안 분위기, 집사의 목소리, 낯선 사람의 움직임을 예민하게 느끼며 안전하다고 판단한 공간을 무척 소중히 여깁니다.",
      bond: "곁에 머무는 시간이 가장 큰 애정 표현입니다. 무릎 옆, 침대 아래, 문 근처처럼 집사를 지켜볼 수 있는 자리를 좋아하고 부드러운 스킨십에 마음이 열려요.",
      care: "환경 변화가 클 때는 적응 시간이 필요합니다. 방문자나 새 물건은 천천히 소개하고, 숨을 수 있는 포근한 공간을 마련해주면 감정 기복이 줄어듭니다.",
    },
    en: {
      temperament: "Cancer reads emotional temperature with care. Home atmosphere, your voice, and unfamiliar movement all matter, and safe spaces become deeply precious.",
      bond: "Staying close is the biggest love language. A spot near your lap, under the bed, or by the door lets them watch you and open up to gentle touch.",
      care: "Big changes need time. Introduce visitors or new objects slowly, and offer a cozy hiding place to soften emotional ups and downs.",
    },
  },
  leo: {
    ko: {
      temperament: "존재감이 또렷한 별자리예요. 칭찬을 받으면 표정과 걸음이 달라지고, 관심을 받는 순간 자신만의 매력을 더 크게 보여줍니다.",
      bond: "집사가 즐겁게 반응해줄수록 애정 표현이 풍성해져요. 사진 찍기, 하이파이브, 이름을 불러주는 짧은 무대 시간이 좋은 교감 루틴이 됩니다.",
      care: "주목받고 싶은 마음이 지나치면 요구성 행동으로 이어질 수 있어요. 잘한 순간은 크게 칭찬하되, 쉬는 시간과 혼자 노는 시간도 자연스럽게 알려주세요.",
    },
    en: {
      temperament: "Leo has a clear presence. Praise changes the face and the walk, and attention brings out an even brighter charm.",
      bond: "The more joyfully you respond, the richer the affection becomes. Photos, high-fives, and name-call moments make excellent bonding rituals.",
      care: "A love of attention can become demanding behavior. Celebrate wins warmly, while gently teaching rest time and independent play.",
    },
  },
  virgo: {
    ko: {
      temperament: "작은 차이를 잘 알아차리는 별자리예요. 밥그릇 위치, 화장실 상태, 산책길의 냄새 변화처럼 디테일한 요소가 컨디션에 영향을 줍니다.",
      bond: "정돈된 루틴 속에서 신뢰가 자랍니다. 집사가 차분하게 관찰해주고 필요한 것을 제때 챙겨주면 조용하지만 깊은 안정감을 느껴요.",
      care: "예민함이 걱정으로 번지지 않도록 갑작스러운 변화는 줄여주세요. 브러싱, 발 상태 체크, 사료 전환 기록처럼 섬세한 케어가 특히 잘 맞습니다.",
    },
    en: {
      temperament: "Virgo notices small differences: bowl placement, litter or potty condition, and scent changes on the walk can all affect the day.",
      bond: "Trust grows inside tidy routines. Calm observation and timely care make them feel quietly but deeply secure.",
      care: "Reduce sudden changes so sensitivity does not turn into worry. Brushing, paw checks, and careful food-transition notes suit this sign well.",
    },
  },
  libra: {
    ko: {
      temperament: "분위기의 균형을 읽는 별자리예요. 집 안의 소리, 다른 반려동물과의 거리, 집사의 표정처럼 관계의 공기를 민감하게 감지합니다.",
      bond: "부드러운 말투와 공정한 규칙이 중요해요. 놀이와 휴식, 간식과 기다림이 균형을 이루면 집사와의 관계도 한층 편안해집니다.",
      care: "선택지가 너무 많으면 망설임이 길어질 수 있어요. 장난감이나 간식은 두세 가지 안에서 골라주고, 사회적 만남은 짧고 좋은 기억으로 마무리해주세요.",
    },
    en: {
      temperament: "Libra reads balance in the room: sound levels, distance from other pets, and your facial expression all shape the emotional air.",
      bond: "Soft tone and fair rules matter. When play, rest, treats, and waiting stay balanced, the relationship feels easier.",
      care: "Too many choices can stretch hesitation. Offer two or three options, and keep social meetings short enough to end on a good memory.",
    },
  },
  scorpio: {
    ko: {
      temperament: "몰입이 깊고 관찰력이 강한 별자리예요. 겉으로는 조용해 보여도 주변의 움직임과 집사의 감정 변화를 오래 지켜보고 기억합니다.",
      bond: "한 번 마음을 주면 애정이 깊어지는 타입입니다. 억지로 다가가기보다 스스로 다가올 시간을 주고, 1:1 놀이로 신뢰를 쌓는 것이 좋습니다.",
      care: "낯선 손길이나 갑작스러운 접근에는 방어적으로 반응할 수 있어요. 만남은 천천히, 보상은 조용하게, 휴식 공간은 방해받지 않게 지켜주세요.",
    },
    en: {
      temperament: "Scorpio observes deeply. Even when quiet on the outside, they watch movement and remember changes in your emotions.",
      bond: "Once trust is given, affection runs deep. Give time instead of forcing closeness, and build trust through focused one-on-one play.",
      care: "Sudden touch or rushed approaches can trigger defense. Keep meetings slow, rewards calm, and the rest area protected.",
    },
  },
  sagittarius: {
    ko: {
      temperament: "세상을 넓게 탐험하고 싶은 별자리예요. 새로운 산책길, 낯선 냄새, 바깥 풍경처럼 확장되는 경험에서 생기가 살아납니다.",
      bond: "집사와 함께 발견하는 시간이 최고의 교감입니다. 조금 더 긴 산책, 창가 관찰, 안전한 야외 놀이처럼 시야가 열리는 루틴이 잘 맞아요.",
      care: "자유로운 기운이 강한 만큼 돌발 질주나 과한 흥분은 주의해야 합니다. 리드와 이름 부르기 반응을 확인하고, 탐험 후에는 충분히 쉬게 해주세요.",
    },
    en: {
      temperament: "Sagittarius wants to explore a wider world. New walking paths, unfamiliar scents, and outdoor views wake up the spirit.",
      bond: "Shared discovery is the best bonding time. Longer walks, window watching, and safe outdoor play fit this sign beautifully.",
      care: "Strong freedom energy can become sudden dashes or overexcitement. Check leash safety and recall response, then offer real rest after exploring.",
    },
  },
  capricorn: {
    ko: {
      temperament: "차근차근 쌓아가는 힘이 좋은 별자리예요. 빠르게 들뜨기보다 상황을 보고, 익숙해지면 꾸준히 해내는 안정적인 면이 돋보입니다.",
      bond: "집사의 일관성을 중요하게 느껴요. 같은 신호, 같은 칭찬, 같은 마무리 루틴이 반복될수록 훈련과 생활 규칙을 믿고 따라옵니다.",
      care: "무리한 목표보다 작은 성공을 반복하는 편이 좋아요. 관절 부담이 적은 운동, 짧은 훈련, 충분한 휴식이 책임감 있는 성향을 건강하게 받쳐줍니다.",
    },
    en: {
      temperament: "Capricorn builds strength step by step. Rather than getting excited quickly, they assess the situation and steadily follow through once familiar.",
      bond: "Consistency matters. The same cues, praise style, and closing routine make training and daily rules feel trustworthy.",
      care: "Small repeated wins work better than big goals. Low-impact movement, short training, and enough rest support this responsible nature.",
    },
  },
  aquarius: {
    ko: {
      temperament: "독특한 방식으로 세상을 이해하는 별자리예요. 평범한 장난감도 예상 밖으로 쓰고, 혼자만의 규칙이나 취향을 분명하게 보여줄 수 있습니다.",
      bond: "집사가 개성을 존중해줄수록 관계가 가까워져요. 억지로 맞추기보다 새로운 놀이를 제안하고, 혼자 있고 싶어 하는 시간도 인정해주는 태도가 좋습니다.",
      care: "갑작스러운 소리나 과한 통제에는 거리를 둘 수 있어요. 선택권이 있는 놀이와 퍼즐형 간식처럼 스스로 해결하는 경험을 넣어주세요.",
    },
    en: {
      temperament: "Aquarius understands the world in a unique way. Ordinary toys may be used unexpectedly, and personal rules or tastes can be very clear.",
      bond: "Respecting individuality brings you closer. Offer fresh play ideas and honor solo time instead of forcing a fixed pattern.",
      care: "Sudden noise or heavy control can create distance. Add choice-based games and puzzle treats so they can solve things independently.",
    },
  },
  pisces: {
    ko: {
      temperament: "감수성과 공감력이 부드럽게 흐르는 별자리예요. 집사의 기분을 먼저 읽고, 조용한 분위기나 음악, 포근한 잠자리에서 마음이 안정됩니다.",
      bond: "같이 쉬는 시간이 큰 교감이 됩니다. 눈을 맞추고 천천히 쓰다듬어주거나 낮은 목소리로 불러주면 애정이 잔잔하게 깊어져요.",
      care: "큰 소리와 빠른 변화에는 쉽게 지칠 수 있습니다. 하루에 한 번은 조용한 회복 시간을 만들어주고, 마사지나 느린 놀이로 감정을 풀어주세요.",
    },
    en: {
      temperament: "Pisces carries soft sensitivity and empathy. They often read your mood first, and feel calmer with quiet atmosphere, music, and cozy sleeping spots.",
      bond: "Resting together is meaningful bonding. Eye contact, slow petting, and a low gentle voice deepen affection quietly.",
      care: "Loud sounds and fast changes can be draining. Create one quiet recovery window each day, using massage or slow play to release feelings.",
    },
  },
};

const ELEMENT_DEPTH: Record<
  ElementKey,
  { ko: string; en: string }
> = {
  wood: {
    ko: "Tree 기운은 성장과 호기심을 더합니다. 새로운 루틴을 배울 때 칭찬을 충분히 주면 스스로 뻗어나가는 힘이 좋아져요.",
    en: "Tree energy adds growth and curiosity. With generous praise during new routines, this pet gains confidence to stretch outward.",
  },
  fire: {
    ko: "Fire 기운은 표현력과 활기를 키웁니다. 즐거움이 빠르게 올라오는 만큼 놀이 후 진정 루틴을 함께 넣어주면 균형이 좋아요.",
    en: "Fire energy boosts expression and liveliness. Because joy rises quickly, a calm-down routine after play keeps the balance kind.",
  },
  earth: {
    ko: "Earth 기운은 안정감과 신뢰를 중시합니다. 반복되는 시간표와 익숙한 공간이 마음을 편하게 만들고 애착을 단단하게 해줘요.",
    en: "Earth energy values stability and trust. Repeated schedules and familiar spaces settle the heart and strengthen attachment.",
  },
  metal: {
    ko: "Metal 기운은 관찰력과 선명한 기준을 더합니다. 규칙이 명확할수록 편안해하고, 장난감이나 간식 취향도 뚜렷하게 드러납니다.",
    en: "Metal energy adds observation and clear standards. The clearer the rules, the calmer the response, and preferences show strongly.",
  },
  water: {
    ko: "Water 기운은 감정의 흐름과 직감을 깊게 합니다. 조용한 교감, 부드러운 목소리, 충분한 휴식이 컨디션을 크게 좌우해요.",
    en: "Water energy deepens emotional flow and intuition. Quiet bonding, a soft voice, and enough rest strongly shape the day's condition.",
  },
};

const PERSONALITY_KO: Record<
  ZodiacSignKey,
  (name: string, species: string, el: ElementKey, locale: Locale) => {
    headline: string;
    story: string;
    traits: string[];
  }
> = {
  aries: (name, species, el, locale) => ({
    headline: `${name} · ${ZODIAC_LABEL.aries[locale === "ko" ? "ko" : "en"]} × ${fmtEl(el, locale)} 선구자`,
    story:
      locale === "ko"
        ? `${name}는 ${species}계의 선두 주자예요. 양자리 불꽃과 ${fmtEl(el, locale)} 기운이 만나면 문 앞 대기 속도가 남다릅니다.`
        : `${name} is a front-runner ${species}. Aries fire + ${fmtEl(el, locale)} energy = faster door-wait speed.`,
    traits: locale === "ko" ? ["용감", "직진", "리더십"] : ["brave", "direct", "leader"],
  }),
  taurus: (name, species, el, locale) => ({
    headline: `${name} · ${ZODIAC_LABEL.taurus[locale === "ko" ? "ko" : "en"]} × ${fmtEl(el, locale)}`,
    story:
      locale === "ko"
        ? `느긋하지만 확실한 ${species}. 황소자리 끈기와 ${fmtEl(el, locale)}가 간식 앞에서 진지해져요.`
        : `Slow but sure ${species}. Taurus grit + ${fmtEl(el, locale)} = serious treat focus.`,
    traits: locale === "ko" ? ["끈기", "충성", "미식가"] : ["steady", "loyal", "foodie"],
  }),
  gemini: (name, species, el, locale) => ({
    headline: `${name} · ${ZODIAC_LABEL.gemini[locale === "ko" ? "ko" : "en"]} × ${fmtEl(el, locale)}`,
    story:
      locale === "ko"
        ? `${name}는 표정이 두 개인 ${species}. 쌍둥이자리 호기심 + ${fmtEl(el, locale)}가 대화량을 올려요.`
        : `${name} has two faces—in a cute way. Gemini curiosity + ${fmtEl(el, locale)} boosts chatter.`,
    traits: locale === "ko" ? ["호기심", "재치", "변화무쌍"] : ["curious", "witty", "versatile"],
  }),
  cancer: (name, species, el, locale) => ({
    headline: `${name} · ${ZODIAC_LABEL.cancer[locale === "ko" ? "ko" : "en"]} × ${fmtEl(el, locale)}`,
    story:
      locale === "ko"
        ? `게자리 감성의 ${species} ${name}. ${fmtEl(el, locale)}로 집을 안전지대로 만듭니다.`
        : `Cancer-hearted ${species} ${name}. ${fmtEl(el, locale)} turns home into a safe zone.`,
    traits: locale === "ko" ? ["애착", "섬세", "보호본능"] : ["bonding", "tender", "protective"],
  }),
  leo: (name, species, el, locale) => ({
    headline: `${name} · ${ZODIAC_LABEL.leo[locale === "ko" ? "ko" : "en"]} × ${fmtEl(el, locale)}`,
    story:
      locale === "ko"
        ? `${name}는 ${species} 무대의 주연. 사자자리 태양 + ${fmtEl(el, locale)}가 카리스마를 채워요.`
        : `${name} stars on the ${species} stage. Leo sun + ${fmtEl(el, locale)} fills charisma.`,
    traits: locale === "ko" ? ["자신감", "화려", "관심 러버"] : ["confident", "dramatic", "attention lover"],
  }),
  virgo: (name, species, el, locale) => ({
    headline: `${name} · ${ZODIAC_LABEL.virgo[locale === "ko" ? "ko" : "en"]} × ${fmtEl(el, locale)}`,
    story:
      locale === "ko"
        ? `처녀자리 관찰력의 ${species} ${name}. ${fmtEl(el, locale)}로 작은 변화도 놓치지 않아요.`
        : `Virgo-sharp ${species} ${name}. ${fmtEl(el, locale)} catches tiny changes.`,
    traits: locale === "ko" ? ["꼼꼼", "실용", "헌신"] : ["detail", "practical", "devoted"],
  }),
  libra: (name, species, el, locale) => ({
    headline: `${name} · ${ZODIAC_LABEL.libra[locale === "ko" ? "ko" : "en"]} × ${fmtEl(el, locale)}`,
    story:
      locale === "ko"
        ? `${name}는 ${species}계 분위기 메이커. 천칭자리 조화 + ${fmtEl(el, locale)}가 싸움을 말려줘요.`
        : `${name} balances the ${species} room. Libra harmony + ${fmtEl(el, locale)} calms fights.`,
    traits: locale === "ko" ? ["공정", "사교", "우아"] : ["fair", "social", "graceful"],
  }),
  scorpio: (name, species, el, locale) => ({
    headline: `${name} · ${ZODIAC_LABEL.scorpio[locale === "ko" ? "ko" : "en"]} × ${fmtEl(el, locale)}`,
    story:
      locale === "ko"
        ? `전갈자리 깊이의 ${species} ${name}. ${fmtEl(el, locale)}로 마음을 꿰뚫어 봅니다.`
        : `Scorpio-depth ${species} ${name}. ${fmtEl(el, locale)} reads hearts.`,
    traits: locale === "ko" ? ["집중", "비밀", "강한 애정"] : ["focused", "mysterious", "deep love"],
  }),
  sagittarius: (name, species, el, locale) => ({
    headline: `${name} · ${ZODIAC_LABEL.sagittarius[locale === "ko" ? "ko" : "en"]} × ${fmtEl(el, locale)}`,
    story:
      locale === "ko"
        ? `${name}는 ${species} 여행가. 사수자리 자유 + ${fmtEl(el, locale)}가 산책을 축제로.`
        : `${name} is a ${species} explorer. Sagittarius freedom + ${fmtEl(el, locale)} = festival walks.`,
    traits: locale === "ko" ? ["낙천", "활동", "탐험"] : ["optimist", "active", "explorer"],
  }),
  capricorn: (name, species, el, locale) => ({
    headline: `${name} · ${ZODIAC_LABEL.capricorn[locale === "ko" ? "ko" : "en"]} × ${fmtEl(el, locale)}`,
    story:
      locale === "ko"
        ? `염소자리 인내의 ${species} ${name}. ${fmtEl(el, locale)}로 훈련도 차근차근.`
        : `Capricorn-patient ${species} ${name}. ${fmtEl(el, locale)} loves steady training.`,
    traits: locale === "ko" ? ["책임", "인내", "목표지향"] : ["responsible", "patient", "goal-driven"],
  }),
  aquarius: (name, species, el, locale) => ({
    headline: `${name} · ${ZODIAC_LABEL.aquarius[locale === "ko" ? "ko" : "en"]} × ${fmtEl(el, locale)}`,
    story:
      locale === "ko"
        ? `${name}는 ${species}계 독창파. 물병자리 반전 + ${fmtEl(el, locale)}가 매일 새 재미를 줍니다.`
        : `${name} is an iconic ${species}. Aquarius twist + ${fmtEl(el, locale)} = daily surprise.`,
    traits: locale === "ko" ? ["개성", "자유", "반전"] : ["unique", "free", "plot twist"],
  }),
  pisces: (name, species, el, locale) => ({
    headline: `${name} · ${ZODIAC_LABEL.pisces[locale === "ko" ? "ko" : "en"]} × ${fmtEl(el, locale)}`,
    story:
      locale === "ko"
        ? `물고기자리 감성의 ${species} ${name}. ${fmtEl(el, locale)}로 주인 마음을 말려줘요.`
        : `Pisces-soft ${species} ${name}. ${fmtEl(el, locale)} soothes your heart.`,
    traits: locale === "ko" ? ["공감", "몽글", "상상력"] : ["empathy", "dreamy", "imaginative"],
  }),
};

export function buildZodiacPersonality(
  sign: ZodiacSignKey,
  petName: string,
  species: Species,
  elementAffinity: ElementKey,
  locale: Locale
) {
  const speciesLabel = locale === "ko" ? SPECIES_KO[species] : SPECIES_EN[species];
  const base = PERSONALITY_KO[sign](petName, speciesLabel, elementAffinity, locale);
  const depth = SIGN_DEPTH[sign][locale];
  const elementDepth = ELEMENT_DEPTH[elementAffinity][locale];
  const signLabel = ZODIAC_LABEL[sign][locale === "ko" ? "ko" : "en"];
  const elLabel = dominantElementLabel(elementAffinity, locale);
  const headline =
    locale === "ko"
      ? `${signLabel} - ${petName} - ${signLabel} × ${elLabel}`
      : `${petName} · ${signLabel} × ${elLabel}`;

  return {
    ...base,
    headline,
    details:
      locale === "ko"
        ? [
            { title: "성향 해석", body: depth.temperament },
            { title: "집사와의 교감", body: depth.bond },
            { title: "케어 리듬", body: depth.care },
            { title: `${elLabel} 오행 포인트`, body: elementDepth },
          ]
        : [
            { title: "Personality reading", body: depth.temperament },
            { title: "Bond with parent", body: depth.bond },
            { title: "Care rhythm", body: depth.care },
            { title: `${elLabel} element note`, body: elementDepth },
          ],
  };
}
