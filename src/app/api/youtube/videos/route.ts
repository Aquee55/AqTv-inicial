import { NextRequest, NextResponse } from "next/server";
import { getChannelVideos, getChannelByHandle } from "@/lib/youtube";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const streamerId = req.nextUrl.searchParams.get("streamerId");
  const handle = req.nextUrl.searchParams.get("handle");
  const channelId = req.nextUrl.searchParams.get("channelId");

  try {
    let cid: string | null = channelId;

    if (!cid && handle) {
      const ch = await getChannelByHandle(handle);
      cid = ch?.id ?? null;
    }

    if (!cid && streamerId) {
      const s = db.getStreamer(streamerId);
      cid = s?.youtubeChannelId ?? null;
      if (!cid && s?.youtubeHandle) {
        const ch = await getChannelByHandle(s.youtubeHandle);
        cid = ch?.id ?? null;
        if (cid) {
          db.upsertStreamer({ id: streamerId, youtubeChannelId: cid });
        }
      }
    }

    if (!cid) {
      return NextResponse.json(
        { error: "Informe channelId, handle ou vincule o canal no Studio" },
        { status: 400 }
      );
    }

    const videos = await getChannelVideos(cid, 30);
    return NextResponse.json({ channelId: cid, videos });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
