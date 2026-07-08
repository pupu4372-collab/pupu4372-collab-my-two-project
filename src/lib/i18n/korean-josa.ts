/** Returns true when the last Hangul syllable has a final consonant (받침). */
export function hasJongseong(word: string): boolean {
  if (!word) return false;
  const code = word.charCodeAt(word.length - 1);
  if (code < 0xac00 || code > 0xd7a3) return false;
  return (code - 0xac00) % 28 !== 0;
}

/** Appends the correct particle form (e.g. "이/가" → 러럴이 / 코코가). */
export function withJosa(word: string, pair: "이/가" | "은/는" | "을/를" | "과/와"): string {
  const [withBatchim, withoutBatchim] = pair.split("/") as [string, string];
  return word + (hasJongseong(word) ? withBatchim : withoutBatchim);
}
