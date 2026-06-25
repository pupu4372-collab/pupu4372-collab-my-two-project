import { LEGAL_ENTITY } from "@/lib/legal/company";
import type { LegalBlock, PrivacyPolicyContent } from "@/lib/legal/privacy-policy-types";
import { Link } from "@/i18n/navigation";

function LegalBlockView({ block }: { block: LegalBlock }) {
  switch (block.type) {
    case "p":
      return <p className="text-sm leading-relaxed text-plum/85">{block.text}</p>;
    case "ul":
      return (
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-plum/85">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className="list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-plum/85">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      );
    case "table":
      return (
        <div className="overflow-x-auto rounded-2xl border border-plum/10 bg-white">
          <table className="min-w-full text-left text-xs text-plum/85 md:text-sm">
            <thead>
              <tr className="border-b border-plum/10 bg-cream/60">
                {block.headers.map((header) => (
                  <th key={header} className="px-3 py-2.5 font-semibold text-plum">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-plum/5 last:border-0">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-3 py-2.5 align-top leading-relaxed">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "note":
      return (
        <p className="rounded-2xl border border-plum/10 bg-cream/70 px-4 py-3 text-xs leading-relaxed text-plum/75">
          {block.text}
        </p>
      );
    default:
      return null;
  }
}

interface LegalPolicyDocumentProps {
  content: PrivacyPolicyContent;
  locale: string;
}

export function LegalPolicyDocument({ content, locale }: LegalPolicyDocumentProps) {
  const isKo = locale !== "en";

  return (
    <article className="pastel-card mx-auto max-w-3xl space-y-8 p-6 md:p-8">
      <div className="space-y-3">
        <Link href="/" className="text-sm text-plum/60 underline hover:text-plum">
          {isKo ? "← 홈" : "← Home"}
        </Link>
        <h1 className="text-2xl font-bold text-plum">{content.title}</h1>
        <p className="text-xs font-medium text-plum/55">{content.effectiveLabel}</p>
        <div className="space-y-2 border-b border-plum/10 pb-6">
          {content.preamble.map((paragraph) => (
            <p key={paragraph} className="text-sm leading-relaxed text-plum/80">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      <nav aria-label={content.tocTitle} className="rounded-2xl border border-plum/10 bg-white p-4">
        <h2 className="text-sm font-bold text-plum">{content.tocTitle}</h2>
        <ol className="mt-3 grid gap-1.5 sm:grid-cols-2">
          {content.sections.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="text-xs font-medium text-plum/75 underline decoration-plum/20 hover:text-plum"
              >
                {section.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="space-y-8">
        {content.sections.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-24 space-y-3">
            <h2 className="text-base font-bold text-plum">{section.title}</h2>
            <div className="space-y-3">
              {section.blocks.map((block, index) => (
                <LegalBlockView key={`${section.id}-${index}`} block={block} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <footer className="border-t border-plum/10 pt-4 text-xs leading-relaxed text-plum/55">
        {isKo ? (
          <>
            {LEGAL_ENTITY.nameKo} | 대표 {LEGAL_ENTITY.representative} | 사업자등록번호{" "}
            {LEGAL_ENTITY.businessNumber}
            <br />
            {LEGAL_ENTITY.addressKo} | {LEGAL_ENTITY.phone}
          </>
        ) : (
          <>
            {LEGAL_ENTITY.nameEn} | CEO {LEGAL_ENTITY.representative} | Business registration{" "}
            {LEGAL_ENTITY.businessNumber}
            <br />
            {LEGAL_ENTITY.addressEn} | {LEGAL_ENTITY.phone}
          </>
        )}
      </footer>
    </article>
  );
}
