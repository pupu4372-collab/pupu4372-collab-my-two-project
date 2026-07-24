#!/usr/bin/env node
/**
 * Verify notice text appears (or not) on SSG pages after admin revalidate.
 *
 * Usage:
 *   node scripts/verify-notice-revalidate.mjs <baseUrl> <searchText> [noticeId]
 *
 * Examples:
 *   node scripts/verify-notice-revalidate.mjs https://xxx.vercel.app "REVALIDATE_TEST_1"
 *   node scripts/verify-notice-revalidate.mjs https://xxx.vercel.app "REVALIDATE_TEST_1" <uuid>
 */

const baseUrlArg = process.argv[2];
const searchText = process.argv[3];
const noticeId = process.argv[4]?.trim() || "";

if (!baseUrlArg || !searchText) {
  console.error(
    "Usage: node scripts/verify-notice-revalidate.mjs <baseUrl> <searchText> [noticeId]",
  );
  process.exit(2);
}

const baseUrl = baseUrlArg.replace(/\/+$/, "");

/** @type {string[]} */
const paths = ["/", "/support", "/community", "/en", "/en/support", "/en/community"];

if (noticeId) {
  paths.push(`/support/notices/${noticeId}`, `/en/support/notices/${noticeId}`);
}

/**
 * @param {string} path
 * @returns {Promise<{ path: string; status: number | null; found: boolean; error: string | null }>}
 */
async function checkPath(path) {
  const url = `${baseUrl}${path}`;
  try {
    const res = await fetch(url, {
      cache: "no-store",
      redirect: "follow",
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        Accept: "text/html",
      },
    });
    const html = await res.text();
    const found = html.includes(searchText);
    return { path, status: res.status, found, error: null };
  } catch (err) {
    return {
      path,
      status: null,
      found: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

const results = [];
for (const path of paths) {
  results.push(await checkPath(path));
}

const pad = Math.max(...results.map((r) => r.path.length), 4);

console.log(`base:   ${baseUrl}`);
console.log(`search: ${JSON.stringify(searchText)}`);
if (noticeId) console.log(`id:     ${noticeId}`);
console.log("");
console.log(`${"PATH".padEnd(pad)}  MARK  STATUS`);
console.log(`${"-".repeat(pad)}  ----  ------`);

for (const r of results) {
  const mark = r.error ? "!" : r.found ? "O" : "X";
  const status = r.status == null ? "ERR" : String(r.status);
  console.log(`${r.path.padEnd(pad)}  ${mark}     ${status}`);
  if (r.error) console.log(`  error: ${r.error}`);
}

const fetchErrors = results.filter((r) => r.error);
if (fetchErrors.length > 0) {
  console.log(`\nRESULT: FETCH_ERROR (${fetchErrors.length} path(s))`);
  process.exit(1);
}

const foundCount = results.filter((r) => r.found).length;
console.log(`\nfound ${foundCount}/${results.length}`);
process.exit(0);
