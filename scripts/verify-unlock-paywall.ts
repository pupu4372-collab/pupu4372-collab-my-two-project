import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvLocal(): Record<string, string> {
  const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
  const out: Record<string, string> = {};
  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx === -1) continue;
    out[line.slice(0, idx)] = line.slice(idx + 1);
  }
  return out;
}

async function main() {
  const env = loadEnvLocal();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anon || !service) {
    throw new Error("Missing Supabase env in .env.local");
  }

  const admin = createClient(url, service, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const email = `paywall-verify-${Date.now()}@test.local`;
  const password = "TestPass1234xx";

  const created = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (created.error) throw created.error;

  const client = createClient(url, anon);
  const { data: signIn, error: signErr } = await client.auth.signInWithPassword({
    email,
    password,
  });
  if (signErr || !signIn.session) throw signErr ?? new Error("no session");

  const token = signIn.session.access_token;
  const petId = "00000000-0000-0000-0000-000000000099";
  const base = "http://localhost:3000/api/payments/pet-premium/unlock";

  for (const scope of ["package", "mbti"] as const) {
    const qs = new URLSearchParams({ petId });
    if (scope === "mbti") qs.set("scope", "mbti");
    const res = await fetch(`${base}?${qs}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const body = await res.json();
    console.log(JSON.stringify({ scope, status: res.status, body }));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
