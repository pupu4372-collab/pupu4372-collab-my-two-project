const BODY_PARAGRAPH_MAX = 140;

function splitReadableParagraphs(body: string): string[] {
  return body
    .split(/\n{2,}/)
    .flatMap((block) => {
      const normalized = block.replace(/\n/g, " ").replace(/\s+/g, " ").trim();
      if (!normalized) return [];
      if (normalized.length <= BODY_PARAGRAPH_MAX) return [normalized];

      const sentences =
        normalized.match(/[^.!?。！？.]+[.!?。！？.]?/g) ?? [normalized];
      const paragraphs: string[] = [];
      let current = "";

      for (const sentence of sentences) {
        const next = sentence.trim();
        if (!next) continue;
        if (current && current.length + next.length > BODY_PARAGRAPH_MAX) {
          paragraphs.push(current);
          current = next;
          continue;
        }
        current = current ? `${current} ${next}` : next;
      }

      if (current) paragraphs.push(current);
      return paragraphs;
    });
}

export function BodyText({
  body,
  className = "",
}: {
  body: string;
  className?: string;
}) {
  const paragraphs = splitReadableParagraphs(body);

  return (
    <div className={`space-y-5 text-base leading-[1.9] text-[var(--jig-ink)]/90 ${className}`}>
      {paragraphs.map((paragraph, index) => (
        <p key={`${paragraph.slice(0, 32)}-${index}`}>{paragraph}</p>
      ))}
    </div>
  );
}

export function SectionHeading({
  id,
  title,
  subtitle,
}: {
  id: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <header id={id} className="scroll-mt-24">
      <div className="flex items-start gap-3">
        <div className="human-premium-accent-bar mt-1" />
        <div>
          <h2 className="human-premium-serif text-2xl font-bold sm:text-3xl">{title}</h2>
          {subtitle ? (
            <p className="mt-1 text-sm text-[var(--jig-muted)]">{subtitle}</p>
          ) : null}
        </div>
      </div>
    </header>
  );
}

export function ScoreBar({
  score,
  color = "var(--jig-seal)",
}: {
  score: number;
  color?: string;
}) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-[#f1eee7]">
      <div
        className="human-premium-chart-bar h-full rounded-full transition-all"
        style={{ width: `${score}%`, backgroundColor: color }}
      />
    </div>
  );
}
