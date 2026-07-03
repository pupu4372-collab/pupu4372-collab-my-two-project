import type { Challenge } from "@/lib/supabase/types";

type ChallengeCopy = { title: string; description: string };

/** Production challenge IDs + Korean title fallback for EN copy */
const CHALLENGE_EN_BY_ID: Record<string, ChallengeCopy> = {
  "78cc6239-3390-4574-a93e-ddf7fa35c84a": {
    title: "Daily walk check-in",
    description: "Post a photo of your pet's daily walk!",
  },
  "eec50434-fa1d-4acc-8778-607e34f4c2df": {
    title: "Catch the knead",
    description: "Snap a photo of your cat making biscuits!",
  },
  "e199b89c-6b07-49e0-af25-86a4fcc3215a": {
    title: "Show off your pet",
    description: "All pets welcome!",
  },
};

const CHALLENGE_EN_BY_TITLE: Record<string, ChallengeCopy> = {
  "매일 산책 인증하기": CHALLENGE_EN_BY_ID["78cc6239-3390-4574-a93e-ddf7fa35c84a"],
  "고양이 꾹꾹이 포착": CHALLENGE_EN_BY_ID["eec50434-fa1d-4acc-8778-607e34f4c2df"],
  "우리아이 자랑하기": CHALLENGE_EN_BY_ID["e199b89c-6b07-49e0-af25-86a4fcc3215a"],
};

export function localizeChallenge(challenge: Challenge, locale: "ko" | "en"): Challenge {
  if (locale === "ko") return challenge;

  const copy = CHALLENGE_EN_BY_ID[challenge.id] ?? CHALLENGE_EN_BY_TITLE[challenge.title];
  if (!copy) return challenge;

  return {
    ...challenge,
    title: copy.title,
    description: copy.description,
  };
}

export function localizeChallenges(challenges: Challenge[], locale: "ko" | "en"): Challenge[] {
  return challenges.map((challenge) => localizeChallenge(challenge, locale));
}
