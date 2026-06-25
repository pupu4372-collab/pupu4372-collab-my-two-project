import { REPORT_PROMPT_SYSTEM_BASE, REPORT_PROMPT_USER_INPUT } from "./base-prompt";
import type { ReportPromptDefinition } from "./prompt-definition";
import type {
  HumanPremiumPromptSlotKey,
  PromptProductPack,
  ReportTypePromptSlot,
} from "./types";
import { HUMAN_PREMIUM_PROMPT_SLOT_KEYS } from "./types";

function emptySlot(): ReportTypePromptSlot {
  return {
    systemKo: "",
    systemEn: "",
    userKo: "",
    userEn: "",
  };
}

/**
 * Converts a ReportPromptDefinition (SLOTS map) into a PromptProductPack.
 * Empty slot strings keep human-prompt.ts built-in defaults.
 */
export function buildReportPromptPack(def: ReportPromptDefinition): PromptProductPack {
  const slots = {} as Record<HumanPremiumPromptSlotKey, ReportTypePromptSlot>;

  for (const slotKey of HUMAN_PREMIUM_PROMPT_SLOT_KEYS) {
    const section = def.slots[slotKey]?.trim() ?? "";
    if (!section) {
      slots[slotKey] = emptySlot();
      continue;
    }

    slots[slotKey] = {
      systemKo: REPORT_PROMPT_SYSTEM_BASE,
      systemEn: "",
      userKo: `${REPORT_PROMPT_USER_INPUT}\n\n${section}`,
      userEn: "",
    };
  }

  return {
    productKey: def.productKey,
    focusKo: def.focusKo ?? "",
    focusEn: def.focusEn ?? "",
    slots,
  };
}
