/**
 * Apply migration 026_support_inquiries.sql to remote Supabase Postgres.
 *
 * Requires DATABASE_URL, SUPABASE_DB_URL, or SUPABASE_DB_PASSWORD in .env.local
 *
 * Usage: node scripts/apply-support-migration.mjs
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
  return `postgresql://postgres:${encoded}@db.${projectRef}.supabase.co:5432/postgres`;
}

async function main() {
  const env = {
    ...loadEnvFile(path.join(root, ".env.local")),
    ...loadEnvFile(path.join(root, ".env.vercel.local")),
    ...process.env,
  };

  const databaseUrl = resolveDatabaseUrl(env);
  if (!databaseUrl) {
    console.error(
      "Missing database connection. Set DATABASE_URL or SUPABASE_DB_PASSWORD in .env.local"
    );
    process.exit(1);
  }

  const client = new pg.Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log("Connected to Supabase Postgres.");

  try {
    const exists = await client.query(
      "select to_regclass('public.support_inquiries') as table_name"
    );
    if (exists.rows[0]?.table_name) {
      console.log("SKIP 026_support_inquiries.sql (table already exists)");
      return;
    }

    const sqlPath = path.join(root, "supabase", "migrations", "026_support_inquiries.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");
    console.log("Applying 026_support_inquiries.sql...");
    await client.query(sql);
    console.log("OK 026_support_inquiries.sql");

    const verify = await client.query(
      "select count(*)::int as count from public.support_inquiries"
    );
    console.log("VERIFY support_inquiries:", verify.rows[0]);
  } finally {
    await client.end();
  }

  console.log("Support inquiries migration applied.");
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
