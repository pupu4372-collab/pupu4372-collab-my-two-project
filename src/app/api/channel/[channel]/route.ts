import { fetchChannelEditorial } from "@/lib/content/channel-feed";
import type { PetChannel } from "@/lib/channel/content";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  context: { params: Promise<{ channel: string }> }
) {
  const { channel } = await context.params;

  if (channel !== "dog" && channel !== "cat" && channel !== "reptile") {
    return NextResponse.json({ error: "Invalid channel." }, { status: 400 });
  }

  const editorial = await fetchChannelEditorial(channel as PetChannel);
  return NextResponse.json(editorial);
}
