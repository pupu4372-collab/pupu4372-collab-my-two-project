/**
 * Apply migrations 038–039 (pet_species reptile + breed_guides reptile) to remote Supabase Postgres.
 *
 * Requires DATABASE_URL, SUPABASE_DB_URL, or SUPABASE_DB_PASSWORD in .env.local
 *
 * Usage: node scripts/apply-reptile-species-migrations.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const migrationFiles = [
  "038_pet_species_reptile.sql",
  "039_breed_guides_reptile_animal_type.sql",
];

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

async function hasPetSpeciesReptile(client) {
  const { rows } = await client.query(
    `select 1
     from pg_enum e
     join pg_type t on t.oid = e.enumtypid
     join pg_namespace n on n.oid = t.typnamespace
     where n.nspname = 'public' and t.typname = 'pet_species' and e.enumlabel = 'reptile'
     limit 1`,
  );
  return rows.length > 0;
}

async function reptileBreedGuideCount(client) {
  const { rows } = await client.query(
    `select count(*)::int as count
     from public.breed_guides
     where seo_slug in ('leopard-gecko', 'crested-gecko', 'bearded-dragon', 'semi-aquatic-turtle')
       and animal_type = 'reptile'`,
  );
  return rows[0]?.count ?? 0;
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
      if (file === "038_pet_species_reptile.sql" && (await hasPetSpeciesReptile(client))) {
        console.log(`SKIP ${file} (pet_species already includes reptile)`);
        continue;
      }

      if (file === "039_breed_guides_reptile_animal_type.sql" && (await reptileBreedGuideCount(client)) === 4) {
        console.log(`SKIP ${file} (reptile breed guides already updated)`);
        continue;
      }

      const sqlPath = path.join(root, "supabase", "migrations", file);
      const sql = fs.readFileSync(sqlPath, "utf8");
      console.log(`Applying ${file}...`);
      await client.query(sql);
      console.log(`OK ${file}`);
    }

    const reptileGuides = await reptileBreedGuideCount(client);
    console.log("VERIFY reptile breed_guides:", reptileGuides);
    console.log("VERIFY pet_species reptile:", await hasPetSpeciesReptile(client));
  } finally {
    await client.end();
  }

  console.log("Reptile species migrations applied.");
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
