import { NextRequest, NextResponse } from "next/server";
import {
  getLiveInput,
  getPlaybackUrl,
  isObsConnected,
  isCloudflareConfigured,
  extractRtmp,
} from "@/lib/cloudflare/stream";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const streamerId = req.nextUrl.searchParams.get("streamerId");
  if (!streamerId) {
    return NextResponse.json({ error: "streamerId obrigatório" }, { status: 400 });
  }

  const streamer = db.getStreamer(streamerId);
  if (!streamer?.cloudflareLiveInputId) {
    return NextResponse.json({
      configured: isCloudflareConfigured(),
      connected: false,
      isLive: false,
      hasKey: false,
    });
  }

  if (!isCloudflareConfigured()) {
    return NextResponse.json({
      configured: false,
      connected: false,
      isLive: streamer.isLive,
      hasKey: true,
      rtmpUrl: streamer.rtmpUrl,
      streamKey: streamer.streamKey,
    });
  }

  try {
    const live = await getLiveInput(streamer.cloudflareLiveInputId);
    const connected = isObsConnected(live);
    const { rtmpUrl, streamKey } = extractRtmp(live);

    return NextResponse.json({
      configured: true,
      connected,
      isLive: streamer.isLive,
      hasKey: true,
      uid: live.uid,
      rtmpUrl: rtmpUrl || streamer.rtmpUrl,
      streamKey: streamKey || streamer.streamKey,
      playbackUrl: getPlaybackUrl(live.uid),
      status: live.status,
    });
  } catch (err: any) {
    return NextResponse.json({
      configured: true,
      connected: false,
      isLive: streamer.isLive,
      hasKey: true,
      rtmpUrl: streamer.rtmpUrl,
      streamKey: streamer.streamKey,
      error: err.message,
    });
  }
}
