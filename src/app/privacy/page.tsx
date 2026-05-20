export default function PrivacyPage() {
  return (
    <article className="oriental-card space-y-4 p-6 text-sm leading-relaxed text-ink/80">
      <h1 className="text-xl font-semibold text-ink">Privacy Policy (MVP)</h1>
      <p>
        K-Saju Pet collects pet name, species, birth date/time, and timezone solely to generate
        K-Saju readings. Data is normalized to UTC for consistent calculations worldwide.
      </p>
      <ul className="list-disc space-y-2 pl-5">
        <li>We do not sell personal data.</li>
        <li>Basic readings are processed on our servers; no third-party ads in MVP.</li>
        <li>You may request deletion of your data by contacting support (placeholder).</li>
        <li>
          Pet Show photos and Q&A (coming soon) will support a Report button so users can flag
          inappropriate content for review.
        </li>
      </ul>
      <p className="text-xs text-ink/50">Last updated: May 2026 · Placeholder for legal review.</p>
    </article>
  );
}
