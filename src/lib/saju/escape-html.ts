/** Escape user-controlled text before embedding in HTML snippets. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Allow only <strong> tags from fixed copy-map HTML. */
export function sanitizeSajuCopyHtml(html: string): string {
  return html.replace(/<(?!\/?strong\b)[^>]*>/gi, "");
}
