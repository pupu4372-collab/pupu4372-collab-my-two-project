/**
 * Apply migrations 014–017 to remote Supabase Postgres.
 *
 * Requires one of:
 *   DATABASE_URL=postgresql://...
 *   SUPABASE_DB_URL=postgresql://...
 *   SUPABASE_DB_PASSWORD=<project database password>
 *
 * Usage: node scripts/apply-community-migrations.mjs
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

const migrationFiles = [
  "014_community_post_categories.sql",
  "015_breed_guides.sql",
  "016_breed_guides_seed_30.sql",
  "017_community_extended.sql",
];

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
    for (const file of migrationFiles) {
      const sqlPath = path.join(root, "supabase", "migrations", file);
      const sql = fs.readFileSync(sqlPath, "utf8");
      console.log(`Applying ${file}...`);
      await client.query(sql);
      console.log(`OK ${file}`);
    }

    const checks = [
      {
        name: "community_posts.animal_type",
        query:
          "select animal_type, category, is_answered, seo_slug, difficulty, save_count from public.community_posts limit 1",
      },
      {
        name: "breed_guides",
        query: "select count(*)::int as count from public.breed_guides",
      },
      {
        name: "post_saves",
        query: "select count(*)::int as count from public.post_saves",
      },
    ];

    for (const check of checks) {
      const result = await client.query(check.query);
      console.log(`VERIFY ${check.name}:`, result.rows[0]);
    }
  } finally {
    await client.end();
  }

  console.log("Migrations 014–017 applied successfully.");
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
