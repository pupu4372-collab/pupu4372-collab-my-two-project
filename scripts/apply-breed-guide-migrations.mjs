/**
 * Apply migrations 019–024 to remote Supabase Postgres.
 *
 * Requires one of:
 *   DATABASE_URL=postgresql://...
 *   SUPABASE_DB_URL=postgresql://...
 *   SUPABASE_DB_PASSWORD=<project database password>
 *
 * Usage: node scripts/apply-breed-guide-migrations.mjs
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
      }),
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
  "019_breed_guide_maltese_enrich.sql",
  "020_breed_guides_dog_9_enrich.sql",
  "021_breed_guides_cat_10_enrich.sql",
  "022_breed_guides_other_10_enrich.sql",
  "023_breed_guides_remaining_4_enrich.sql",
  "024_breed_guides_cat_additional.sql",
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
      "Missing database connection. Set DATABASE_URL or SUPABASE_DB_PASSWORD in .env.local",
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
        name: "maltese summary",
        query:
          "select seo_slug, left(summary, 40) as summary_preview from public.breed_guides where seo_slug = 'maltese'",
      },
      {
        name: "cat breed count",
        query: "select count(*)::int as count from public.breed_guides where animal_type = 'cat'",
      },
      {
        name: "new cat slugs",
        query:
          "select seo_slug from public.breed_guides where seo_slug in ('abyssinian', 'american-shorthair', 'turkish-angora', 'norwegian-forest-cat', 'savannah-cat', 'domestic-shorthair', 'hybrid-cat') order by seo_slug",
      },
    ];

    for (const check of checks) {
      const result = await client.query(check.query);
      console.log(`VERIFY ${check.name}:`, result.rows);
    }
  } finally {
    await client.end();
  }

  console.log("Migrations 019–024 applied successfully.");
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
