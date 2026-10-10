import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getPlaybackUrl } from "@/lib/cloudflare/stream";

export async function GET(req: NextRequest) {
  const streamerId = req.nextUrl.searchParams.get("streamerId") || "";
  const streamer = db.getStreamer(streamerId);

  if (streamer?.isLive) {
    return NextResponse.json({
      mode: "live",
      streamer,
      playbackUrl: streamer.cloudflareLiveInputId
        ? getPlaybackUrl(streamer.cloudflareLiveInputId)
        : null,
    });
  }

  const now = new Date();
  const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const day = now.getDay();
  const slots = db.getSchedule(streamerId).filter((s) => s.enabled);

  const current = slots.find((s) => {
    const dayOk = s.days.length === 0 || s.days.includes(day);
    return dayOk && s.startTime <= hhmm && hhmm < s.endTime;
  });

  if (current) {
    return NextResponse.json({
      mode: "vod",
      video: current,
      youtubeId: current.youtubeVideoId,
    });
  }

  return NextResponse.json({
    mode: "idle",
    message: "Nenhuma programação ativa no momento",
  });
}
