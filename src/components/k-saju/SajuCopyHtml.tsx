"use client";

import { sanitizeSajuCopyHtml } from "@/lib/saju/escape-html";

interface SajuCopyHtmlProps {
  html: string;
  className?: string;
  as?: "p" | "div";
}

export function SajuCopyHtml({ html, className, as = "p" }: SajuCopyHtmlProps) {
  const Tag = as;
  return (
    <Tag
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizeSajuCopyHtml(html) }}
    />
  );
}

interface SajuNarrativeBodyProps {
  html: string;
  className?: string;
}

export function SajuNarrativeBody({ html, className }: SajuNarrativeBodyProps) {
  const paragraphs = html.split("\n\n").filter(Boolean);
  return (
    <div className={className ?? "mt-4 space-y-4"}>
      {paragraphs.map((paragraph, index) => (
        <SajuCopyHtml
          key={index}
          html={paragraph}
          className="text-base leading-relaxed text-primary/90 [&_strong]:font-bold [&_strong]:text-primary"
        />
      ))}
    </div>
  );
}
