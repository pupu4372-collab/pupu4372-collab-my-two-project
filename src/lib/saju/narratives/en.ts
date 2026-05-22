import { ELEMENT_META } from "../elements";
import type { ElementKey, Species } from "../types";

const SPECIES_LABEL: Record<Species, string> = {
  dog: "pup",
  cat: "kitty",
};

const TEMPLATES: Record<
  ElementKey,
  {
    headline: (name: string, romanized: string, hanja: string) => string;
    story: (name: string, romanized: string, species: string) => string;
    traits: string[];
  }
> = {
  wood: {
    headline: (name, romanized, hanja) =>
      `${name} · ${romanized} (${hanja}) Growth Spirit`,
    story: (name, romanized, species) =>
      `${name} runs on ${romanized} energy — think spring breeze in fur form. This ${species} is curious, warm, and always sniffing out the next adventure. Friends arrive quickly; loyalty grows like bamboo after rain.`,
    traits: ["Adventurous", "Social", "Quick learner"],
  },
  fire: {
    headline: (name, romanized, hanja) =>
      `${name} · ${romanized} (${hanja}) Energizer`,
    story: (name, romanized, species) =>
      `${name} radiates ${romanized} vibes — a little spark plug in a ${species} suit. Playtime is sacred, zoomies are scheduled, and silence is suspicious. Big heart, loud purr or happy bark.`,
    traits: ["High energy", "Charismatic", "Loves the spotlight"],
  },
  earth: {
    headline: (name, romanized, hanja) =>
      `${name} · ${romanized} (${hanja}) Cozy Guardian`,
    story: (name, romanized, species) =>
      `${name} carries steady ${romanized} energy — the couch guardian who still shows up when it matters. Routines feel safe; snacks feel sacred. A calm ${species} who makes any house feel like home.`,
    traits: ["Grounded", "Patient", "Snack-motivated"],
  },
  metal: {
    headline: (name, romanized, hanja) =>
      `${name} · ${romanized} (${hanja}) Sharp Style`,
    story: (name, romanized, species) =>
      `${name} has crisp ${romanized} energy — elegant, observant, and a little picky (in a chic way). This ${species} notices everything: new shoes, new mail, new emotions. Standards are high; cuddles are earned and unforgettable.`,
    traits: ["Observant", "Independent", "Low-key stylish"],
  },
  water: {
    headline: (name, romanized, hanja) =>
      `${name} · ${romanized} (${hanja}) Intuitive Soul`,
    story: (name, romanized, species) =>
      `${name} flows with ${romanized} energy — soft eyes, deep feels, expert-level nap game. This ${species} reads the room before you do and lands on your lap like destiny. Gentle, witty, mysteriously wise.`,
    traits: ["Empathic", "Dreamy", "Master napper"],
  },
};

export function narrativeEn(
  element: ElementKey,
  species: Species,
  petName: string
) {
  const meta = ELEMENT_META[element];
  const tpl = TEMPLATES[element];
  const speciesLabel = SPECIES_LABEL[species];

  return {
    headline: tpl.headline(petName, meta.meaning, meta.hanja),
    story: tpl.story(petName, meta.meaning, speciesLabel),
    traits: tpl.traits,
  };
}
