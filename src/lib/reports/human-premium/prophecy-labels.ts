export const LOCKED_DESTINY_TITLE_KO = "잠겨진 천명";
export const LOCKED_DESTINY_TITLE_EN = "Locked destiny";

export const PROPHECY_MANTRA_KO =
  "운명을 아는 자는 거침이 없나니 — 지금의 선택이 다음 계절을 만듭니다.";
export const PROPHECY_MANTRA_EN =
  "He who knows his destiny moves without obstacle — today's choice shapes the next season.";

export function prophecyMantra(isKo: boolean): string {
  return isKo ? PROPHECY_MANTRA_KO : PROPHECY_MANTRA_EN;
}

export function lockedDestinyTitle(isKo: boolean): string {
  return isKo ? LOCKED_DESTINY_TITLE_KO : LOCKED_DESTINY_TITLE_EN;
}
