export type LegalBlock =
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "note"; text: string };

export type LegalSection = {
  id: string;
  title: string;
  blocks: LegalBlock[];
};

export type PrivacyPolicyContent = {
  title: string;
  preamble: string[];
  tocTitle: string;
  effectiveLabel: string;
  sections: LegalSection[];
};
