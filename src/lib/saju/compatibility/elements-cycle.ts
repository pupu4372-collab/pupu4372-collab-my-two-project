import type { ElementKey } from "../types";

/** 오행 상생(生) 순환 */
const GENERATES: Record<ElementKey, ElementKey> = {
  wood: "fire",
  fire: "earth",
  earth: "metal",
  metal: "water",
  water: "wood",
};

/** 오행 상극(克): A가 B를 극함 */
const CONTROLS: Record<ElementKey, ElementKey> = {
  wood: "earth",
  earth: "water",
  water: "fire",
  fire: "metal",
  metal: "wood",
};

export type ElementRelation =
  | "same"
  | "owner_nourishes_pet"
  | "pet_nourishes_owner"
  | "owner_controls_pet"
  | "pet_controls_owner"
  | "neutral";

export function getElementRelation(
  petElement: ElementKey,
  ownerElement: ElementKey
): ElementRelation {
  if (petElement === ownerElement) return "same";
  if (GENERATES[ownerElement] === petElement) return "owner_nourishes_pet";
  if (GENERATES[petElement] === ownerElement) return "pet_nourishes_owner";
  if (CONTROLS[ownerElement] === petElement) return "owner_controls_pet";
  if (CONTROLS[petElement] === ownerElement) return "pet_controls_owner";
  return "neutral";
}

export function scoreFromRelation(relation: ElementRelation): number {
  const base: Record<ElementRelation, number> = {
    same: 88,
    owner_nourishes_pet: 92,
    pet_nourishes_owner: 84,
    owner_controls_pet: 68,
    pet_controls_owner: 72,
    neutral: 78,
  };
  return base[relation];
}
