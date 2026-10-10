import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getPlaybackUrl } from "@/lib/cloudflare/stream";

export async function POST(req: NextRequest) {
  try {
    const { streamerId, title, category, name, username } = await req.json();
    if (!streamerId) {
      return NextResponse.json({ error: "streamerId obrigatório" }, { status: 400 });
    }

    db.ensureStreamer(streamerId, { name, username });
    const streamer = db.getStreamer(streamerId)!;

    if (!streamer.cloudflareLiveInputId) {
      return NextResponse.json(
        { error: "Gere a chave de stream no Studio antes de transmitir." },
        { status: 400 }
      );
    }

    const updated = db.upsertStreamer({
      id: streamerId,
      isLive: true,
      liveTitle: (title || "Live na AqTv").slice(0, 140),
      liveCategory: category || "Just Chatting",
      liveStartedAt: new Date().toISOString(),
      viewers: 0,
      likes: 0,
    });

    db.addSession(streamerId, {
      id: `sess-${Date.now()}`,
      streamerId,
      title: updated.liveTitle!,
      category: updated.liveCategory!,
      startedAt: updated.liveStartedAt!,
      peakViewers: 0,
      totalLikes: 0,
      playbackUrl: getPlaybackUrl(streamer.cloudflareLiveInputId),
    });

    return NextResponse.json({
      ok: true,
      isLive: true,
      playbackUrl: getPlaybackUrl(streamer.cloudflareLiveInputId),
      streamer: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { streamerId } = await req.json();
    if (!streamerId) {
      return NextResponse.json({ error: "streamerId obrigatório" }, { status: 400 });
    }

    db.endSession(streamerId);
    db.upsertStreamer({
      id: streamerId,
      isLive: false,
      liveTitle: undefined,
      liveCategory: undefined,
      liveStartedAt: undefined,
      viewers: 0,
    });

    return NextResponse.json({ ok: true, isLive: false });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
