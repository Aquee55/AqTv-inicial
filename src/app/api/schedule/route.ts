import { NextRequest, NextResponse } from "next/server";
import { db, ScheduledSlot } from "@/lib/db";

export async function GET(req: NextRequest) {
  const streamerId = req.nextUrl.searchParams.get("streamerId") || "";
  const slots = db.getSchedule(streamerId);
  return NextResponse.json(slots);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { streamerId, slots } = body as { streamerId: string; slots: ScheduledSlot[] };
    if (!streamerId) {
      return NextResponse.json({ error: "streamerId obrigatório" }, { status: 400 });
    }
    db.setSchedule(streamerId, slots || []);
    return NextResponse.json({ ok: true, slots: db.getSchedule(streamerId) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/** Retorna o que deve tocar agora (live ou vídeo da programação) */
export async function PUT(req: NextRequest) {
  const streamerId = req.nextUrl.searchParams.get("streamerId") || "";
  const streamer = db.getStreamer(streamerId);

  if (streamer?.isLive) {
    return NextResponse.json({
      mode: "live",
      streamer,
      playbackUrl: streamer.cloudflareLiveInputId
        ? `https://${process.env.CLOUDFLARE_CUSTOMER_CODE || "customer"}.cloudflarestream.com/${streamer.cloudflareLiveInputId}/manifest/video.m3u8`
        : null,
    });
  }

  // Verifica schedule
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

  // Fallback: primeiro slot ou nada
  return NextResponse.json({
    mode: "idle",
    message: "Nenhuma programação ativa no momento",
  });
}
