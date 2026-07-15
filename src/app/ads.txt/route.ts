export async function GET() {
  return new Response(
    "google.com, pub-7486656033876734, DIRECT, f08c47fec0942fa0",
    { headers: { "Content-Type": "text/plain" } }
  );
}
