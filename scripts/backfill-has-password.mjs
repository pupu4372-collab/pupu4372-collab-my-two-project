/**
 * Backfill app_metadata.has_password for users who have a password hash.
 *
 * Requires one of:
 *   DATABASE_URL=postgresql://...
 *   SUPABASE_DB_URL=postgresql://...
 *   SUPABASE_DB_PASSWORD=<project database password>
 *   (+ NEXT_PUBLIC_SUPABASE_URL to build the host)
 *
 * Usage:
 *   node scripts/backfill-has-password.mjs              # dry-run (default)
 *   node scripts/backfill-has-password.mjs --dry-run    # count + sample ids
 *   node scripts/backfill-has-password.mjs --apply      # write app_metadata
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  return Object.fromEntries(
    fs
      .readFileSync(filePath, "utf8")
      .split(/\r?\n/)
      .filter((line) => line && !line.trim().startsWith("#") && line.includes("="))
      .map((line) => {
        const index = line.indexOf("=");
        return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
      })
  );
}

function resolveDatabaseUrl(env) {
  const direct = env.DATABASE_URL || env.SUPABASE_DB_URL;
  if (direct) return direct;

  const password = env.SUPABASE_DB_PASSWORD;
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  if (!password || !supabaseUrl) return null;

  const projectRef = supabaseUrl.match(/^https:\/\/([^.]+)\.supabase\.co/)?.[1];
  if (!projectRef) return null;

  const encoded = encodeURIComponent(password);

  // Session pooler (IPv4-friendly). Override with SUPABASE_POOLER_HOST if needed.
  const poolerHost =
    env.SUPABASE_POOLER_HOST || "aws-1-ap-northeast-2.pooler.supabase.com";
  const poolerPort = env.SUPABASE_POOLER_PORT || "5432";
  return `postgresql://postgres.${projectRef}:${encoded}@${poolerHost}:${poolerPort}/postgres`;
}

const TARGET_WHERE = `
  encrypted_password IS NOT NULL
  AND length(encrypted_password::text) > 0
  AND coalesce(raw_app_meta_data->>'has_password', 'false') <> 'true'
`;

async function main() {
  const apply = process.argv.includes("--apply");
  const dryRun = !apply || process.argv.includes("--dry-run");

  const env = {
    ...process.env,
    ...loadEnvFile(path.join(root, ".env.vercel.local")),
    ...loadEnvFile(path.join(root, ".env.local")),
  };

  const databaseUrl = resolveDatabaseUrl(env);
  if (!databaseUrl) {
    console.error(
      "Missing database connection.\n" +
        "Set DATABASE_URL / SUPABASE_DB_URL, or SUPABASE_DB_PASSWORD (+ NEXT_PUBLIC_SUPABASE_URL) in .env.local"
    );
    process.exit(1);
  }

  const client = new pg.Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  try {
    const countRes = await client.query(
      `SELECT count(*)::int AS n FROM auth.users WHERE ${TARGET_WHERE}`
    );
    const totalWithPassword = (
      await client.query(
        `SELECT count(*)::int AS n FROM auth.users
         WHERE encrypted_password IS NOT NULL AND length(encrypted_password::text) > 0`
      )
    ).rows[0].n;
    const alreadyFlagged = (
      await client.query(
        `SELECT count(*)::int AS n FROM auth.users
         WHERE encrypted_password IS NOT NULL
           AND length(encrypted_password::text) > 0
           AND coalesce(raw_app_meta_data->>'has_password', 'false') = 'true'`
      )
    ).rows[0].n;

    const needBackfill = countRes.rows[0].n;
    console.log(
      JSON.stringify(
        {
          mode: apply && !dryRun ? "apply" : "dry-run",
          users_with_password_hash: totalWithPassword,
          already_has_password_flag: alreadyFlagged,
          need_backfill: needBackfill,
        },
        null,
        2
      )
    );

    const sample = await client.query(
      `SELECT id, email, created_at,
              coalesce(raw_app_meta_data->>'has_password', 'false') AS has_password_flag
       FROM auth.users
       WHERE ${TARGET_WHERE}
       ORDER BY created_at ASC
       LIMIT 30`
    );
    console.log("sample_targets (up to 30):");
    for (const row of sample.rows) {
      console.log(
        `  ${row.id}  email=${row.email ?? "(null)"}  created=${row.created_at?.toISOString?.() ?? row.created_at}`
      );
    }

    if (!apply) {
      console.log(
        "\nDry-run only. Re-run with --apply after approval to write app_metadata.has_password."
      );
      return;
    }

    if (needBackfill === 0) {
      console.log("Nothing to update.");
      return;
    }

    const updated = await client.query(
      `UPDATE auth.users
       SET raw_app_meta_data =
             coalesce(raw_app_meta_data, '{}'::jsonb) || '{"has_password": true}'::jsonb,
           updated_at = now()
       WHERE ${TARGET_WHERE}
       RETURNING id`
    );
    console.log(`Updated ${updated.rowCount} users with app_metadata.has_password=true.`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
